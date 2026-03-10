#!/usr/bin/env node

/**
 * SVBB CLI - Command Line Interface for Solana Volume Booster Bot
 * 
 * Production-ready CLI for managing campaigns and wallets
 */

import { 
  createCampaign,
  startCampaign,
  pauseCampaign,
  resumeCampaign,
  stopCampaign,
  getCampaign,
  getAllCampaigns,
  STRATEGY_CONFIGS
} from '../lib/campaign';
import {
  generateKeypair,
  getAllWallets,
  getBurnerWalletsByStatus,
  createBurnerWallet,
  deleteWallet,
  getMasterWallet,
  setMasterWallet,
  type MasterWallet,
  type BurnerWallet
} from '../lib/wallet';
import type { Campaign, CampaignStrategy, WalletStatus } from '../src/types';

const args = process.argv.slice(2);
const command = args[0];

function printUsage(): void {
  console.log(`
Solana Volume Booster Bot (SVBB) CLI

Usage:
  svbb <module> <command> [options]

Modules:
  campaign    Manage volume campaigns
  wallet      Manage burner wallets

Campaign Commands:
  create <name> <tokenMint> <strategy> <budget>  Create a new campaign
  start <campaignId>                       Start a campaign
  stop <campaignId>                        Stop a campaign
  pause <campaignId>                        Pause a campaign
  resume <campaignId>                       Resume a campaign
  status <campaignId>                      Get campaign status
  list                                     List all campaigns

Wallet Commands:
  list                                      List all wallets
  list-active                               List active wallets
  list-cooling                              List cooling wallets
  generate                                  Generate new burner wallet
  remove <walletId>                         Remove a wallet

Examples:
  svbb campaign create "My Campaign" JUPyiwrYJFskUPiHa7hkeR8VUtkqjberbSOWd91pbT2a drip 10
  svbb campaign start campaign_123
  svbb campaign status campaign_123
  svbb wallet list
  svbb wallet generate
`);
}

function validateArgs(required: number, provided: number, command: string): boolean {
  if (provided < required) {
    console.error(`Error: ${command} requires ${required} argument(s)`);
    return false;
  }
  return true;
}

function formatCampaignTable(campaigns: Campaign[]): void {
  console.log('\nID            | Name                    | Token                         | Status   | Volume    | Spent');
  console.log('--------------|-------------------------|-------------------------------|----------|-----------|-------');
  
  campaigns.forEach(c => {
    const name = c.name.substring(0, 24).padEnd(24);
    const token = c.tokenMint.substring(0, 29).padEnd(29);
    const volume = c.metrics.volume.toFixed(2).padEnd(9);
    const spent = c.budget.spent.toFixed(2);
    
    console.log(
      `${c.id.substring(0, 14).padEnd(14)}| ${name}| ${token}| ${c.status.padEnd(10)}| ${volume}| ${spent}`
    );
  });
  
  console.log(`\nTotal: ${campaigns.length} campaigns`);
}

function formatWalletTable(wallets: (MasterWallet | BurnerWallet)[]): void {
  console.log('\nID                                    | Address                         | Status   | Balance  | Tx Count');
  console.log('--------------------------------------|---------------------------------|----------|----------|----------');
  
  wallets.forEach(w => {
    const id = w.id.substring(0, 38).padEnd(38);
    const address = w.address.substring(0, 33).padEnd(33);
    const balance = w.balance.toFixed(4).padEnd(8);
    const txCount = (w as BurnerWallet).transactionCount?.toString().padEnd(8) || '0'.padEnd(8);
    
    console.log(
      `${id}| ${address}| ${w.status.padEnd(8)}| ${balance}| ${txCount}`
    );
  });
  
  console.log(`\nTotal: ${wallets.length} wallets`);
}

// Campaign handlers
async function handleCampaignCreate(
  name: string,
  tokenMint: string,
  strategy: string,
  budget: number
): Promise<void> {
  // Validate strategy
  const validStrategies: CampaignStrategy[] = ['drip', 'burst', 'volume_only', 'market_maker'];
  if (!validStrategies.includes(strategy as CampaignStrategy)) {
    console.error(`Error: Invalid strategy "${strategy}"`);
    console.log(`Valid strategies: ${validStrategies.join(', ')}`);
    return;
  }
  
  console.log(`Creating campaign for token: ${tokenMint}`);
  console.log(`Strategy: ${strategy}`);
  console.log(`Budget: ${budget} SOL\n`);
  
  try {
    const campaign = await createCampaign(
      name,
      tokenMint,
      strategy as CampaignStrategy,
      {},
      { total: budget }
    );
    
    console.log(`✅ Campaign created successfully!`);
    console.log(`Campaign ID: ${campaign.id}`);
    console.log(`Name: ${campaign.name}`);
    console.log(`Token: ${campaign.tokenMint}`);
    console.log(`Strategy: ${campaign.strategy}`);
    console.log(`Status: ${campaign.status}`);
    console.log(`Budget: ${campaign.budget.total} SOL`);
    console.log(`\nTo start the campaign, run:`);
    console.log(`  svbb campaign start ${campaign.id}`);
  } catch (error) {
    console.error('Failed to create campaign:', error);
  }
}

async function handleCampaignStart(campaignId: string): Promise<void> {
  try {
    const success = await startCampaign(campaignId);
    if (success) {
      console.log(`✅ Campaign ${campaignId} started successfully!`);
    } else {
      console.error(`Failed to start campaign. Check if campaign exists and is in correct state.`);
    }
  } catch (error) {
    console.error('Error starting campaign:', error);
  }
}

function handleCampaignStop(campaignId: string): void {
  try {
    const success = stopCampaign(campaignId);
    if (success) {
      console.log(`🛑 Campaign ${campaignId} stopped successfully!`);
    } else {
      console.error(`Failed to stop campaign. Check if campaign exists and is running.`);
    }
  } catch (error) {
    console.error('Error stopping campaign:', error);
  }
}

function handleCampaignPause(campaignId: string): void {
  try {
    const success = pauseCampaign(campaignId);
    if (success) {
      console.log(`⏸️ Campaign ${campaignId} paused successfully!`);
    } else {
      console.error(`Failed to pause campaign. Check if campaign exists and is running.`);
    }
  } catch (error) {
    console.error('Error pausing campaign:', error);
  }
}

async function handleCampaignResume(campaignId: string): Promise<void> {
  try {
    const success = await resumeCampaign(campaignId);
    if (success) {
      console.log(`▶️ Campaign ${campaignId} resumed successfully!`);
    } else {
      console.error(`Failed to resume campaign. Check if campaign exists and is paused.`);
    }
  } catch (error) {
    console.error('Error resuming campaign:', error);
  }
}

function handleCampaignStatus(campaignId: string): void {
  const campaign = getCampaign(campaignId);
  
  if (!campaign) {
    console.error(`Campaign not found: ${campaignId}`);
    return;
  }
  
  console.log(`\n📊 Campaign Status: ${campaign.name}`);
  console.log('─'.repeat(50));
  console.log(`ID:         ${campaign.id}`);
  console.log(`Token:      ${campaign.tokenMint}`);
  console.log(`Strategy:   ${campaign.strategy}`);
  console.log(`Status:     ${campaign.status.toUpperCase()}`);
  console.log(`\n💰 Budget:`);
  console.log(`  Total:    ${campaign.budget.total} SOL`);
  console.log(`  Daily:    ${campaign.budget.daily} SOL`);
  console.log(`  Per Hour: ${campaign.budget.perHour} SOL`);
  console.log(`  Spent:    ${campaign.budget.spent} SOL`);
  console.log(`\n📈 Metrics:`);
  console.log(`  Volume:           ${campaign.metrics.volume.toFixed(4)} SOL`);
  console.log(`  Transactions:     ${campaign.metrics.transactionCount}`);
  console.log(`  Active Makers:     ${campaign.metrics.makerCount}`);
  console.log(`  Buy Count:        ${campaign.metrics.buyCount}`);
  console.log(`  Sell Count:      ${campaign.metrics.sellCount}`);
  console.log(`  Total Fees:       ${campaign.metrics.totalFees.toFixed(6)} SOL`);
  console.log(`  Avg Price Impact: ${campaign.metrics.averagePriceImpact.toFixed(2)}%`);
  
  const buyRatio = campaign.metrics.buyCount + campaign.metrics.sellCount > 0 
    ? campaign.metrics.buyCount / (campaign.metrics.buyCount + campaign.metrics.sellCount) 
    : 0;
  console.log(`  Buy/Sell Ratio:   ${(buyRatio * 100).toFixed(0)}% / ${((1 - buyRatio) * 100).toFixed(0)}%`);
  
  console.log(`\n⏰ Timeline:`);
  if (campaign.createdAt) {
    console.log(`  Created: ${campaign.createdAt.toISOString()}`);
  }
  if (campaign.startedAt) {
    console.log(`  Started: ${campaign.startedAt.toISOString()}`);
  }
  if (campaign.updatedAt) {
    console.log(`  Updated: ${campaign.updatedAt.toISOString()}`);
  }
}

function handleCampaignList(): void {
  const campaigns = getAllCampaigns();
  
  if (campaigns.length === 0) {
    console.log('No campaigns found. Create one with:');
    console.log('  svbb campaign create <name> <token> <strategy> <budget>');
    return;
  }
  
  console.log(`\n📋 Found ${campaigns.length} campaign(s):`);
  formatCampaignTable(campaigns);
}

// Wallet handlers
function handleWalletList(): void {
  const wallets = getAllWallets();
  
  if (wallets.length === 0) {
    console.log('No wallets found.');
    return;
  }
  
  console.log(`\n📋 Found ${wallets.length} wallet(s):`);
  formatWalletTable(wallets);
}

function handleWalletListByStatus(status: WalletStatus): void {
  const wallets = getBurnerWalletsByStatus(status);
  
  if (wallets.length === 0) {
    console.log(`No wallets with status: ${status}`);
    return;
  }
  
  console.log(`\n📋 Found ${wallets.length} wallet(s) with status "${status}":`);
  formatWalletTable(wallets);
}

async function handleWalletGenerate(): Promise<void> {
  try {
    const wallet = await createBurnerWallet();
    console.log(`✅ New burner wallet generated!`);
    console.log(`Wallet ID:  ${wallet.id}`);
    console.log(`Address:    ${wallet.address}`);
    console.log(`Status:     ${wallet.status}`);
    console.log(`Balance:    ${wallet.balance} SOL`);
  } catch (error) {
    console.error('Error generating wallet:', error);
  }
}

function handleWalletRemove(walletId: string): void {
  const success = deleteWallet(walletId);
  if (success) {
    console.log(`✅ Wallet ${walletId} removed successfully!`);
  } else {
    console.error(`Failed to remove wallet. Check if wallet exists.`);
  }
}

function handleMasterWallet(): void {
  const master = getMasterWallet();
  
  if (!master) {
    console.log('No master wallet configured.');
    console.log('Set it up via the web dashboard or API.');
    return;
  }
  
  console.log(`\n👤 Master Wallet:`);
  console.log(`  Address: ${master.address}`);
  console.log(`  Balance: ${master.balance} SOL`);
}

// Main execution
async function main(): Promise<void> {
  // Show help if no command
  if (!command || command === '--help' || command === '-h') {
    printUsage();
    process.exit(0);
  }
  
  // Validate command structure
  if (!command || !['campaign', 'wallet'].includes(command)) {
    console.error('Error: Please specify a module (campaign or wallet)');
    console.log('Run "svbb --help" for usage information');
    process.exit(1);
  }
  
  const cmd = args[1];
  
  if (command === 'campaign') {
    if (!cmd) {
      console.error('Error: Please specify a campaign command');
      console.log('Run "svbb campaign --help" for available commands');
      process.exit(1);
    }
    
    switch (cmd) {
      case 'create':
        if (!validateArgs(4, args.length - 2, 'campaign create')) {
          printUsage();
          process.exit(1);
        }
        await handleCampaignCreate(args[2], args[3], args[4], parseFloat(args[5]));
        break;
        
      case 'start':
        if (!validateArgs(1, args.length - 2, 'campaign start')) process.exit(1);
        await handleCampaignStart(args[2]);
        break;
        
      case 'stop':
        if (!validateArgs(1, args.length - 2, 'campaign stop')) process.exit(1);
        handleCampaignStop(args[2]);
        break;
        
      case 'pause':
        if (!validateArgs(1, args.length - 2, 'campaign pause')) process.exit(1);
        handleCampaignPause(args[2]);
        break;
        
      case 'resume':
        if (!validateArgs(1, args.length - 2, 'campaign resume')) process.exit(1);
        await handleCampaignResume(args[2]);
        break;
        
      case 'status':
        if (!validateArgs(1, args.length - 2, 'campaign status')) process.exit(1);
        handleCampaignStatus(args[2]);
        break;
        
      case 'list':
        handleCampaignList();
        break;
        
      default:
        console.error(`Unknown campaign command: ${cmd}`);
        console.log('Run "svbb --help" for usage information');
        process.exit(1);
    }
  } else if (command === 'wallet') {
    if (!cmd) {
      console.error('Error: Please specify a wallet command');
      console.log('Run "svbb wallet --help" for available commands');
      process.exit(1);
    }
    
    switch (cmd) {
      case 'list':
        handleWalletList();
        break;
        
      case 'list-active':
        handleWalletListByStatus('active');
        break;
        
      case 'list-cooling':
        handleWalletListByStatus('cooling');
        break;
        
      case 'generate':
        await handleWalletGenerate();
        break;
        
      case 'remove':
        if (!validateArgs(1, args.length - 2, 'wallet remove')) process.exit(1);
        handleWalletRemove(args[2]);
        break;
        
      case 'master':
        handleMasterWallet();
        break;
        
      default:
        console.error(`Unknown wallet command: ${cmd}`);
        console.log('Run "svbb --help" for usage information');
        process.exit(1);
    }
  }
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
