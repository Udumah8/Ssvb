/**
 * SVBB Telegram Bot
 * 
 * A Telegram bot for managing campaigns and receiving notifications
 * 
 * Commands:
 * /start - Start the bot
 * /stop - Stop receiving notifications
 * /status - Get bot status
 * /help - Show help message
 * /campaigns - List active campaigns
 * /campaign <id> - Get campaign details
 */

import { 
  getCampaign, 
  getAllCampaigns 
} from '../lib/campaign';
import { 
  getAllWallets, 
  generateKeypair 
} from '../lib/wallet';

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
  chatId?: number;
  notificationSettings: {
    campaignStarted: boolean;
    campaignStopped: boolean;
    campaignError: boolean;
    walletFunded: boolean;
    dailyReport: boolean;
  };
}

class TelegramBot {
  private token: string;
  private chatId?: number;
  private campaignManager: CampaignManager;
  private walletManager: WalletManager;
  private config: TelegramBotConfig;
  private isRunning: boolean = false;
  private subscribedChats: Set<number> = new Set();

  constructor(config: TelegramBotConfig) {
    this.token = config.token;
    this.chatId = config.chatId;
    this.config = config;
    this.campaignManager = new CampaignManager();
    this.walletManager = new WalletManager();
  }

  /**
   * Start the bot
   */
  async start(): Promise<void> {
    console.log('🤖 Starting SVBB Telegram Bot...');
    this.isRunning = true;
    
    // Verify bot token by getting bot info
    try {
      const botInfo = await this.apiCall('getMe', {});
      console.log(`✅ Bot logged in as: @${(botInfo as any).result.username}`);
    } catch (error) {
      console.error('❌ Failed to verify bot token:', error);
      return;
    }
    
    console.log('✅ Telegram Bot started successfully!');
    console.log('\n📱 Send /start to the bot to enable notifications.');
  }

  /**
   * Stop the bot
   */
  stop(): void {
    console.log('🛑 Stopping Telegram Bot...');
    this.isRunning = false;
  }

  /**
   * Handle incoming updates
   */
  async handleUpdate(update: TelegramUpdate): Promise<void> {
    if (!this.isRunning) return;

    if (update.message) {
      await this.handleMessage(update.message);
    } else if (update.callback_query) {
      await this.handleCallbackQuery(update.callback_query);
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

    // Remove leading slash
    const command = text.startsWith('/') ? text.slice(1) : text;
    const parts = command.split(' ');
    const cmd = parts[0].toLowerCase();
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
      default:
        await this.sendMessage(chatId, `Unknown command: /${cmd}\nUse /help for available commands.`);
    }
  }

  /**
   * Handle /start command
   */
  async handleStart(chatId: number, firstName: string): Promise<void> {
    this.subscribedChats.add(chatId);
    
    const welcomeMessage = `
👋 *Welcome to SVBB Bot, ${firstName}!*

I'll help you monitor your volume campaigns and send notifications.

*Available Commands:*

/start - Start receiving notifications
/stop - Stop receiving notifications
/status - Check bot status
/help - Show this help message
/campaigns - List all campaigns
/campaign <id> - Get campaign details

*Notification Settings:*
- Campaign started/stopped
- Campaign errors
- Wallet funded
- Daily reports

You're now subscribed to campaign notifications! ✅
    `.trim();

    await this.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
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
    const status = {
      bot: this.isRunning ? '🟢 Running' : '🔴 Stopped',
      subscribers: this.subscribedChats.size,
      notifications: this.config.notificationSettings
    };

    const statusMessage = `
*🤖 Bot Status:*

Status: ${status.bot}
Active Subscribers: ${status.subscribers}

*Notification Settings:*
- Campaign Started: ${status.notifications.campaignStarted ? '✅' : '❌'}
- Campaign Stopped: ${status.notifications.campaignStopped ? '✅' : '❌'}
- Campaign Errors: ${status.notifications.campaignError ? '✅' : '❌'}
- Wallet Funded: ${status.notifications.walletFunded ? '✅' : '❌'}
- Daily Report: ${status.notifications.dailyReport ? '✅' : '❌'}
    `.trim();

    await this.sendMessage(chatId, statusMessage, { parse_mode: 'Markdown' });
  }

  /**
   * Handle /help command
   */
  async handleHelp(chatId: number): Promise<void> {
    const helpMessage = `
*📖 SVBB Bot Help*

*Commands:*

/start - Subscribe to notifications
/stop - Unsubscribe from notifications
/status - Check bot and notification status
/help - Show this help message

*Campaign Management:*
/campaigns - List all campaigns
/campaign <id> - Show campaign details

*Examples:*
/campaigns
/campaign campaign_123

*Support:*
For more help, visit our documentation.
    `.trim();

    await this.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
  }

  /**
   * Handle /campaigns command
   */
  async handleListCampaigns(chatId: number): Promise<void> {
    // Mock campaigns data
    const campaigns = [
      { id: 'campaign_001', name: 'JUP Campaign', status: 'active', volume: 125.5 },
      { id: 'campaign_002', name: 'USDC Campaign', status: 'paused', volume: 45.2 },
      { id: 'campaign_003', name: 'mSOL Campaign', status: 'stopped', volume: 210.8 }
    ];

    let message = '*📊 Active Campaigns:*\n\n';

    campaigns.forEach(c => {
      const statusEmoji = c.status === 'active' ? '🟢' : c.status === 'paused' ? '🟡' : '🔴';
      message += `${statusEmoji} *${c.name}*\n`;
      message += `   ID: \`${c.id}\`\n`;
      message += `   Status: ${c.status}\n`;
      message += `   Volume: ${c.volume} SOL\n\n`;
    });

    await this.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  }

  /**
   * Handle /campaign command
   */
  async handleCampaignDetails(chatId: number, campaignId?: string): Promise<void> {
    if (!campaignId) {
      await this.sendMessage(chatId, 'Please provide a campaign ID.\nUsage: /campaign <id>');
      return;
    }

    // Mock campaign details
    const campaign = {
      id: campaignId,
      name: 'JUP Campaign',
      token: 'JUPyiwrYJFskUPiHa7hkeR8VUtkqjberbSOWd91pbT2a',
      status: 'active',
      strategy: 'drip',
      budget: 10,
      spent: 8.5,
      volume: 125.5,
      transactions: 342,
      makers: 15,
      buyRatio: 0.62,
      startedAt: new Date(Date.now() - 86400000).toISOString()
    };

    const details = `
*📈 Campaign: ${campaign.name}*

ID: \`${campaign.id}\`
Token: \`${campaign.token.substring(0, 20)}...\`
Status: ${campaign.status.toUpperCase()}
Strategy: ${campaign.strategy}

*Stats:*
💰 Budget: ${campaign.budget} SOL
💸 Spent: ${campaign.spent} SOL
📊 Volume: ${campaign.volume} SOL
🔢 Transactions: ${campaign.transactions}
👥 Active Makers: ${campaign.makers}
📈 Buy Ratio: ${(campaign.buyRatio * 100).toFixed(0)}%

*Timeline:*
Started: ${new Date(campaign.startedAt).toLocaleString()}
    `.trim();

    await this.sendMessage(chatId, details, { parse_mode: 'Markdown' });
  }

  /**
   * Handle callback queries (inline keyboard buttons)
   */
  async handleCallbackQuery(callback: TelegramUpdate['callback_query']): Promise<void> {
    if (!callback) return;

    const chatId = callback.message.chat.id;
    const data = callback.data;

    // Handle button callbacks
    if (data === 'refresh_status') {
      await this.handleStatus(chatId);
    } else if (data === 'list_campaigns') {
      await this.handleListCampaigns(chatId);
    }
  }

  /**
   * Send a message to a chat
   */
  async sendMessage(chatId: number, text: string, options?: { parse_mode?: string }): Promise<void> {
    try {
      await this.apiCall('sendMessage', {
        chat_id: chatId,
        text,
        parse_mode: options?.parse_mode || 'Markdown'
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }

  /**
   * Broadcast a message to all subscribed chats
   */
  async broadcast(text: string, options?: { parse_mode?: string }): Promise<void> {
    for (const chatId of this.subscribedChats) {
      await this.sendMessage(chatId, text, options);
    }
  }

  /**
   * Send campaign notification
   */
  async notifyCampaignStarted(campaignId: string, campaignName: string): Promise<void> {
    if (!this.config.notificationSettings.campaignStarted) return;

    const message = `
🟢 *Campaign Started*

*${campaignName}* is now running!

Campaign ID: \`${campaignId}\`
    `.trim();

    await this.broadcast(message);
  }

  /**
   * Send campaign stopped notification
   */
  async notifyCampaignStopped(campaignId: string, campaignName: string): Promise<void> {
    if (!this.config.notificationSettings.campaignStopped) return;

    const message = `
🔴 *Campaign Stopped*

*${campaignName}* has been stopped.

Campaign ID: \`${campaignId}\`
    `.trim();

    await this.broadcast(message);
  }

  /**
   * Send error notification
   */
  async notifyError(campaignId: string, error: string): Promise<void> {
    if (!this.config.notificationSettings.campaignError) return;

    const message = `
⚠️ *Campaign Error*

Campaign: \`${campaignId}\`
Error: ${error}
    `.trim();

    await this.broadcast(message);
  }

  /**
   * Send daily report
   */
  async sendDailyReport(): Promise<void> {
    if (!this.config.notificationSettings.dailyReport) return;

    // Mock daily report
    const report = {
      totalVolume: 381.5,
      totalTransactions: 1024,
      activeCampaigns: 3,
      totalSpent: 25.2,
      errors: 2
    };

    const message = `
📊 *Daily Report*

*Summary:*
- Total Volume: ${report.totalVolume} SOL
- Transactions: ${report.totalTransactions}
- Active Campaigns: ${report.activeCampaigns}
- Total Spent: ${report.totalSpent} SOL
- Errors: ${report.errors}

*Status:* All systems operational ✅
    `.trim();

    await this.broadcast(message);
  }

  /**
   * Make API call to Telegram
   */
  private async apiCall(method: string, params: Record<string, any>): Promise<any> {
    const url = `https://api.telegram.org/bot${this.token}/${method}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }

    return response.json();
  }
}

// Export for use
export { TelegramBot };
export default TelegramBot;

// CLI entry point
if (require.main === module) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!token) {
    console.error('❌ TELEGRAM_BOT_TOKEN environment variable is required');
    console.log('Set it with: export TELEGRAM_BOT_TOKEN=your_token');
    process.exit(1);
  }

  const bot = new TelegramBot({
    token,
    notificationSettings: {
      campaignStarted: true,
      campaignStopped: true,
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
