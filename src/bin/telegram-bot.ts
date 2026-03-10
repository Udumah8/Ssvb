/**
 * SVBB Telegram Bot
 * 
 * Production-ready Telegram bot for managing campaigns and notifications
 * 
 * Commands:
 * /start - Start the bot and subscribe to notifications
 * /stop - Stop receiving notifications
 * /status - Get bot and campaign status
 * /help - Show help message
 * /campaigns - List all campaigns
 * /campaign <id> - Get campaign details
 * /wallets - List all wallets
 */

import {
  getCampaign,
  getAllCampaigns,
  startCampaign,
  stopCampaign,
  pauseCampaign,
  resumeCampaign
} from '../lib/campaign';
import {
  getAllWallets,
  getBurnerWalletsByStatus,
  createBurnerWallet
} from '../lib/wallet';
import type { Campaign, CampaignStrategy, WalletStatus } from '../src/types';

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
    };
    text: string;
  };
  callback_query?: {
    id: string;
    from: {
      id: number;
      first_name: string;
      username?: string;
    };
    message: {
      chat: {
        id: number;
      };
      message_id: number;
    };
    data: string;
  };
}

interface TelegramBotConfig {
  token: string;
  allowedChatIds?: number[];
  notificationSettings: {
    campaignStarted: boolean;
    campaignStopped: boolean;
    campaignPaused: boolean;
    campaignResumed: boolean;
    campaignError: boolean;
    walletFunded: boolean;
    dailyReport: boolean;
  };
}

class TelegramBot {
  private token: string;
  private allowedChatIds: Set<number>;
  private config: TelegramBotConfig;
  private isRunning: boolean = false;
  private subscribedChats: Set<number> = new Set();
  private pollingOffset: number = 0;

  constructor(config: TelegramBotConfig) {
    this.token = config.token;
    this.allowedChatIds = new Set(config.allowedChatIds || []);
    this.config = config;
  }

  /**
   * Start the bot - long polling for updates
   */
  async start(): Promise<void> {
    console.log('🤖 Starting SVBB Telegram Bot...');
    
    // Verify bot token
    try {
      const botInfo = await this.apiCall('getMe', {});
      const username = (botInfo as any).result.username;
      console.log(`✅ Bot logged in as: @${username}`);
    } catch (error) {
      console.error('❌ Failed to verify bot token:', error);
      return;
    }
    
    this.isRunning = true;
    console.log('✅ Telegram Bot started! Send /start to enable notifications.');
    
    // Start polling
    this.poll();
  }

  /**
   * Stop the bot
   */
  stop(): void {
    console.log('🛑 Stopping Telegram Bot...');
    this.isRunning = false;
  }

  /**
   * Long polling loop
   */
  private async poll(): Promise<void> {
    while (this.isRunning) {
      try {
        const updates = await this.getUpdates();
        for (const update of updates) {
          await this.handleUpdate(update);
          this.pollingOffset = update.update_id + 1;
        }
      } catch (error) {
        console.error('Polling error:', error);
        await this.sleep(5000); // Wait 5 seconds before retry
      }
    }
  }

  /**
   * Get updates from Telegram
   */
  private async getUpdates(): Promise<TelegramUpdate[]> {
    try {
      const response = await this.apiCall('getUpdates', {
        offset: this.pollingOffset,
        timeout: 30,
        limit: 100
      });
      return (response as any).result || [];
    } catch {
      return [];
    }
  }

  /**
   * Handle incoming updates
   */
  async handleUpdate(update: TelegramUpdate): Promise<void> {
    if (!this.isRunning) return;

    if (update.message) {
      await this.handleMessage(update.message);
    }
  }

  /**
   * Handle incoming messages
   */
  async handleMessage(message: TelegramUpdate['message']): Promise<void> {
    if (!message) return;

    const chatId = message.chat.id;
    const text = message.text || '';
    const user = message.from;

    console.log(`📩 Message from ${user?.first_name} (${chatId}): ${text}`);

    // Check if chat is allowed (if restrictions are set)
    if (this.allowedChatIds.size > 0 && !this.allowedChatIds.has(chatId)) {
      console.log(`⚠️ Unauthorized access attempt from chat ${chatId}`);
      return;
    }

    const command = text.startsWith('/') ? text.slice(1).toLowerCase() : text.toLowerCase();
    const parts = command.split(' ');
    const cmd = parts[0];
    const args = parts.slice(1);

    switch (cmd) {
      case 'start':
        await this.handleStart(chatId, user?.first_name || 'User');
        break;
      case 'stop':
        await this.handleStop(chatId);
        break;
      case 'status':
        await this.handleStatus(chatId);
        break;
      case 'help':
        await this.handleHelp(chatId);
        break;
      case 'campaigns':
        await this.handleListCampaigns(chatId);
        break;
      case 'campaign':
        await this.handleCampaignDetails(chatId, args[0]);
        break;
      case 'wallets':
        await this.handleListWallets(chatId);
        break;
      case 'wallet':
        await this.handleWalletDetails(chatId, args[0]);
        break;
      default:
        await this.sendMessage(chatId, `Unknown command: /${cmd}\nUse /help for available commands.`);
    }
  }

  /**
   * Handle /start command
   */
  async handleStart(chatId: number, firstName: string): Promise<void> {
    this.subscribedChats.add(chatId);
    
    const welcomeMessage = `👋 *Welcome to SVBB Bot, ${firstName}!*

I'll help you monitor your volume campaigns and send notifications.

*Available Commands:*

/start - Start receiving notifications
/stop - Unsubscribe from notifications  
/status - Check bot and campaign status
/help - Show this help message
/campaigns - List all campaigns
/campaign <id> - Get campaign details
/wallets - List all wallets

You're now subscribed to campaign notifications! ✅`;

    await this.sendMessage(chatId, welcomeMessage);
  }

  /**
   * Handle /stop command
   */
  async handleStop(chatId: number): Promise<void> {
    this.subscribedChats.delete(chatId);
    await this.sendMessage(chatId, '🛑 You have been unsubscribed from notifications.');
  }

  /**
   * Handle /status command
   */
  async handleStatus(chatId: number): Promise<void> {
    const campaigns = getAllCampaigns();
    const activeCampaigns = campaigns.filter(c => c.status === 'running').length;
    const totalVolume = campaigns.reduce((sum, c) => sum + c.metrics.volume, 0);
    const wallets = getAllWallets();
    const activeWallets = wallets.filter(w => w.status === 'active').length;

    const statusMessage = `*🤖 Bot Status:*

*Status:* ${this.isRunning ? '🟢 Running' : '🔴 Stopped'}
*Subscribers:* ${this.subscribedChats.size}

*📊 Campaign Stats:*
- Total Campaigns: ${campaigns.length}
- Active: ${activeCampaigns}
- Total Volume: ${totalVolume.toFixed(2)} SOL

*💰 Wallet Stats:*
- Total Wallets: ${wallets.length}
- Active: ${activeWallets}

*⚙️ Notification Settings:*
- Campaign Started: ${this.config.notificationSettings.campaignStarted ? '✅' : '❌'}
- Campaign Stopped: ${this.config.notificationSettings.campaignStopped ? '✅' : '❌'}
- Campaign Paused: ${this.config.notificationSettings.campaignPaused ? '✅' : '❌'}
- Campaign Resumed: ${this.config.notificationSettings.campaignResumed ? '✅' : '❌'}
- Campaign Errors: ${this.config.notificationSettings.campaignError ? '✅' : '❌'}`;

    await this.sendMessage(chatId, statusMessage);
  }

  /**
   * Handle /help command
   */
  async handleHelp(chatId: number): Promise<void> {
    const helpMessage = `*📖 SVBB Bot Help*

*Commands:*

/start - Subscribe to notifications
/stop - Unsubscribe from notifications
/status - Check bot and campaign status
/help - Show this help message

*Campaign Management:*
/campaigns - List all campaigns
/campaign <id> - Show campaign details

*Wallet Management:*
/wallets - List all wallets
/wallet <id> - Show wallet details

*Examples:*
/campaigns
/campaign abc123
/wallets`;

    await this.sendMessage(chatId, helpMessage);
  }

  /**
   * Handle /campaigns command
   */
  async handleListCampaigns(chatId: number): Promise<void> {
    const campaigns = getAllCampaigns();
    
    if (campaigns.length === 0) {
      await this.sendMessage(chatId, 'No campaigns found. Create one using the CLI or web dashboard.');
      return;
    }

    let message = '*📊 Campaigns:*\n\n';

    campaigns.forEach(c => {
      const statusEmoji = c.status === 'running' ? '🟢' : 
                          c.status === 'paused' ? '🟡' : 
                          c.status === 'stopped' ? '🔴' : '⚪';
      const buyCount = c.metrics.buyCount;
      const sellCount = c.metrics.sellCount;
      const total = buyCount + sellCount;
      const buyRatio = total > 0 ? ((buyCount / total) * 100).toFixed(0) : 0;
      
      message += `${statusEmoji} *${c.name}*\n`;
      message += `   ID: \`${c.id}\`\n`;
      message += `   Strategy: ${c.strategy}\n`;
      message += `   Status: ${c.status}\n`;
      message += `   Volume: ${c.metrics.volume.toFixed(2)} SOL\n`;
      message += `   Transactions: ${c.metrics.transactionCount}\n`;
      message += `   Buy/Sell: ${buyRatio}% / ${(100 - parseInt(buyRatio)).toFixed(0)}%\n`;
      message += `   Spent: ${c.budget.spent.toFixed(2)} / ${c.budget.total} SOL\n\n`;
    });

    await this.sendMessage(chatId, message);
  }

  /**
   * Handle /campaign <id> command
   */
  async handleCampaignDetails(chatId: number, campaignId?: string): Promise<void> {
    if (!campaignId) {
      await this.sendMessage(chatId, 'Please provide a campaign ID.\nUsage: /campaign <id>');
      return;
    }

    const campaign = getCampaign(campaignId);
    
    if (!campaign) {
      await this.sendMessage(chatId, `Campaign not found: ${campaignId}`);
      return;
    }

    const buyCount = campaign.metrics.buyCount;
    const sellCount = campaign.metrics.sellCount;
    const total = buyCount + sellCount;
    const buyRatio = total > 0 ? ((buyCount / total) * 100).toFixed(0) : 0;

    const details = `*📈 Campaign: ${campaign.name}*

*ID:* \`${campaign.id}\`
*Token:* \`${campaign.tokenMint}\`
*Strategy:* ${campaign.strategy}
*Status:* ${campaign.status.toUpperCase()}

*💰 Budget:*
- Total: ${campaign.budget.total} SOL
- Daily: ${campaign.budget.daily} SOL
- Spent: ${campaign.budget.spent.toFixed(2)} SOL
- Remaining: ${(campaign.budget.total - campaign.budget.spent).toFixed(2)} SOL

*📊 Metrics:*
- Volume: ${campaign.metrics.volume.toFixed(4)} SOL
- Transactions: ${campaign.metrics.transactionCount}
- Active Makers: ${campaign.metrics.makerCount}
- Buy: ${buyCount} (${buyRatio}%)
- Sell: ${sellCount} (${(100 - parseInt(buyRatio)).toFixed(0)}%)
- Total Fees: ${campaign.metrics.totalFees.toFixed(6)} SOL
- Avg Price Impact: ${campaign.metrics.averagePriceImpact.toFixed(2)}%

*⏰ Timeline:*
- Created: ${campaign.createdAt?.toISOString() || 'N/A'}
- Started: ${campaign.startedAt?.toISOString() || 'N/A'}
- Updated: ${campaign.updatedAt?.toISOString() || 'N/A'}`;

    await this.sendMessage(chatId, details);
  }

  /**
   * Handle /wallets command
   */
  async handleListWallets(chatId: number): Promise<void> {
    const wallets = getAllWallets();
    
    if (wallets.length === 0) {
      await this.sendMessage(chatId, 'No wallets found.');
      return;
    }

    const activeWallets = wallets.filter(w => w.status === 'active');
    const coolingWallets = wallets.filter(w => w.status === 'cooling');
    const pausedWallets = wallets.filter(w => w.status === 'paused');

    let message = `*💼 Wallets:*\n\n`;
    message += `*Total:* ${wallets.length}\n`;
    message += `*Active:* ${activeWallets.length}\n`;
    message += `*Cooling:* ${coolingWallets.length}\n`;
    message += `*Paused:* ${pausedWallets.length}\n\n`;

    if (wallets.length <= 20) {
      message += '*Recent Wallets:*\n';
      wallets.slice(0, 10).forEach(w => {
        const statusEmoji = w.status === 'active' ? '🟢' : 
                            w.status === 'cooling' ? '🟡' : '🔴';
        message += `${statusEmoji} \`${w.address.slice(0, 20)}...\` - ${w.balance.toFixed(4)} SOL\n`;
      });
    }

    await this.sendMessage(chatId, message);
  }

  /**
   * Handle /wallet <id> command
   */
  async handleWalletDetails(chatId: number, walletId?: string): Promise<void> {
    if (!walletId) {
      await this.sendMessage(chatId, 'Please provide a wallet ID or address.\nUsage: /wallet <id_or_address>');
      return;
    }

    const wallets = getAllWallets();
    const wallet = wallets.find(w => w.id === walletId || w.address === walletId);
    
    if (!wallet) {
      await this.sendMessage(chatId, `Wallet not found: ${walletId}`);
      return;
    }

    const details = `*💰 Wallet Details:*

*ID:* \`${wallet.id}\`
*Address:* \`${wallet.address}\`
*Status:* ${wallet.status.toUpperCase()}
*Balance:* ${wallet.balance.toFixed(4)} SOL`;

    await this.sendMessage(chatId, details);
  }

  /**
   * Send a message to a chat
   */
  async sendMessage(chatId: number, text: string): Promise<void> {
    try {
      await this.apiCall('sendMessage', {
        chat_id: chatId,
        text,
        parse_mode: 'Markdown'
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }

  /**
   * Broadcast a message to all subscribed chats
   */
  async broadcast(text: string): Promise<void> {
    for (const chatId of this.subscribedChats) {
      await this.sendMessage(chatId, text);
    }
  }

  /**
   * Notification methods for campaign events
   */
  async notifyCampaignStarted(campaignId: string): Promise<void> {
    if (!this.config.notificationSettings.campaignStarted) return;
    
    const campaign = getCampaign(campaignId);
    if (!campaign) return;

    const message = `🟢 *Campaign Started*

*${campaign.name}* is now running!

*Strategy:* ${campaign.strategy}
*Budget:* ${campaign.budget.total} SOL`;

    await this.broadcast(message);
  }

  async notifyCampaignStopped(campaignId: string): Promise<void> {
    if (!this.config.notificationSettings.campaignStopped) return;
    
    const campaign = getCampaign(campaignId);
    if (!campaign) return;

    const message = `🔴 *Campaign Stopped*

*${campaign.name}* has been stopped.

*Final Volume:* ${campaign.metrics.volume.toFixed(2)} SOL
*Transactions:* ${campaign.metrics.transactionCount}`;

    await this.broadcast(message);
  }

  async notifyCampaignPaused(campaignId: string): Promise<void> {
    if (!this.config.notificationSettings.campaignPaused) return;
    
    const campaign = getCampaign(campaignId);
    if (!campaign) return;

    const message = `⏸️ *Campaign Paused*

*${campaign.name}* has been paused.

*Current Volume:* ${campaign.metrics.volume.toFixed(2)} SOL`;

    await this.broadcast(message);
  }

  async notifyCampaignResumed(campaignId: string): Promise<void> {
    if (!this.config.notificationSettings.campaignResumed) return;
    
    const campaign = getCampaign(campaignId);
    if (!campaign) return;

    const message = `▶️ *Campaign Resumed*

*${campaign.name}* has been resumed.`;

    await this.broadcast(message);
  }

  async notifyError(campaignId: string, error: string): Promise<void> {
    if (!this.config.notificationSettings.campaignError) return;

    const message = `⚠️ *Campaign Error*

*Campaign:* \`${campaignId}\`
*Error:* ${error}`;

    await this.broadcast(message);
  }

  /**
   * Make API call to Telegram
   */
  private async apiCall(method: string, params: Record<string, any> = {}): Promise<any> {
    const url = `https://api.telegram.org/bot${this.token}/${method}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export { TelegramBot };
export type { TelegramBotConfig };

// CLI entry point
if (require.main === module) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!token) {
    console.error('❌ TELEGRAM_BOT_TOKEN environment variable is required');
    console.log('Set it with: export TELEGRAM_BOT_TOKEN=your_token');
    process.exit(1);
  }

  const allowedChatIds = process.env.TELEGRAM_ALLOWED_CHAT_IDS
    ? process.env.TELEGRAM_ALLOWED_CHAT_IDS.split(',').map(Number)
    : undefined;

  const bot = new TelegramBot({
    token,
    allowedChatIds,
    notificationSettings: {
      campaignStarted: true,
      campaignStopped: true,
      campaignPaused: true,
      campaignResumed: true,
      campaignError: true,
      walletFunded: true,
      dailyReport: true
    }
  });

  bot.start();

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    bot.stop();
    process.exit(0);
  });
}
