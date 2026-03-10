# Requirements Document

## Introduction

The Solana Volume Booster Bot (SVBB) is a production-grade automated tool for simulating realistic trading activity on the Solana blockchain. It generates on-chain volume, transaction count (makers), and activity signals for Solana tokens on major DEXs and launchpads to improve visibility and trending on aggregators like DexScreener and Birdeye, while avoiding drastic price impact or detectable bot patterns.

The application uses the solana-trade library as the core trading engine, providing unified access to 15+ DEXs with advanced MEV protection. The primary interface is a modern responsive web dashboard (Next.js), with secondary Telegram bot and CLI fallback options.

## Requirements

### 1. Core Trading Engine Integration

**User Story**: As a developer, I want to integrate the solana-trade library as the core trading engine so that the bot can execute trades across multiple DEXs with MEV protection.

**Acceptance Criteria**:
- WHEN the application starts THEN it SHALL initialize the solana-trade library with valid RPC_URL environment variable
- WHEN a buy transaction is executed THEN it SHALL use the solana-trade `buy()` method with proper BuyParams including market, wallet, mint, amount, slippage, priorityFeeSol, tipAmountSol, and optional region/antimev parameters
- WHEN a sell transaction is executed THEN it SHALL use the solana-trade `sell()` method with proper SellParams including market, wallet, mint, amount, slippage, priorityFeeSol, tipAmountSol, and optional region/antimev parameters
- WHEN fetching token price THEN it SHALL use the solana-trade `price()` method to get current market price
- WHEN MEV protection is configured THEN it SHALL support Jito (with region selection), Nozomi, and Astralane MEV providers

### 2. Multi-Strategy Volume Generation

**User Story**: As a token launcher, I want to run preset drip campaigns for Pump.fun so that volume builds naturally over time.

**Acceptance Criteria**:
- WHEN a Drip/Steady Mode campaign is created THEN the system SHALL execute 1-5 transactions per minute per wallet with gradual amounts
- WHEN a Burst/High-Intensity Mode campaign is created THEN the system SHALL execute 10-50 transactions per minute with aggressive spikes
- WHEN a Volume-Only Focus strategy is selected THEN the system SHALL maximize transaction count with micro-swaps
- WHEN a Market Maker Style strategy is selected THEN the system SHALL provide liquidity within configurable price ranges (±3-10%)
- WHEN scheduling is configured THEN the system SHALL support cron-based or event-based automation for campaign timing

### 3. Realism & Anti-Detection Layer

**User Story**: As an advanced user, I want granular control over randomization parameters so that trading patterns appear organic and avoid detection.

**Acceptance Criteria**:
- WHEN creating a campaign THEN the system SHALL support 100-500+ burner wallets with random rotation
- WHEN executing transactions THEN the system SHALL apply Gaussian/truncated randomization to amount, delay (1-60s), buy/sell ratio (default 60/40 buys), slippage (3-12%), and priority fee
- WHEN executing transactions THEN the system SHALL maintain a positive bias and include occasional noop instructions or micro-fails
- WHEN evaluating campaign behavior THEN the system SHALL calculate internal entropy scoring to self-assess robotic patterns
- WHEN detection risk is high THEN the system SHALL automatically adjust parameters to reduce flagged patterns

### 4. Controls & Safety Mechanisms

**User Story**: As a user, I want strict spending controls and kill-switch capabilities so that I can manage risk and prevent budget overruns.

**Acceptance Criteria**:
- WHEN creating a campaign THEN the user SHALL be able to set SOL spend caps including daily, total, per-hour, and per-campaign limits
- WHEN configuring trade parameters THEN the user SHALL be able to set slippage tolerance (1-15%) and priority fee range
- WHEN spend thresholds are reached THEN the system SHALL auto-pause or stop the campaign
- WHEN price impact exceeds threshold THEN the system SHALL auto-pause or stop the campaign
- WHEN the kill-switch is triggered THEN the system SHALL immediately stop all trading and recover funds to the master wallet

### 5. Web Dashboard - Campaign Management

**User Story**: As a token launcher, I want a visual dashboard to create and manage campaigns so that I can easily configure and monitor volume generation.

**Acceptance Criteria**:
- WHEN accessing the dashboard THEN the user SHALL see active campaigns and global statistics on the home page
- WHEN creating a new campaign THEN the user SHALL go through a wizard to select token mint, strategy, budget, and realism settings
- WHEN viewing campaign details THEN the user SHALL see live charts, transaction log, pause/resume/kill controls, and wallet statistics
- WHEN managing wallets THEN the user SHALL be able to view burner wallet overview and fund/recover via connected wallet

### 6. Real-Time Monitoring & Metrics

**User Story**: As a monitor, I want live charts and transaction feeds so that I can track campaign performance in real-time.

**Acceptance Criteria**:
- WHEN viewing a campaign THEN the user SHALL see real-time metrics including volume (SOL), transaction count, makers, buy/sell ratio, spend, and price impact
- WHEN transactions are executed THEN the system SHALL display a live transaction feed with signatures
- WHEN historical data is available THEN the user SHALL see volume curve and maker growth charts
- WHEN threshold conditions are met THEN the system SHALL send alerts via email or Telegram webhook
- WHEN metrics update THEN the display SHALL refresh automatically without page reload

### 7. Wallet Connection & Security

**User Story**: As a user, I want secure wallet connection so that I can fund and recover wallets without private key exposure.

**Acceptance Criteria**:
- WHEN connecting a wallet THEN the system SHALL use @solana/wallet-adapter-react for secure connection
- WHEN storing burner wallet keys THEN they SHALL be encrypted server-side with AES-256
- WHEN performing operations THEN private keys SHALL never be exposed to the browser client
- WHEN authenticating THEN the system SHALL support optional Wallet SIWS (Sign-In with Solana) authentication
- WHEN accessing the application THEN all connections SHALL use HTTPS

### 8. Settings & Configuration

**User Story**: As an advanced user, I want to configure RPC and MEV settings so that I can optimize for performance and cost.

**Acceptance Criteria**:
- WHEN configuring RPC THEN the user SHALL be able to set custom RPC_URL (Helius, QuickNode, Triton recommended)
- WHEN configuring MEV THEN the user SHALL be able to set Jito UUID, Nozomi API key, and Astralane API key via environment variables
- WHEN configuring notifications THEN the user SHALL be able to set up email and Telegram webhook endpoints
- WHEN saving presets THEN the user SHALL be able to save and load campaign configuration presets

### 9. CLI Fallback

**User Story**: As a technical user, I want a CLI interface so that I can control the bot without the web UI.

**Acceptance Criteria**:
- WHEN using the CLI THEN the user SHALL be able to create, start, stop, pause, and resume campaigns
- WHEN using the CLI THEN the user SHALL be able to view campaign status and statistics
- WHEN using the CLI THEN the user SHALL be able to manage wallets (fund, recover, view balance)
- WHEN CLI errors occur THEN the system SHALL display meaningful error messages with suggested actions

### 10. Telegram Bot Integration

**User Story**: As a user, I want a Telegram bot interface so that I can quickly start campaigns from my phone.

**Acceptance Criteria**:
- WHEN accessing the Telegram bot THEN the user SHALL be able to start/stop basic campaigns
- WHEN campaign events occur THEN the bot SHALL send notifications to the user
- WHEN the user sends commands THEN the bot SHALL respond with current campaign status
- WHEN errors occur THEN the bot SHALL alert the user with relevant information

---

*Document Version: 1.0*
*Created: March 10, 2026*
*Based on PRD v1.4 - Solana Volume Booster Bot*
