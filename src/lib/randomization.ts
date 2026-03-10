/**
 * Randomization Engine
 * 
 * Provides various randomization functions for realistic trading behavior
 */

// Gaussian (normal) distribution using Box-Muller transform
export function gaussianRandom(mean: number = 0, stdDev: number = 1): number {
  const u1 = Math.random();
  const u2 = Math.random();
  
  // Box-Muller transform
  const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  
  return z * stdDev + mean;
}

// Truncated Gaussian (ensures values stay within bounds)
export function truncatedGaussian(
  mean: number, 
  stdDev: number, 
  min: number, 
  max: number
): number {
  let value = gaussianRandom(mean, stdDev);
  
  // Truncate to min-max range
  value = Math.max(min, Math.min(max, value));
  
  return value;
}

// Random delay in milliseconds
export function randomDelay(minMs: number, maxMs: number): number {
  return minMs + Math.random() * (maxMs - minMs);
}

// Random delay in seconds
export function randomDelaySeconds(minSec: number, maxSec: number): number {
  return randomDelay(minSec * 1000, maxSec * 1000) / 1000;
}

// Random amount within range with distribution
export function randomAmount(
  min: number, 
  max: number, 
  distribution: 'uniform' | 'gaussian' | 'skewed' = 'uniform'
): number {
  switch (distribution) {
    case 'gaussian':
      return truncatedGaussian((min + max) / 2, (max - min) / 4, min, max);
    case 'skewed':
      // Skew towards lower values (more micro-transactions)
      return min + Math.pow(Math.random(), 2) * (max - min);
    default:
      return min + Math.random() * (max - min);
  }
}

// Random slippage percentage
export function randomSlippage(min: number, max: number): number {
  // Use Gaussian distribution centered towards the middle of the range
  return truncatedGaussian((min + max) / 2, (max - min) / 6, min, max);
}

// Random priority fee in SOL
export function randomPriorityFee(min: number, max: number): number {
  // Most transactions get lower fees, some get higher
  const value = randomAmount(min, max, 'skewed');
  return Math.round(value * 1000000) / 1000000; // Round to 6 decimal places
}

// Random tip in SOL
export function randomTip(min: number, max: number): number {
  // Tips are less frequent
  if (Math.random() > 0.7) { // 30% chance of tip
    return 0;
  }
  return randomAmount(min, max, 'skewed');
}

// Buy/Sell decision based on ratio
export function shouldBuy(buyRatio: number = 0.6): boolean {
  return Math.random() < buyRatio;
}

// Random selection from array
export function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Shuffle array (Fisher-Yates)
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Randomize array order with optional limit
export function randomizeOrder<T>(array: T[], limit?: number): T[] {
  const shuffled = shuffle(array);
  return limit ? shuffled.slice(0, limit) : shuffled;
}

// Random wallet funding level (varied)
export function randomFundingLevel(
  minSol: number, 
  maxSol: number
): number {
  // Use distribution that favors mid-range but has some variation
  return randomAmount(minSol, maxSol, 'gaussian');
}

// Calculate transactions per minute based on strategy
export function calculateTxPerMinute(
  strategy: 'drip' | 'burst' | 'volume_only' | 'market_maker',
  walletCount: number
): number {
  switch (strategy) {
    case 'drip':
      return 1 + Math.random() * 4; // 1-5 tx/min per wallet
    case 'burst':
      return 10 + Math.random() * 40; // 10-50 tx/min per wallet
    case 'volume_only':
      return 20 + Math.random() * 30; // 20-50 tx/min per wallet
    case 'market_maker':
      return 2 + Math.random() * 8; // 2-10 tx/min per wallet
    default:
      return 1 + Math.random() * 4;
  }
}

// Generate random price variation (for market maker)
export function generatePriceOffset(
  centerPrice: number,
  percentageRange: number
): number {
  const offsetPercent = randomAmount(-percentageRange, percentageRange, 'gaussian');
  return centerPrice * (1 + offsetPercent / 100);
}

// Random boolean with probability
export function randomBool(probability: number = 0.5): boolean {
  return Math.random() < probability;
}

// Weighted random selection
export function weightedRandom<T>(
  items: T[],
  weights: number[]
): T {
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return items[i];
    }
  }
  
  return items[items.length - 1];
}

// Organic pause probability (to simulate human behavior)
export function shouldPause(pauseProbability: number = 0.05): boolean {
  return randomBool(pauseProbability);
}

// Noop instruction probability
export function shouldAddNoop(noopProbability: number = 0.1): boolean {
  return randomBool(noopProbability);
}

// Micro-fail probability (simulation of failed transactions)
export function shouldMicroFail(failProbability: number = 0.02): boolean {
  return randomBool(failProbability);
}

// Generate random wallet rotation
export function getRotatedWalletIndex(
  walletCount: number,
  currentIndex: number
): number {
  // Small rotation (next or skip)
  const offset = Math.random() > 0.5 ? 1 : 0;
  return (currentIndex + offset) % walletCount;
}

// Positive bias calculation (favor buys over sells)
export function applyPositiveBias(buyRatio: number): number {
  // Bias slightly towards the configured buy ratio
  return buyRatio + (Math.random() - 0.5) * 0.1;
}
