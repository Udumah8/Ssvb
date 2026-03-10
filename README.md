# Solana Volume Booster Bot (SVBB)

A production-ready Next.js application for generating organic trading volume on Solana DEXes. Designed for token creators and market makers who need to bootstrap liquidity and trading activity.

## ⚠️ Important Disclaimer

**This software is for educational and legitimate market-making purposes only.**
- Use only on tokens you own or have explicit permission to trade
- Comply with all applicable laws and exchange terms of service
- The authors assume no liability for misuse

## Features

### Core Trading Engine
- **solana-trade Integration**: Built on the solana-trade SDK for reliable DEX interactions
- **Multi-Wallet System**: Master wallet + 100-500+ burner wallets for distributed trading
- **MEV Protection**: Integrated Jito, Nozomi, and Astralane MEV protection
- **Transaction Queue**: Optimized transaction ordering and execution

### Realism Engine
- **Gaussian Randomization**: Natural-looking trade amounts and timing
- **Entropy Scoring**: AI-powered pattern detection avoidance
- **Organic Behavior**: Simulated human trading patterns
- **Wallet Rotation**: Automatic wallet state management

### Safety Controls
- **Spend Limits**: Daily, total, and per-hour spending caps
- **Kill Switch**: Instant campaign termination
- **Fund Recovery**: Bulk fund recovery to master wallet
- **Price Impact Monitoring**: Automatic pause on high impact

### Web Dashboard
- **Campaign Management**: Create, start, pause, and stop campaigns
- **Real-time Metrics**: Live volume, transactions, and makers tracking
- **Wallet Management**: Fund, recover, and monitor burner wallets
- **Settings**: RPC, MEV providers, and notification configuration

### CLI & Telegram Bot
- **Command Line Interface**: Full campaign and wallet management
- **Telegram Notifications**: Real-time alerts for campaign events
- **Remote Control**: Manage campaigns from anywhere

## Quick Start

### Prerequisites

- Node.js 20+
- Bun package manager
- Solana RPC endpoint
- MEV protection provider keys (optional)

### Installation

```bash
# Clone the repository
cd svbb

# Install dependencies
bun install

# Copy environment template
cp .env.example .env.local
```

### Environment Configuration

Edit `.env.local` with your settings:

```env
# Required
RPC_URL=https://api.mainnet-beta.solana.com
MASTER_WALLET_PRIVATE_KEY=your_base58_encoded_private_key

# Optional - MEV Protection
JITO_UUID=your_jito_uuid
NOZOMI_API_KEY=your_nozomi_key
ASTRALANE_API_KEY=your_astralane_key

# Optional - Notifications
TELEGRAM_BOT_TOKEN=your_telegram_token
EMAIL_SMTP_HOST=smtp.example.com
EMAIL_SMTP_PORT=587
EMAIL_FROM=alerts@example.com
EMAIL_TO=you@example.com
```

### Development

```bash
# Start development server
bun run dev

# Access dashboard at http://localhost:3000
```

### Production Build

```bash
# Build for production
bun run build

# Start production server
bun run start
```

## Usage

### Web Dashboard

1. **Create a Campaign**
   - Navigate to Campaigns → New Campaign
   - Enter token mint address
   - Select strategy (Drip, Burst, Volume-Only, Market Maker)
   - Configure budget and realism settings
   - Launch campaign

2. **Monitor Campaigns**
   - View active campaigns on Dashboard
   - See real-time volume and transaction charts
   - Track wallet statistics

3. **Manage Wallets**
   - View burner wallet balances
   - Fund wallets from master wallet
   - Recover funds to master wallet

### CLI Commands

```bash
# List campaigns
bun run cli campaign list

# Create campaign
bun run cli campaign create JUPyiwrYJFskUPiHa7hkeR8VUtkqjberbSOWd91pbT2a drip 10

# Start campaign
bun run cli campaign start campaign_123

# Check status
bun run cli campaign status campaign_123

# List wallets
bun run cli wallet list

# Fund wallet
bun run cli wallet fund <address> 2.5
```

### Telegram Bot

```bash
# Start the bot
bun run telegram

# In Telegram, send /start to begin
# Use /help for available commands
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # Main dashboard
│   ├── campaigns/          # Campaign management
│   ├── wallets/            # Wallet management
│   └── settings/           # Configuration
├── bin/                    # CLI and Telegram bot
│   ├── cli.ts             # Command-line interface
│   └── telegram-bot.ts    # Telegram bot
├── lib/                    # Core business logic
│   ├── solana-trade.ts    # Trading engine wrapper
│   ├── wallet.ts          # Wallet management
│   ├── encryption.ts     # AES-256 encryption
│   ├── randomization.ts   # Randomization engine
│   ├── entropy.ts         # Entropy scoring
│   └── campaign.ts        # Campaign management
├── components/            # React components
├── config/                # Configuration
└── types/                 # TypeScript types
```

## Strategies

### Drip
- Small, consistent trades over time
- Mimics organic accumulator behavior
- Low price impact

### Burst
- Higher volume in short bursts
- Good for reaching volume targets quickly
- Higher price impact

### Volume-Only
- Focus purely on transaction count
- Minimal price movement
- Uses smallest viable amounts

### Market Maker
- Balanced buy/sell orders
- Maintains spread
- Sustained liquidity

## API Reference

### Campaign Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/campaigns | Create campaign |
| GET | /api/campaigns | List campaigns |
| GET | /api/campaigns/[id] | Get campaign details |
| POST | /api/campaigns/[id]/start | Start campaign |
| POST | /api/campaigns/[id]/stop | Stop campaign |
| POST | /api/campaigns/[id]/pause | Pause campaign |
| POST | /api/campaigns/[id]/resume | Resume campaign |

### Wallet Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/wallets | List wallets |
| POST | /api/wallets/fund | Fund wallet |
| POST | /api/wallets/recover | Recover funds |

## Security

- **AES-256 Encryption**: All burner wallet private keys are encrypted at rest
- **No Plaintext Keys**: Private keys never stored in plaintext
- **Environment Variables**: Sensitive data via environment variables only
- **Rate Limiting**: API endpoints protected against abuse
- **Input Validation**: All inputs sanitized and validated

## Troubleshooting

### Common Issues

**High Price Impact**
- Reduce trade amounts
- Increase wallet count
- Use Drip strategy

**Transactions Failing**
- Check RPC endpoint status
- Verify wallet balances
- Review slippage settings

**Detection Concerns**
- Increase entropy score
- Reduce transaction frequency
- Use more wallets

## Support

- Documentation: [docs/](docs/)
- Issues: [GitHub Issues](https://github.com/svbb/issues)
- Discord: [Join Community](https://discord.gg/svbb)

## License

MIT License - See LICENSE file for details

## Contributing

1. Fork the repository
2. Create feature branch
3. Submit pull request
4. Ensure tests pass

---

**Remember**: Trade responsibly and within legal boundaries.
