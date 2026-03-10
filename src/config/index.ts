/**
 * Configuration module for SVBB
 */

import type { AppConfig, MEVConfig, NotificationConfig } from '@/types';

// Environment variables with defaults
const config = {
  // RPC
  rpcUrl: process.env.RPC_URL || 'https://api.mainnet-beta.solana.com',
  
  // MEV Providers
  jito: {
    uuid: process.env.JITO_UUID || '',
    regions: {
      MAINNET: 'mainnet',
      AMS: 'ams',
      DUB: 'dub',
      FRA: 'fra',
      LON: 'lon',
      NY: 'ny',
      SLC: 'slc',
      SG: 'sg',
      TYO: 'tyo',
    } as Record<string, string>,
  },
  nozomi: {
    apiKey: process.env.NOZOMI_API_KEY || '',
  },
  astralane: {
    apiKey: process.env.ASTRALANE_API_KEY || '',
  },
  
  // Encryption
  encryptionKey: process.env.ENCRYPTION_KEY || '',
  
  // Database (for future use)
  databaseUrl: process.env.DATABASE_URL || '',
  
  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
};

// Default MEV configuration
export const defaultMEVConfig: MEVConfig = {
  provider: 'jito',
  region: 'MAINNET',
  uuid: config.jito.uuid,
};

// Default notification configuration
export const defaultNotificationConfig: NotificationConfig = {
  alertsEnabled: false,
};

// App configuration
export const appConfig: AppConfig = {
  rpcUrl: config.rpcUrl,
  mev: defaultMEVConfig,
  notifications: defaultNotificationConfig,
};

// Validate required environment variables
export function validateEnv(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  
  if (!config.rpcUrl) {
    missing.push('RPC_URL');
  }
  
  // MEV providers are optional but recommended
  const mevProviders = [config.jito.uuid, config.nozomi.apiKey, config.astralane.apiKey];
  const hasMEV = mevProviders.some(p => p && p.length > 0);
  if (!hasMEV) {
    console.warn('Warning: No MEV provider configured. MEV protection will be limited.');
  }
  
  if (!config.encryptionKey && config.nodeEnv === 'production') {
    missing.push('ENCRYPTION_KEY');
  }
  
  return {
    valid: missing.length === 0,
    missing,
  };
}

// Get MEV configuration based on provider
export function getMEVConfig(provider: 'jito' | 'nozomi' | 'astralane'): MEVConfig {
  switch (provider) {
    case 'jito':
      return {
        provider: 'jito',
        region: process.env.JITO_REGION || 'MAINNET',
        uuid: config.jito.uuid,
      };
    case 'nozomi':
      return {
        provider: 'nozomi',
        apiKey: config.nozomi.apiKey,
      };
    case 'astralane':
      return {
        provider: 'astralane',
        apiKey: config.astralane.apiKey,
      };
    default:
      return defaultMEVConfig;
  }
}

// Jito regions
export const JITO_REGIONS = config.jito.regions;

// Export config for use in other modules
export default config;
