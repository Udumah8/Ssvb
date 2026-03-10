/**
 * Campaign Management Module
 * 
 * Handles campaign creation, execution, and control
 */

import { v4 as uuidv4 } from 'uuid';
import type { 
  Campaign, 
  CampaignStrategy, 
  CampaignStatus, 
  CampaignBudget, 
  RealismSettings,
  CampaignMetrics,
  Transaction,
  StrategyConfig
} from '@/types';
import { 
  createBurnerWallets, 
  getNextAvailableWallet, 
  updateWalletStatus,
  incrementWalletStats,
  updateWalletBalance,
  getWallet 
} from './wallet';
import { SolanaTradeWrapper, getSolanaTrade } from './solana-trade';
import { 
  randomAmount, 
  randomDelay, 
  randomSlippage, 
  randomPriorityFee,
  randomTip,
  shouldBuy,
  shouldPause,
  shouldMicroFail,
  calculateTxPerMinute
} from './randomization';
import { calculateEntropyScore, autoAdjustParameters, suggestParameterAdjustments } from './entropy';

// In-memory storage (replace with database in production)
const campaigns = new Map<string, Campaign>();
const transactions = new Map<string, Transaction[]>();

// Campaign intervals (for stopping campaigns)
const campaignIntervals = new Map<string, NodeJS.Timeout>();

// Strategy configurations
export const STRATEGY_CONFIGS: Record<CampaignStrategy, StrategyConfig> = {
  drip: {
    type: 'drip',
    name: 'Drip / Steady Mode',
    description: 'Gradual 24/7 volume with 1-5 transactions per minute per wallet',
    defaultSettings: {
      minDelay: 12,
      maxDelay: 60,
      buyRatio: 0.6,
      minSlippage: 3,
      maxSlippage: 8,
      minPriorityFee: 0.0001,
      maxPriorityFee: 0.0005,
    },
    transactionsPerMinute: { min: 1, max: 5 },
  },
  burst: {
    type: 'burst',
    name: 'Burst / High-Intensity Mode',
    description: 'Short aggressive spikes with 10-50 transactions per minute',
    defaultSettings: {
      minDelay: 1.2,
      maxDelay: 6,
      buyRatio: 0.7,
      minSlippage: 5,
      maxSlippage: 12,
      minPriorityFee: 0.0005,
      maxPriorityFee: 0.001,
    },
    transactionsPerMinute: { min: 10, max: 50 },
  },
  volume_only: {
    type: 'volume_only',
    name: 'Volume-Only Focus',
    description: 'Maximize transaction count with micro-swaps',
    defaultSettings: {
      minDelay: 1,
      maxDelay: 3,
      buyRatio: 0.5,
      minSlippage: 1,
      maxSlippage: 5,
      minPriorityFee: 0.0001,
      maxPriorityFee: 0.0003,
    },
    transactionsPerMinute: { min: 20, max: 50 },
  },
  market_maker: {
    type: 'market_maker',
    name: 'Market Maker Style',
    description: 'Provide liquidity within price ranges (±3-10%)',
    defaultSettings: {
      minDelay: 6,
      maxDelay: 30,
      buyRatio: 0.55,
      minSlippage: 3,
      maxSlippage: 10,
      minPriorityFee: 0.0002,
      maxPriorityFee: 0.0008,
    },
    transactionsPerMinute: { min: 2, max: 10 },
  },
};

// Default realism settings
const DEFAULT_REALISM: RealismSettings = {
  walletCount: 100,
  minDelay: 10,
  maxDelay: 30,
  buyRatio: 0.6,
  minSlippage: 3,
  maxSlippage: 12,
  minPriorityFee: 0.0001,
  maxPriorityFee: 0.0005,
};

// Default budget
const DEFAULT_BUDGET: CampaignBudget = {
  daily: 10,
  total: 100,
  perHour: 2,
  spent: 0,
  spentToday: 0,
  spentThisHour: 0,
};

/**
 * Create a new campaign
 */
export async function createCampaign(
  name: string,
  tokenMint: string,
  strategy: CampaignStrategy,
  realism: Partial<RealismSettings> = {},
  budget: Partial<CampaignBudget> = {}
): Promise<Campaign> {
  const id = uuidv4();
  const now = new Date();
  
  // Merge defaults with provided settings
  const mergedRealism: RealismSettings = {
    ...DEFAULT_REALISM,
    ...realism,
  };
  
  const mergedBudget: CampaignBudget = {
    ...DEFAULT_BUDGET,
    ...budget,
  };
  
  // Create burner wallets
  const wallets = await createBurnerWallets(mergedRealism.walletCount);
  
  const campaign: Campaign = {
    id,
    name,
    tokenMint,
    strategy,
    status: 'draft',
    budget: mergedBudget,
    realism: mergedRealism,
    metrics: {
      volume: 0,
      transactionCount: 0,
      makerCount: wallets.length,
      buyCount: 0,
      sellCount: 0,
      totalFees: 0,
      averagePriceImpact: 0,
      lastUpdated: now,
    },
    wallets: wallets.map(w => w.id),
    createdAt: now,
    updatedAt: now,
  };
  
  campaigns.set(id, campaign);
  transactions.set(id, []);
  
  return campaign;
}

/**
 * Start a campaign
 */
export async function startCampaign(campaignId: string): Promise<boolean> {
  const campaign = campaigns.get(campaignId);
  if (!campaign) return false;
  
  if (campaign.status !== 'draft' && campaign.status !== 'paused') {
    return false;
  }
  
  campaign.status = 'running';
  campaign.startedAt = new Date();
  campaign.updatedAt = new Date();
  
  // Start the execution loop
  const intervalId = setInterval(() => {
    executeCampaignCycle(campaignId);
  }, 1000); // Check every second
  
  campaignIntervals.set(campaignId, intervalId);
  
  return true;
}

/**
 * Pause a campaign
 */
export function pauseCampaign(campaignId: string): boolean {
  const campaign = campaigns.get(campaignId);
  if (!campaign || campaign.status !== 'running') return false;
  
  campaign.status = 'paused';
  campaign.updatedAt = new Date();
  
  // Clear the interval
  const interval = campaignIntervals.get(campaignId);
  if (interval) {
    clearInterval(interval);
    campaignIntervals.delete(campaignId);
  }
  
  return true;
}

/**
 * Resume a campaign
 */
export async function resumeCampaign(campaignId: string): Promise<boolean> {
  const campaign = campaigns.get(campaignId);
  if (!campaign || campaign.status !== 'paused') return false;
  
  return startCampaign(campaignId);
}

/**
 * Stop a campaign
 */
export function stopCampaign(campaignId: string): boolean {
  const campaign = campaigns.get(campaignId);
  if (!campaign) return false;
  
  campaign.status = 'stopped';
  campaign.endedAt = new Date();
  campaign.updatedAt = new Date();
  
  // Clear the interval
  const interval = campaignIntervals.get(campaignId);
  if (interval) {
    clearInterval(interval);
    campaignIntervals.delete(campaignId);
  }
  
  return true;
}

/**
 * Kill a campaign (emergency stop)
 */
export function killCampaign(campaignId: string): boolean {
  const campaign = campaigns.get(campaignId);
  if (!campaign) return false;
  
  campaign.status = 'killed';
  campaign.endedAt = new Date();
  campaign.updatedAt = new Date();
  
  // Clear the interval
  const interval = campaignIntervals.get(campaignId);
  if (interval) {
    clearInterval(interval);
    campaignIntervals.delete(campaignId);
  }
  
  // Mark all wallets as recovering
  for (const walletId of campaign.wallets) {
    updateWalletStatus(walletId, 'recovering');
  }
  
  return true;
}

/**
 * Execute one cycle of the campaign
 */
async function executeCampaignCycle(campaignId: string): Promise<void> {
  const campaign = campaigns.get(campaignId);
  if (!campaign || campaign.status !== 'running') return;
  
  // Check budget limits
  if (checkBudgetLimits(campaign)) {
    stopCampaign(campaignId);
    return;
  }
  
  // Check entropy and auto-adjust if needed
  const campaignTxs = transactions.get(campaignId) || [];
  const entropy = calculateEntropyScore(campaignTxs);
  
  if (entropy.riskLevel === 'high') {
    const adjustments = suggestParameterAdjustments(
      campaign.realism.minDelay,
      campaign.realism.maxDelay,
      0.001, // minAmount - not in RealismSettings
      0.1,   // maxAmount - not in RealismSettings
      campaign.realism.buyRatio
    );
    campaign.realism = {
      ...campaign.realism,
      minDelay: adjustments.minDelay,
      maxDelay: adjustments.maxDelay,
      buyRatio: adjustments.buyRatio,
    };
  }
  
  // Get next available wallet
  const wallet = getNextAvailableWallet();
  if (!wallet) return;
  
  // Check if should pause (organic behavior)
  if (shouldPause(0.05)) {
    updateWalletStatus(wallet.id, 'cooling');
    return;
  }
  
  // Check if should simulate failure
  if (shouldMicroFail(0.02)) {
    return; // Skip this cycle
  }
  
  // Calculate transaction parameters
  const config = STRATEGY_CONFIGS[campaign.strategy];
  const txPerMinute = calculateTxPerMinute(campaign.strategy, campaign.wallets.length);
  const delayMs = (60000 / txPerMinute) * (0.5 + Math.random());
  
  // Wait for appropriate delay
  // (In practice, this would be handled by the interval timing)
  
  // Determine buy or sell
  const isBuy = shouldBuy(campaign.realism.buyRatio);
  
  // Randomize parameters
  const amount = randomAmount(
    0.001, // minimum 0.001 SOL
    0.1,   // maximum 0.1 SOL per tx
    'skewed'
  );
  const slippage = randomSlippage(campaign.realism.minSlippage, campaign.realism.maxSlippage);
  const priorityFee = randomPriorityFee(campaign.realism.minPriorityFee, campaign.realism.maxPriorityFee);
  const tip = randomTip(0.0001, 0.0005);
  
  try {
    const solanaTrade = getSolanaTrade();
    
    const result = isBuy 
      ? await solanaTrade.buy({
          market: campaign.tokenMint, // Would need proper market address
          wallet: {} as any, // Would get from wallet module
          mint: campaign.tokenMint,
          amount,
          slippage,
          priorityFeeSol: priorityFee,
          tipAmountSol: tip,
        })
      : await solanaTrade.sell({
          market: campaign.tokenMint,
          wallet: {} as any,
          mint: campaign.tokenMint,
          amount,
          slippage,
          priorityFeeSol: priorityFee,
          tipAmountSol: tip,
        });
    
    // Record transaction
    const tx: Transaction = {
      id: uuidv4(),
      campaignId,
      walletId: wallet.id,
      signature: result.signature,
      type: isBuy ? 'buy' : 'sell',
      amount,
      price: result.price,
      slippage,
      priorityFee,
      tip,
      status: result.status === 'confirmed' ? 'confirmed' : 'failed',
      priceImpact: result.priceImpact,
      timestamp: new Date(),
    };
    
    // Update metrics
    campaign.metrics.transactionCount++;
    campaign.metrics.volume += amount;
    campaign.metrics.totalFees += result.fees;
    
    if (isBuy) {
      campaign.metrics.buyCount++;
    } else {
      campaign.metrics.sellCount++;
    }
    
    campaign.metrics.lastUpdated = new Date();
    campaign.budget.spent += amount + result.fees;
    campaign.budget.spentToday += amount + result.fees;
    campaign.budget.spentThisHour += amount + result.fees;
    
    // Update wallet stats
    incrementWalletStats(wallet.id, amount);
    
    // Store transaction
    campaignTxs.push(tx);
    transactions.set(campaignId, campaignTxs);
    
  } catch (error) {
    console.error('Transaction failed:', error);
  }
}

/**
 * Check if budget limits are exceeded
 */
function checkBudgetLimits(campaign: Campaign): boolean {
  const { budget } = campaign;
  
  if (budget.spent >= budget.total) return true;
  if (budget.spentToday >= budget.daily) return true;
  if (budget.spentThisHour >= budget.perHour) return true;
  
  return false;
}

/**
 * Get campaign by ID
 */
export function getCampaign(id: string): Campaign | undefined {
  return campaigns.get(id);
}

/**
 * Get all campaigns
 */
export function getAllCampaigns(): Campaign[] {
  return Array.from(campaigns.values());
}

/**
 * Get campaign transactions
 */
export function getCampaignTransactions(campaignId: string): Transaction[] {
  return transactions.get(campaignId) || [];
}

/**
 * Delete a campaign
 */
export function deleteCampaign(campaignId: string): boolean {
  const campaign = campaigns.get(campaignId);
  if (!campaign) return false;
  
  // Stop if running
  if (campaign.status === 'running') {
    stopCampaign(campaignId);
  }
  
  campaigns.delete(campaignId);
  transactions.delete(campaignId);
  
  return true;
}

/**
 * Reset daily/hourly spend counters
 */
export function resetSpendCounters(): void {
  for (const campaign of campaigns.values()) {
    campaign.budget.spentToday = 0;
    campaign.budget.spentThisHour = 0;
  }
}

// Reset counters every hour
setInterval(resetSpendCounters, 60 * 60 * 1000);

// Reset daily counters at midnight
setInterval(resetSpendCounters, 24 * 60 * 60 * 1000);
