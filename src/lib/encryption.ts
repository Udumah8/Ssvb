/**
 * Encryption Module
 * 
 * Provides AES-256 encryption for wallet private keys
 */

import crypto from 'crypto';

// Get encryption key from environment
const getEncryptionKey = (): Buffer => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    // Use a default key for development (NOT SAFE FOR PRODUCTION)
    console.warn('WARNING: ENCRYPTION_KEY not set. Using default key (NOT SAFE FOR PRODUCTION)');
    return crypto.createHash('sha256').update('svbb-default-key-do-not-use-in-production').digest();
  }
  
  // Ensure key is 32 bytes for AES-256
  return crypto.createHash('sha256').update(key).digest();
};

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;

/**
 * Encrypt data using AES-256-GCM
 * Returns: base64(salt + iv + authTag + encryptedData)
 */
export async function encrypt(data: number[]): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const key = getEncryptionKey();
      const salt = crypto.randomBytes(SALT_LENGTH);
      const iv = crypto.randomBytes(IV_LENGTH);
      
      // Create cipher
      const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
      
      // Encrypt data
      const encrypted = Buffer.concat([
        cipher.update(Buffer.from(data)),
        cipher.final(),
      ]);
      
      // Get auth tag
      const authTag = cipher.getAuthTag();
      
      // Combine: salt + iv + authTag + encrypted
      const combined = Buffer.concat([salt, iv, authTag, encrypted]);
      
      resolve(combined.toString('base64'));
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Decrypt data using AES-256-GCM
 * Input: base64(salt + iv + authTag + encryptedData)
 * Returns: number array
 */
export async function decrypt(encryptedData: string): Promise<number[]> {
  return new Promise((resolve, reject) => {
    try {
      const key = getEncryptionKey();
      const combined = Buffer.from(encryptedData, 'base64');
      
      // Extract components
      const salt = combined.subarray(0, SALT_LENGTH);
      const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
      const authTag = combined.subarray(
        SALT_LENGTH + IV_LENGTH, 
        SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH
      );
      const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);
      
      // Create decipher
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(authTag);
      
      // Decrypt
      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ]);
      
      resolve(Array.from(decrypted));
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Derive a key from password using PBKDF2
 */
export function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
}

/**
 * Hash a string (for checksums, etc.)
 */
export function hash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate a random hex string
 */
export function generateRandomHex(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Encrypt with password (for additional security layer)
 */
export async function encryptWithPassword(
  data: number[], 
  password: string
): Promise<string> {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const key = deriveKey(password, salt);
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  const encrypted = Buffer.concat([
    cipher.update(Buffer.from(data)),
    cipher.final(),
  ]);
  
  const authTag = cipher.getAuthTag();
  
  const combined = Buffer.concat([salt, iv, authTag, encrypted]);
  return combined.toString('base64');
}

/**
 * Decrypt with password
 */
export async function decryptWithPassword(
  encryptedData: string, 
  password: string
): Promise<number[]> {
  const combined = Buffer.from(encryptedData, 'base64');
  
  const salt = combined.subarray(0, SALT_LENGTH);
  const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const authTag = combined.subarray(
    SALT_LENGTH + IV_LENGTH, 
    SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH
  );
  const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);
  
  const key = deriveKey(password, salt);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  
  return Array.from(decrypted);
}
