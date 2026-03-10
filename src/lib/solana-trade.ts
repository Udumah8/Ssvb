/**
 * Solana Trade Wrapper
 * 
 * This module provides a wrapper around the solana-trade library with
 * error handling, retry logic, and TypeScript type definitions.
 */

import { SolanaTrade } from 'solana-trade';
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import type { TradeResult, MEVConfig } from '@/types';

// Default retry configuration
const DEFAULT_RETRY_COUNT = 3;
const DEFAULT_RETRY_DELAY = 1000; // ms

export interface SolanaTradeConfig {
  rpcUrl?: string;
  jitoUuid?: string;
  nozomiApiKey?: string;
  astralaneApiKey?: string;
  retryCount?: number;
  retryDelay?: number;
}

export interface BuyParams {
  market: string;
  wallet: Keypair;
  mint: string;
  amount: number;
  slippage: number;
  priorityFeeSol?: number;
  tipAmountSol?: number;
  poolAddress?: string;
  send?: boolean;
  sender?: 'ASTRALANE' | 'NOZOMI' | 'JITO';
  antimev?: boolean;
  region?: string;
  skipSimulation?: boolean;
  skipConfirmation?: boolean;
}

export interface SellParams {
  market: string;
  wallet: Keypair;
  mint: string;
  amount: number;
  slippage: number;
  priorityFeeSol?: number;
  tipAmountSol?: number;
  poolAddress?: string;
  send?: boolean;
  sender?: 'ASTRALANE' | 'NOZOMI' | 'JITO';
  antimev?: boolean;
  region?: string;
  skipSimulation?: boolean;
  skipConfirmation?: boolean;
}

/**
 * SolanaTradeWrapper class
 * Provides a wrapper around solana-trade with retry logic and error handling
 */
export class SolanaTradeWrapper {
  private trade: SolanaTrade | null = null;
  private connection: Connection | null = null;
  private config: SolanaTradeConfig;
  private retryCount: number;
  private retryDelay: number;

  constructor(config: SolanaTradeConfig = {}) {
    this.config = {
      rpcUrl: config.rpcUrl || 'https://api.mainnet-beta.solana.com',
      jitoUuid: config.jitoUuid || process.env.JITO_UUID || '',
      nozomiApiKey: config.nozomiApiKey || process.env.NOZOMI_API_KEY || '',
      astralaneApiKey: config.astralaneApiKey || process.env.ASTRALANE_API_KEY || '',
      retryCount: config.retryCount || DEFAULT_RETRY_COUNT,
      retryDelay: config.retryDelay || DEFAULT_RETRY_DELAY,
    };
    this.retryCount = this.config.retryCount || DEFAULT_RETRY_COUNT;
    this.retryDelay = this.config.retryDelay || DEFAULT_RETRY_DELAY;
  }

  /**
   * Initialize the Solana Trade instance
   */
  async initialize(): Promise<void> {
    try {
      // Set environment variables for solana-trade
      if (this.config.rpcUrl) {
        process.env.RPC_URL = this.config.rpcUrl;
      }
      if (this.config.jitoUuid) {
        process.env.JITO_UUID = this.config.jitoUuid;
      }
      if (this.config.nozomiApiKey) {
        process.env.NOZOMI_API_KEY = this.config.nozomiApiKey;
      }
      if (this.config.astralaneApiKey) {
        process.env.ASTRALANE_API_KEY = this.config.astralaneApiKey;
      }

      // Initialize connection
      this.connection = new Connection(this.config.rpcUrl || 'https://api.mainnet-beta.solana.com');

      // Initialize SolanaTrade
      this.trade = new SolanaTrade(this.config.rpcUrl || 'https://api.mainnet-beta.solana.com');

      console.log('SolanaTrade initialized successfully');
    } catch (error) {
      console.error('Failed to initialize SolanaTrade:', error);
      throw error;
    }
  }

  /**
   * Get the connection instance
   */
  getConnection(): Connection {
    if (!this.connection) {
      throw new Error('SolanaTrade not initialized. Call initialize() first.');
    }
    return this.connection;
  }

  /**
   * Execute a buy transaction with retry logic
   */
  async buy(params: BuyParams, mevConfig?: MEVConfig): Promise<TradeResult> {
    return this.executeWithRetry(async () => {
      if (!this.trade) {
        throw new Error('SolanaTrade not initialized');
      }

      const mintPubkey = new PublicKey(params.mint);

      const result = await this.trade.buy({
        market: params.market,
        wallet: params.wallet,
        mint: mintPubkey,
        amount: params.amount,
        slippage: params.slippage,
        priorityFeeSol: params.priorityFeeSol,
        tipAmountSol: params.tipAmountSol,
        poolAddress: params.poolAddress,
        send: params.send ?? true,
        sender: params.sender,
        antimev: params.antimev,
        region: params.region,
        skipSimulation: params.skipSimulation,
        skipConfirmation: params.skipConfirmation,
      });

      // Handle string signature or Transaction return
      const signature = typeof result === 'string' ? result : '';
      
      // Get price after execution
      let price = 0;
      try {
        const priceResult = await this.trade.price({
          market: params.market,
          mint: mintPubkey,
        });
        price = priceResult.price;
      } catch {
        // Price fetch failed, continue without price
      }

      return {
        signature,
        status: signature ? 'confirmed' : 'failed',
        price,
        priceImpact: 0,
        fees: (params.priorityFeeSol || 0) + (params.tipAmountSol || 0),
        timestamp: new Date(),
      };
    });
  }

  /**
   * Execute a sell transaction with retry logic
   */
  async sell(params: SellParams, mevConfig?: MEVConfig): Promise<TradeResult> {
    return this.executeWithRetry(async () => {
      if (!this.trade) {
        throw new Error('SolanaTrade not initialized');
      }

      const mintPubkey = new PublicKey(params.mint);

      const result = await this.trade.sell({
        market: params.market,
        wallet: params.wallet,
        mint: mintPubkey,
        amount: params.amount,
        slippage: params.slippage,
        priorityFeeSol: params.priorityFeeSol,
        tipAmountSol: params.tipAmountSol,
        poolAddress: params.poolAddress,
        send: params.send ?? true,
        sender: params.sender,
        antimev: params.antimev,
        region: params.region,
        skipSimulation: params.skipSimulation,
        skipConfirmation: params.skipConfirmation,
      });

      // Handle string signature or Transaction return
      const signature = typeof result === 'string' ? result : '';
      
      // Get price after execution
      let price = 0;
      try {
        const priceResult = await this.trade.price({
          market: params.market,
          mint: mintPubkey,
        });
        price = priceResult.price;
      } catch {
        // Price fetch failed, continue without price
      }

      return {
        signature,
        status: signature ? 'confirmed' : 'failed',
        price,
        priceImpact: 0,
        fees: (params.priorityFeeSol || 0) + (params.tipAmountSol || 0),
        timestamp: new Date(),
      };
    });
  }

  /**
   * Get the current price for a token
   */
  async price(market: string, mint: string): Promise<number> {
    return this.executeWithRetry(async () => {
      if (!this.trade) {
        throw new Error('SolanaTrade not initialized');
      }

      const mintPubkey = new PublicKey(mint);

      const priceResult = await this.trade.price({
        market,
        mint: mintPubkey,
      });

      return priceResult.price;
    });
  }

  /**
   * Simulate a transaction before execution
   */
  async simulate(transaction: Transaction, wallet: Keypair): Promise<{
    success: boolean;
    error?: string;
    unitsConsumed?: number;
  }> {
    try {
      const connection = this.getConnection();
      
      // Simulate the transaction
      const simulationResult = await connection.simulateTransaction(transaction, [wallet]);

      if (simulationResult.value.err) {
        return {
          success: false,
          error: JSON.stringify(simulationResult.value.err),
        };
      }

      const units = simulationResult.value.unitsConsumed;
      return {
        success: true,
        unitsConsumed: typeof units === 'number' ? units : 0,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Simulation failed',
      };
    }
  }

  /**
   * Confirm a transaction
   */
  async confirmTransaction(signature: string, timeout: number = 30000): Promise<boolean> {
    try {
      const connection = this.getConnection();
      const startTime = Date.now();
      
      while (Date.now() - startTime < timeout) {
        const status = await connection.getSignatureStatus(signature, {
          searchTransactionHistory: true,
        });

        if (status.value) {
          const val = status.value as { confirmed?: boolean; err?: object };
          if (val.confirmed) {
            return true;
          }
          if (val.err) {
            return false;
          }
        }

        await new Promise(resolve => setTimeout(resolve, 500));
      }

      return false;
    } catch (error) {
      console.error('Transaction confirmation error:', error);
      return false;
    }
  }

  /**
   * Get wallet balance
   */
  async getBalance(publicKey: string): Promise<number> {
    try {
      const connection = this.getConnection();
      const balance = await connection.getBalance(new PublicKey(publicKey));
      return balance / 1e9; // Convert lamports to SOL
    } catch (error) {
      console.error('Failed to get balance:', error);
      return 0;
    }
  }

  /**
   * Execute function with retry logic
   */
  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    attempt: number = 0
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (attempt < this.retryCount) {
        console.log(`Retry attempt ${attempt + 1}/${this.retryCount}`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (attempt + 1)));
        return this.executeWithRetry(fn, attempt + 1);
      }
      throw error;
    }
  }
}

// Default instance
let defaultInstance: SolanaTradeWrapper | null = null;

/**
 * Get or create the default SolanaTradeWrapper instance
 */
export function getSolanaTrade(config?: SolanaTradeConfig): SolanaTradeWrapper {
  if (!defaultInstance) {
    defaultInstance = new SolanaTradeWrapper(config);
  }
  return defaultInstance;
}

/**
 * Initialize the default SolanaTradeWrapper instance
 */
export async function initializeSolanaTrade(config?: SolanaTradeConfig): Promise<SolanaTradeWrapper> {
  const instance = getSolanaTrade(config);
  await instance.initialize();
  return instance;
}
