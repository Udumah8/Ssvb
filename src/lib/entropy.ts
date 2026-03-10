/**
 * Entropy Scoring System
 * 
 * Monitors trading patterns to detect robotic behavior
 * and provides recommendations for more organic activity
 */

import type { EntropyScore, Transaction } from '@/types';
import { gaussianRandom } from './randomization';

interface PatternMetrics {
  txCount: number;
  avgDelay: number;
  delayVariance: number;
  amountVariance: number;
  buySellRatio: number;
  slippageVariance: number;
  uniquePatterns: number;
  timeframe: number; // in seconds
}

/**
 * Calculate entropy score based on transaction patterns
 */
export function calculateEntropyScore(
  transactions: Transaction[],
  timeframeMinutes: number = 60
): EntropyScore {
  if (transactions.length === 0) {
    return {
      score: 0,
      detectedPatterns: [],
      riskLevel: 'low',
      recommendations: ['No transactions yet to analyze'],
    };
  }

  const patterns: string[] = [];
  const metrics = calculateMetrics(transactions, timeframeMinutes);
  
  // Check for robotic patterns
  checkTimingPatterns(metrics, patterns);
  checkAmountPatterns(metrics, patterns);
  checkRatioPatterns(metrics, patterns);
  checkVariancePatterns(metrics, patterns);
  
  // Calculate score based on pattern detection
  const score = calculateScore(patterns, metrics);
  const riskLevel = getRiskLevel(score);
  const recommendations = generateRecommendations(patterns, metrics);
  
  return {
    score,
    detectedPatterns: patterns,
    riskLevel,
    recommendations,
  };
}

/**
 * Calculate pattern metrics from transactions
 */
function calculateMetrics(
  transactions: Transaction[],
  timeframeMinutes: number
): PatternMetrics {
  const now = new Date();
  const timeframeStart = new Date(now.getTime() - timeframeMinutes * 60 * 1000);
  
  // Filter to timeframe
  const recentTxs = transactions.filter(
    tx => tx.timestamp >= timeframeStart
  );
  
  if (recentTxs.length === 0) {
    return {
      txCount: 0,
      avgDelay: 0,
      delayVariance: 0,
      amountVariance: 0,
      buySellRatio: 0.5,
      slippageVariance: 0,
      uniquePatterns: 0,
      timeframe: timeframeMinutes * 60,
    };
  }
  
  // Calculate delays between transactions
  const delays: number[] = [];
  const sortedTxs = [...recentTxs].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  for (let i = 1; i < sortedTxs.length; i++) {
    const delay = (
      new Date(sortedTxs[i].timestamp).getTime() - 
      new Date(sortedTxs[i - 1].timestamp).getTime()
    ) / 1000; // in seconds
    delays.push(delay);
  }
  
  // Calculate amounts
  const amounts = recentTxs.map(tx => tx.amount);
  const slippages = recentTxs.map(tx => tx.slippage);
  
  // Calculate buy/sell ratio
  const buyCount = recentTxs.filter(tx => tx.type === 'buy').length;
  const buySellRatio = buyCount / recentTxs.length;
  
  return {
    txCount: recentTxs.length,
    avgDelay: delays.length > 0 ? delays.reduce((a, b) => a + b, 0) / delays.length : 0,
    delayVariance: calculateVariance(delays),
    amountVariance: calculateVariance(amounts),
    buySellRatio,
    slippageVariance: calculateVariance(slippages),
    uniquePatterns: countUniquePatterns(recentTxs),
    timeframe: timeframeMinutes * 60,
  };
}

/**
 * Calculate variance of an array
 */
function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0;
  
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Check for timing patterns that indicate bot behavior
 */
function checkTimingPatterns(metrics: PatternMetrics, patterns: string[]): void {
  // Very consistent delays (robotic)
  if (metrics.delayVariance < 1 && metrics.txCount > 10) {
    patterns.push('Very consistent transaction timing detected');
  }
  
  // Too regular intervals
  if (metrics.avgDelay > 0 && metrics.delayVariance < metrics.avgDelay * 0.1) {
    patterns.push('Suspiciously regular transaction intervals');
  }
  
  // Too many transactions in short time
  if (metrics.txCount > 30 && metrics.avgDelay < 2) {
    patterns.push('High transaction frequency detected');
  }
}

/**
 * Check for amount patterns
 */
function checkAmountPatterns(metrics: PatternMetrics, patterns: string[]): void {
  // Very consistent amounts
  if (metrics.amountVariance < 0.1 && metrics.txCount > 10) {
    patterns.push('Suspiciously consistent transaction amounts');
  }
  
  // Amounts too evenly distributed
  if (metrics.amountVariance === 0) {
    patterns.push('Fixed transaction amount detected');
  }
}

/**
 * Check for buy/sell ratio patterns
 */
function checkRatioPatterns(metrics: PatternMetrics, patterns: string[]): void {
  // Perfect or near-perfect ratio
  if (metrics.buySellRatio === 1 || metrics.buySellRatio === 0) {
    patterns.push('Only buy or only sell transactions detected');
  }
  
  // Too perfect ratio
  if (metrics.buySellRatio > 0.9 || metrics.buySellRatio < 0.1) {
    patterns.push('Extremely skewed buy/sell ratio');
  }
}

/**
 * Check for variance patterns
 */
function checkVariancePatterns(metrics: PatternMetrics, patterns: string[]): void {
  // Low slippage variance
  if (metrics.slippageVariance < 1 && metrics.txCount > 5) {
    patterns.push('Fixed or very consistent slippage detected');
  }
}

/**
 * Count unique transaction patterns
 */
function countUniquePatterns(transactions: Transaction[]): number {
  const patterns = new Set<string>();
  
  for (const tx of transactions) {
    const pattern = `${tx.type}-${Math.round(tx.amount * 100)}-${Math.round(tx.slippage)}`;
    patterns.add(pattern);
  }
  
  return patterns.size;
}

/**
 * Calculate overall entropy score (0-100, higher = more robotic)
 */
function calculateScore(patterns: string[], metrics: PatternMetrics): number {
  let score = 0;
  
  // Pattern penalties
  score += patterns.length * 10;
  
  // Transaction count penalty (if too many too fast)
  if (metrics.txCount > 50) score += 20;
  else if (metrics.txCount > 30) score += 10;
  
  // Variance penalties
  if (metrics.delayVariance < 1) score += 15;
  if (metrics.amountVariance < 0.1) score += 15;
  if (metrics.buySellRatio > 0.9 || metrics.buySellRatio < 0.1) score += 20;
  
  // Cap at 100
  return Math.min(100, score);
}

/**
 * Determine risk level based on score
 */
function getRiskLevel(score: number): 'low' | 'medium' | 'high' {
  if (score < 30) return 'low';
  if (score < 60) return 'medium';
  return 'high';
}

/**
 * Generate recommendations based on detected patterns
 */
function generateRecommendations(
  patterns: string[],
  metrics: PatternMetrics
): string[] {
  const recommendations: string[] = [];
  
  // Timing recommendations
  if (patterns.some(p => p.includes('timing') || p.includes('interval'))) {
    recommendations.push('Vary transaction delays more (use Gaussian distribution)');
    recommendations.push('Add random pauses between transactions');
  }
  
  // Amount recommendations
  if (patterns.some(p => p.includes('amount') || p.includes('Fixed'))) {
    recommendations.push('Vary transaction amounts more');
    recommendations.push('Use skewed distribution favoring micro-transactions');
  }
  
  // Ratio recommendations
  if (patterns.some(p => p.includes('ratio') || p.includes('buy') || p.includes('sell'))) {
    recommendations.push('Balance buy/sell ratio more naturally');
    recommendations.push('Add occasional sell transactions to balance portfolio');
  }
  
  // Slippage recommendations
  if (patterns.some(p => p.includes('slippage'))) {
    recommendations.push('Vary slippage tolerance');
    recommendations.push('Use random slippage between 3-12%');
  }
  
  // General recommendations
  if (patterns.length === 0) {
    recommendations.push('Trading patterns look organic - good job!');
  }
  
  return recommendations;
}

/**
 * Suggest parameter adjustments based on entropy
 */
export function suggestParameterAdjustments(
  currentMinDelay: number,
  currentMaxDelay: number,
  currentMinAmount: number,
  currentMaxAmount: number,
  currentBuyRatio: number
): {
  minDelay: number;
  maxDelay: number;
  minAmount: number;
  maxAmount: number;
  buyRatio: number;
} {
  // Add randomization to parameters
  const newMinDelay = Math.max(1, currentMinDelay + gaussianRandom(0, 5));
  const newMaxDelay = Math.max(newMinDelay + 5, currentMaxDelay + gaussianRandom(0, 10));
  const newMinAmount = Math.max(0.001, currentMinAmount * (0.5 + Math.random()));
  const newMaxAmount = Math.max(newMinAmount * 2, currentMaxAmount * (1 + Math.random()));
  const newBuyRatio = currentBuyRatio + gaussianRandom(0, 0.1);
  
  return {
    minDelay: Math.round(newMinDelay * 10) / 10,
    maxDelay: Math.round(newMaxDelay * 10) / 10,
    minAmount: Math.round(newMinAmount * 1000) / 1000,
    maxAmount: Math.round(newMaxAmount * 1000) / 1000,
    buyRatio: Math.max(0.3, Math.min(0.7, newBuyRatio)),
  };
}

/**
 * Auto-adjust campaign parameters based on entropy
 */
export function autoAdjustParameters(
  entropy: EntropyScore,
  params: {
    minDelay: number;
    maxDelay: number;
    minAmount: number;
    maxAmount: number;
    buyRatio: number;
    slippageMin: number;
    slippageMax: number;
  }
): typeof params {
  if (entropy.riskLevel === 'low') {
    return params; // No adjustment needed
  }
  
  return {
    ...params,
    ...suggestParameterAdjustments(
      params.minDelay,
      params.maxDelay,
      params.minAmount,
      params.maxAmount,
      params.buyRatio
    ),
    // Also vary slippage
    slippageMin: Math.max(3, params.slippageMin - 2),
    slippageMax: Math.min(15, params.slippageMax + 2),
  };
}
