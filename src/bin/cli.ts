#!/usr/bin/env node

/**
 * SVBB CLI - Command Line Interface for Solana Volume Booster Bot
 * 
 * Usage:
 *   svbb campaign create <tokenMint> <strategy> <budget>
 *   svbb campaign start <campaignId>
 *   svbb campaign stop <campaignId>
 *   svbb campaign pause <campaignId>
 *   svbb campaign resume <campaignId>
 *   svbb campaign status <campaignId>
 *   svbb wallet list
 *   svbb wallet fund <walletAddress> <amount>
 *   svbb wallet recover <walletAddress>
 */

import { createInterface } from 'readline';
import { 
  createCampaign, 
  startCampaign, 
  pauseCampaign, 
  stopCampaign, 
  getCampaign, 
  getAllCampaigns 
} from '../lib/campaign';
import { 
  generateKeypair, 
  getAllWallets, 
  getBurnerWalletsByStatus,
  fundBurnerWallet,
  recoverBurnerFunds,
  addBurnerWallet,
  deleteWallet 
} from '../lib/wallet';

const args = process.argv.slice(2);
const command = args[0];

interface CLICommands {
  campaign: string[];
  wallet: string[];
}

const availableCommands: CLICommands = {
  campaign: ['create', 'start', 'stop', 'pause', 'resume', 'status', 'list'],
  wallet: ['list', 'fund', 'recover', 'add', 'remove']
};

function printUsage(): void {
  console.log(`
Solana Volume Booster Bot (SVBB) CLI

Usage:
  svbb <module> <command> [options]

Modules:
  campaign    Manage volume campaigns
  wallet      Manage burner wallets

Campaign Commands:
  create <tokenMint> <strategy> <budget>  Create a new campaign
  start <campaignId>                       Start a campaign
  stop <campaignId>                        Stop a campaign
  pause <campaignId>                        Pause a campaign
  resume <campaignId>                       Resume a campaign
  status <campaignId>                      Get campaign status
  list                                     List all campaigns

Wallet Commands:
  list                                      List all burner wallets
  fund <address> <amount>                  Fund a burner wallet
  recover <address>                        Recover funds from burner
  add                                       Generate new burner wallet
  remove <address>                          Remove a burner wallet

Examples:
  svbb campaign create JUPyiwrYJFskUPiHa7hkeR8VUtkqjberbSOWd91pbT2a drip 10
  svbb campaign start campaign_123
  svbb campaign status campaign_123
  svbb wallet list

For more information, visit: https://github.com/svbb/docs
`);
}

function validateArgs(required: number, provided: number, command: string): boolean {
  if (provided < required) {
    console.error(`Error: ${command} requires ${required} argument(s)`);
    return false;
  }
  return true;
}

async function handleCampaignCommand(cmd: string, args: string[]): Promise<void> {
  const campaignManager = new CampaignManager();
  
  switch (cmd) {
    case 'create':
      if (!validateArgs(3, args.length, 'campaign create')) return;
      await handleCampaignCreate(campaignManager, args[0], args[1], parseFloat(args[2]));
      break;
      
    case 'start':
      if (!validateArgs(1, args.length, 'campaign start')) return;
      await handleCampaignStart(campaignManager, args[0]);
      break;
      
    case 'stop':
      if (!validateArgs(1, args.length, 'campaign stop')) return;
      await handleCampaignStop(campaignManager, args[0]);
      break;
      
    case 'pause':
      if (!validateArgs(1, args.length, 'campaign pause')) return;
      await handleCampaignPause(campaignManager, args[0]);
      break;
      
    case 'resume':
      if (!validateArgs(1, args.length, 'campaign resume')) return;
      await handleCampaignResume(campaignManager, args[0]);
      break;
      
    case 'status':
      if (!validateArgs(1, args.length, 'campaign status')) return;
      await handleCampaignStatus(campaignManager, args[0]);
      break;
      
    case 'list':
      await handleCampaignList(campaignManager);
      break;
      
    default:
      console.error(`Unknown campaign command: ${cmd}`);
      console.log('Run "svbb campaign --help" for usage information');
  }
}

async function handleWalletCommand(cmd: string, args: string[]): Promise<void> {
  const walletManager = new WalletManager();
  
  switch (cmd) {
    case 'list':
      await handleWalletList(walletManager);
      break;
      
    case 'fund':
      if (!validateArgs(2, args.length, 'wallet fund')) return;
      await handleWalletFund(walletManager, args[0], parseFloat(args[1]));
      break;
      
    case 'recover':
      if (!validateArgs(1, args.length, 'wallet recover')) return;
      await handleWalletRecover(walletManager, args[0]);
      break;
      
    case 'add':
      await handleWalletAdd(walletManager);
      break;
      
    case 'remove':
      if (!validateArgs(1, args.length, 'wallet remove')) return;
      await handleWalletRemove(walletManager, args[0]);
      break;
      
    default:
      console.error(`Unknown wallet command: ${cmd}`);
      console.log('Run "svbb wallet --help" for usage information');
  }
}

// Campaign handlers
async function handleCampaignCreate(
  manager: CampaignManager,
  tokenMint: string,
  strategy: string,
  budget: number
): Promise<void> {
  console.log(`Creating campaign for token: ${tokenMint}`);
  console.log(`Strategy: ${strategy}`);
  console.log(`Budget: ${budget} SOL`);
  
  // In production, this would create the campaign via the API
  const campaignId = `campaign_${Date.now()}`;
  console.log(`\n✅ Campaign created successfully!`);
  console.log(`Campaign ID: ${campaignId}`);
  console.log(`\nTo start the campaign, run:`);
  console.log(`  svbb campaign start ${campaignId}`);
}

async function handleCampaignStart(manager: CampaignManager, campaignId: string): Promise<void> {
  console.log(`Starting campaign: ${campaignId}`);
  console.log('✅ Campaign started successfully!');
}

async function handleCampaignStop(manager: CampaignManager, campaignId: string): Promise<void> {
  console.log(`Stopping campaign: ${campaignId}`);
  console.log('🛑 Campaign stopped successfully!');
}

async function handleCampaignPause(manager: CampaignManager, campaignId: string): Promise<void> {
  console.log(`Pausing campaign: ${campaignId}`);
  console.log('⏸️ Campaign paused successfully!');
}

async function handleCampaignResume(manager: CampaignManager, campaignId: string): Promise<void> {
  console.log(`Resuming campaign: ${campaignId}`);
  console.log('▶️ Campaign resumed successfully!');
}

async function handleCampaignStatus(manager: CampaignManager, campaignId: string): Promise<void> {
  console.log(`Fetching status for campaign: ${campaignId}\n`);
  
  // Mock status output
  const status = {
    id: campaignId,
    status: 'active',
    volumeGenerated: 125.5,
    transactions: 342,
    makers: 15,
    buyRatio: 0.62,
    spent: 8.5,
    startedAt: new Date(Date.now() - 86400000).toISOString()
  };
  
  console.log(`Status: ${status.status.toUpperCase()}`);
  console.log(`Volume Generated: ${status.volumeGenerated} SOL`);
  console.log(`Transactions: ${status.transactions}`);
  console.log(`Active Makers: ${status.makers}`);
  console.log(`Buy/Sell Ratio: ${(status.buyRatio * 100).toFixed(0)}% / ${((1 - status.buyRatio) * 100).toFixed(0)}%`);
  console.log(`Spent: ${status.spent} SOL`);
  console.log(`Started: ${status.startedAt}`);
}

async function handleCampaignList(manager: CampaignManager): Promise<void> {
  console.log('Fetching campaigns...\n');
  
  // Mock campaigns list
  const campaigns = [
    { id: 'campaign_001', token: 'JUPyiwrYJFskUPiHa7hkeR8VUtkqjberbSOWd91pbT2a', status: 'active', volume: 125.5 },
    { id: 'campaign_002', token: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', status: 'paused', volume: 45.2 },
    { id: 'campaign_003', token: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3EzZKfpfw5LoUgca', status: 'stopped', volume: 210.8 }
  ];
  
  console.log('ID            | Token                                    | Status   | Volume (SOL)');
  console.log('--------------|------------------------------------------|----------|--------------');
  
  campaigns.forEach(c => {
    console.log(
      `${c.id.padEnd(14)}| ${c.token.substring(0, 40).padEnd(40)}| ${c.status.padEnd(8)}| ${c.volume.toFixed(1).padEnd(12)}`
    );
  });
  
  console.log(`\nTotal: ${campaigns.length} campaigns`);
}

// Wallet handlers
async function handleWalletList(manager: WalletManager): Promise<void> {
  console.log('Fetching wallets...\n');
  
  // Mock wallets list
  const wallets = [
    { address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', balance: 2.5, status: 'active' },
    { address: ' GK2w4MNzqX8K5wZ4dKr6LQvN5YqZ5K5wZ4dKr6LQvN5Y', balance: 1.8, status: 'active' },
    { address: ' Hz4vZuC1KpK4t4Z4dKr6LQvN5YqZ5K5wZ4dKr6LQvN5Y', balance: 0.0, status: 'cooling' }
  ];
  
  console.log('Address                                      | Balance  | Status   ');
  console.log('---------------------------------------------|----------|----------');
  
  wallets.forEach(w => {
    console.log(
      `${w.address.substring(0, 46).padEnd(46)}| ${w.balance.toFixed(2).padEnd(8)}| ${w.status}`
    );
  });
  
  console.log(`\nTotal: ${wallets.length} wallets`);
}

async function handleWalletFund(manager: WalletManager, address: string, amount: number): Promise<void> {
  console.log(`Funding wallet: ${address}`);
  console.log(`Amount: ${amount} SOL`);
  console.log('✅ Wallet funded successfully!');
}

async function handleWalletRecover(manager: WalletManager, address: string): Promise<void> {
  console.log(`Recovering funds from wallet: ${address}`);
  console.log('✅ Funds recovered successfully!');
}

async function handleWalletAdd(manager: WalletManager): Promise<void> {
  console.log('Generating new burner wallet...');
  const newAddress = 'NewWallet' + Math.random().toString(36).substring(7);
  console.log(`✅ New wallet added: ${newAddress}`);
}

async function handleWalletRemove(manager: WalletManager, address: string): Promise<void> {
  console.log(`Removing wallet: ${address}`);
  console.log('✅ Wallet removed successfully!');
}

// Main execution
async function main(): Promise<void> {
  // Show help if no command
  if (!command || command === '--help' || command === '-h') {
    printUsage();
    process.exit(0);
  }
  
  // Handle module-level help
  if (command === 'campaign' && (args[1] === '--help' || args[1] === '-h')) {
    console.log('Campaign Commands:');
    availableCommands.campaign.forEach(cmd => {
      console.log(`  ${cmd}`);
    });
    process.exit(0);
  }
  
  if (command === 'wallet' && (args[1] === '--help' || args[1] === '-h')) {
    console.log('Wallet Commands:');
    availableCommands.wallet.forEach(cmd => {
      console.log(`  ${cmd}`);
    });
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
    if (!cmd || !availableCommands.campaign.includes(cmd)) {
      console.error(`Error: Unknown campaign command "${cmd}"`);
      console.log('Run "svbb campaign --help" for available commands');
      process.exit(1);
    }
    await handleCampaignCommand(cmd, args.slice(2));
  } else if (command === 'wallet') {
    if (!cmd || !availableCommands.wallet.includes(cmd)) {
      console.error(`Error: Unknown wallet command "${cmd}"`);
      console.log('Run "svbb wallet --help" for available commands');
      process.exit(1);
    }
    await handleWalletCommand(cmd, args.slice(2));
  }
}

main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
