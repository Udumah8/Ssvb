/**
 * Core type definitions for SVBB
 */

// Wallet Types
export interface WalletInfo {
  id: string;
  publicKey: string;
  privateKeyEncrypted: string;
  status: WalletStatus;
  balance: number;
  totalVolume: number;
  transactionCount: number;
  lastActivity: Date;
  createdAt: Date;
}

export type WalletStatus = 'active' | 'cooling' | 'paused' | 'recovering';

export interface MasterWallet extends WalletInfo {
  type: 'master';
}

export interface BurnerWallet extends WalletInfo {
  type: 'burner';
  coolingUntil?: Date;
}

// Campaign Types
export interface Campaign {
  id: string;
  name: string;
  tokenMint: string;
  strategy: CampaignStrategy;
  status: CampaignStatus;
  budget: CampaignBudget;
  realism: RealismSettings;
  metrics: CampaignMetrics;
  wallets: string[];
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  endedAt?: Date;
}

export type CampaignStrategy = 'drip' | 'burst' | 'volume_only' | 'market_maker';

export type CampaignStatus = 'draft' | 'pending' | 'running' | 'paused' | 'completed' | 'stopped' | 'killed';

export interface CampaignBudget {
  daily: number;
  total: number;
  perHour: number;
  spent: number;
  spentToday: number;
  spentThisHour: number;
}

export interface RealismSettings {
  walletCount: number;
  minDelay: number;
  maxDelay: number;
  buyRatio: number;
  minSlippage: number;
  maxSlippage: number;
  minPriorityFee: number;
  maxPriorityFee: number;
}

export interface CampaignMetrics {
  volume: number;
  transactionCount: number;
  makerCount: number;
  buyCount: number;
  sellCount: number;
  totalFees: number;
  averagePriceImpact: number;
  lastUpdated: Date;
}

// Transaction Types
export interface Transaction {
  id: string;
  campaignId: string;
  walletId: string;
  signature: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  slippage: number;
  priorityFee: number;
  tip: number;
  status: TransactionStatus;
  priceImpact: number;
  timestamp: Date;
}

export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

// MEV Types
export type MEVProvider = 'jito' | 'nozomi' | 'astralane';

export interface MEVConfig {
  provider: MEVProvider;
  region?: string;
  uuid?: string;
  apiKey?: string;
}

export type JitoRegion = 
  | 'MAINNET' 
  | 'AMS' 
  | 'DUB' 
  | 'FRA' 
  | 'LON' 
  | 'NY' 
  | 'SLC' 
  | 'SG' 
  | 'TYO';

// Trade Types
export interface TradeParams {
  market: string;
  wallet: string;
  mint: string;
  amount: number;
  slippage: number;
  priorityFeeSol: number;
  tipAmountSol: number;
  sender?: string;
  region?: string;
  antimev?: boolean;
  skipSimulation?: boolean;
}

export interface TradeResult {
  signature: string;
  status: 'confirmed' | 'failed';
  price: number;
  priceImpact: number;
  fees: number;
  timestamp: Date;
}

// Configuration Types
export interface AppConfig {
  rpcUrl: string;
  mev: MEVConfig;
  notifications: NotificationConfig;
}

export interface NotificationConfig {
  email?: string;
  telegramWebhook?: string;
  alertsEnabled: boolean;
}

// Strategy Configuration
export interface StrategyConfig {
  type: CampaignStrategy;
  name: string;
  description: string;
  defaultSettings: Partial<RealismSettings>;
  transactionsPerMinute: {
    min: number;
    max: number;
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Entropy Score
export interface EntropyScore {
  score: number;
  detectedPatterns: string[];
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}
