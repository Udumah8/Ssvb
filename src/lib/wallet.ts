/**
 * Wallet Management Module
 * 
 * Handles wallet generation, encryption, storage, and fund management
 */

import { Keypair } from '@solana/web3.js';
import { encrypt, decrypt } from './encryption';
import type { WalletInfo, MasterWallet, BurnerWallet, WalletStatus } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// In-memory storage (replace with database in production)
const wallets = new Map<string, MasterWallet | BurnerWallet>();

// Master wallet singleton
let masterWallet: MasterWallet | null = null;

/**
 * Generate a new keypair
 */
export function generateKeypair(): Keypair {
  return Keypair.generate();
}

/**
 * Create a master wallet from a secret key
 */
export async function createMasterWallet(
  secretKey?: Uint8Array
): Promise<MasterWallet> {
  const keypair = secretKey 
    ? Keypair.fromSecretKey(secretKey)
    : generateKeypair();

  const walletId = uuidv4();
  const now = new Date();

  const wallet: MasterWallet = {
    id: walletId,
    publicKey: keypair.publicKey.toBase58(),
    privateKeyEncrypted: await encrypt(Array.from(keypair.secretKey)),
    type: 'master',
    status: 'active',
    balance: 0,
    totalVolume: 0,
    transactionCount: 0,
    lastActivity: now,
    createdAt: now,
  };

  masterWallet = wallet;
  wallets.set(walletId, wallet);

  return wallet;
}

/**
 * Create a burner wallet
 */
export async function createBurnerWallet(): Promise<BurnerWallet> {
  const keypair = generateKeypair();
  const walletId = uuidv4();
  const now = new Date();

  const wallet: BurnerWallet = {
    id: walletId,
    publicKey: keypair.publicKey.toBase58(),
    privateKeyEncrypted: await encrypt(Array.from(keypair.secretKey)),
    type: 'burner',
    status: 'active',
    balance: 0,
    totalVolume: 0,
    transactionCount: 0,
    lastActivity: now,
    createdAt: now,
  };

  wallets.set(walletId, wallet);
  return wallet;
}

/**
 * Create multiple burner wallets
 */
export async function createBurnerWallets(count: number): Promise<BurnerWallet[]> {
  const wallets: BurnerWallet[] = [];
  
  for (let i = 0; i < count; i++) {
    const wallet = await createBurnerWallet();
    wallets.push(wallet);
  }
  
  return wallets;
}

/**
 * Get wallet by ID
 */
export function getWallet(id: string): WalletInfo | undefined {
  return wallets.get(id);
}

/**
 * Get all wallets
 */
export function getAllWallets(): WalletInfo[] {
  return Array.from(wallets.values());
}

/**
 * Get burner wallets by status
 */
export function getBurnerWalletsByStatus(status: WalletStatus): BurnerWallet[] {
  return Array.from(wallets.values())
    .filter((w): w is BurnerWallet => w.type === 'burner' && w.status === status);
}

/**
 * Get the master wallet
 */
export function getMasterWallet(): MasterWallet | null {
  return masterWallet;
}

/**
 * Set the master wallet
 */
export function setMasterWallet(wallet: MasterWallet): void {
  masterWallet = wallet;
  wallets.set(wallet.id, wallet);
}

/**
 * Update wallet status
 */
export function updateWalletStatus(id: string, status: WalletStatus): boolean {
  const wallet = wallets.get(id);
  if (!wallet) return false;
  
  wallet.status = status;
  wallet.lastActivity = new Date();
  
  if (status === 'cooling') {
    const wallet = wallets.get(id) as BurnerWallet;
    if (wallet && wallet.type === 'burner') {
      // Set cooling period (5-15 minutes)
      const coolingMinutes = 5 + Math.random() * 10;
      wallet.coolingUntil = new Date(Date.now() + coolingMinutes * 60 * 1000);
    }
  }
  
  return true;
}

/**
 * Update wallet balance
 */
export function updateWalletBalance(id: string, balance: number): boolean {
  const wallet = wallets.get(id);
  if (!wallet) return false;
  
  wallet.balance = balance;
  wallet.lastActivity = new Date();
  return true;
}

/**
 * Increment wallet transaction count and volume
 */
export function incrementWalletStats(
  id: string, 
  volume: number,
  count: number = 1
): boolean {
  const wallet = wallets.get(id);
  if (!wallet) return false;
  
  wallet.totalVolume += volume;
  wallet.transactionCount += count;
  wallet.lastActivity = new Date();
  return true;
}

/**
 * Get decrypted private key
 */
export async function getDecryptedPrivateKey(id: string): Promise<Uint8Array | null> {
  const wallet = wallets.get(id);
  if (!wallet) return null;
  
  const decrypted = await decrypt(wallet.privateKeyEncrypted);
  return new Uint8Array(decrypted);
}

/**
 * Get keypair from wallet ID
 */
export async function getKeypairFromWallet(id: string): Promise<Keypair | null> {
  const privateKey = await getDecryptedPrivateKey(id);
  if (!privateKey) return null;
  
  try {
    return Keypair.fromSecretKey(privateKey);
  } catch (error) {
    console.error('Failed to create keypair:', error);
    return null;
  }
}

/**
 * Delete a wallet
 */
export function deleteWallet(id: string): boolean {
  return wallets.delete(id);
}

/**
 * Delete all burner wallets
 */
export function deleteAllBurnerWallets(): void {
  for (const [id, wallet] of wallets.entries()) {
    if (wallet.type === 'burner') {
      wallets.delete(id);
    }
  }
}

/**
 * Get active burner wallets (not cooling or paused)
 */
export function getActiveBurnerWallets(): BurnerWallet[] {
  const now = new Date();
  
  return Array.from(wallets.values())
    .filter((w): w is BurnerWallet => {
      if (w.type !== 'burner') return false;
      if (w.status === 'paused' || w.status === 'recovering') return false;
      if (w.status === 'cooling' && w.coolingUntil && w.coolingUntil > now) return false;
      return true;
    });
}

/**
 * Get next available wallet (with rotation)
 */
export function getNextAvailableWallet(): BurnerWallet | null {
  const activeWallets = getActiveBurnerWallets();
  
  if (activeWallets.length === 0) return null;
  
  // Round-robin: get wallet with lowest transaction count
  return activeWallets.reduce((min, wallet) => 
    wallet.transactionCount < min.transactionCount ? wallet : min
  );
}

/**
 * Clear cooling on wallets that have completed their cooling period
 */
export function clearCompletedCooling(): void {
  const now = new Date();
  
  for (const wallet of wallets.values()) {
    if (wallet.type === 'burner' && wallet.status === 'cooling') {
      const burnerWallet = wallet as BurnerWallet;
      if (burnerWallet.coolingUntil && burnerWallet.coolingUntil <= now) {
        burnerWallet.status = 'active';
        burnerWallet.coolingUntil = undefined;
      }
    }
  }
}

// Initialize cooling checker interval
setInterval(clearCompletedCooling, 60000); // Check every minute
