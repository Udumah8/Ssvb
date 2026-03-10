'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/layout/Header';

type Strategy = 'drip' | 'burst' | 'volume' | 'mm';

interface CampaignForm {
  name: string;
  tokenMint: string;
  strategy: Strategy;
  totalBudget: string;
  dailyBudget: string;
  hourlyBudget: string;
  walletCount: string;
  minAmount: string;
  maxAmount: string;
  buyRatio: string;
  slippageMin: string;
  slippageMax: string;
  delayMin: string;
  delayMax: string;
  mevProvider: string;
}

const strategies = [
  { 
    id: 'drip' as Strategy,
    name: 'Drip Mode', 
    description: 'Gradual 24/7 volume with steady 1-5 transactions per minute per wallet',
    icon: '💧',
  },
  { 
    id: 'burst' as Strategy,
    name: 'Burst Mode', 
    description: 'Short aggressive spikes of 10-50 transactions per minute',
    icon: '⚡',
  },
  { 
    id: 'volume' as Strategy,
    name: 'Volume Only', 
    description: 'Maximize transaction count and makers with micro-swaps',
    icon: '📊',
  },
  { 
    id: 'mm' as Strategy,
    name: 'Market Maker', 
    description: 'Provide liquidity within a price range (±3-10%)',
    icon: '🏭',
  },
];

const steps = [
  { id: 1, name: 'Token', description: 'Token address' },
  { id: 2, name: 'Strategy', description: 'Trading mode' },
  { id: 3, name: 'Budget', description: 'Spend limits' },
  { id: 4, name: 'Realism', description: 'Randomization' },
];

function NewCampaignContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [form, setForm] = useState<CampaignForm>({
    name: '',
    tokenMint: '',
    strategy: (searchParams.get('strategy') as Strategy) || 'drip',
    totalBudget: '100',
    dailyBudget: '20',
    hourlyBudget: '5',
    walletCount: '50',
    minAmount: '0.01',
    maxAmount: '0.1',
    buyRatio: '60',
    slippageMin: '3',
    slippageMax: '12',
    delayMin: '1',
    delayMax: '30',
    mevProvider: 'jito',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const strategy = searchParams.get('strategy');
    if (strategy && ['drip', 'burst', 'volume', 'mm'].includes(strategy)) {
      setForm((prev) => ({ ...prev, strategy: strategy as Strategy }));
    }
  }, [searchParams]);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!form.name.trim()) {
        newErrors.name = 'Campaign name is required';
      }
      if (!form.tokenMint.trim()) {
        newErrors.tokenMint = 'Token mint address is required';
      } else if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(form.tokenMint)) {
        newErrors.tokenMint = 'Invalid token mint address';
      }
    }
    
    if (step === 2) {
      if (!form.strategy) {
        newErrors.strategy = 'Please select a strategy';
      }
    }
    
    if (step === 3) {
      if (!form.totalBudget || parseFloat(form.totalBudget) <= 0) {
        newErrors.totalBudget = 'Total budget must be greater than 0';
      }
      if (!form.dailyBudget || parseFloat(form.dailyBudget) <= 0) {
        newErrors.dailyBudget = 'Daily budget must be greater than 0';
      }
      if (parseFloat(form.dailyBudget) > parseFloat(form.totalBudget)) {
        newErrors.dailyBudget = 'Daily budget cannot exceed total budget';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    
    setIsSubmitting(true);
    
    try {
      // In a real app, this would call the API
      console.log('Creating campaign:', form);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Redirect to campaigns list
      router.push('/campaigns');
    } catch (error) {
      console.error('Failed to create campaign:', error);
      setErrors({ submit: 'Failed to create campaign. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateForm = (field: keyof CampaignForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main className="py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <Link href="/campaigns" className="text-violet-400 hover:text-violet-300 text-sm font-medium">
              ← Back to Campaigns
            </Link>
            <h1 className="text-3xl font-bold text-white mt-4">Create New Campaign</h1>
            <p className="mt-1 text-slate-400">Set up your volume generation campaign</p>
          </div>

          {/* Steps */}
          <div className="mb-8">
            <nav aria-label="Progress">
              <ol className="flex items-center">
                {steps.map((step, index) => (
                  <li key={step.id} className={`relative ${index !== steps.length - 1 ? 'pr-8 sm:pr-20 flex-1' : ''}`}>
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      {index !== steps.length - 1 && (
                        <div className={`h-0.5 w-full transition-colors ${
                          step.id < currentStep ? 'bg-violet-600' : 'bg-slate-800'
                        }`} />
                      )}
                    </div>
                    <button
                      onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                      disabled={step.id > currentStep}
                      className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                        step.id === currentStep
                          ? 'bg-violet-600 text-white'
                          : step.id < currentStep
                          ? 'bg-violet-600/20 text-violet-400 hover:bg-violet-600/30'
                          : 'bg-slate-800 text-slate-500'
                      } ${step.id < currentStep ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                    >
                      {step.id < currentStep ? (
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className="text-sm font-medium">{step.id}</span>
                      )}
                    </button>
                    <div className="hidden sm:block absolute top-12 left-1/2 -translate-x-1/2">
                      <span className={`text-xs font-medium ${step.id === currentStep ? 'text-white' : 'text-slate-500'}`}>
                        {step.name}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </nav>
          </div>

          {/* Form */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            {/* Step 1: Token */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white">Token Details</h2>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => updateForm('name', e.target.value)}
                    placeholder="e.g., PUMP Token Volume"
                    className={`w-full bg-slate-950 border ${errors.name ? 'border-red-500' : 'border-slate-700'} rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent`}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Token Mint Address
                  </label>
                  <input
                    type="text"
                    value={form.tokenMint}
                    onChange={(e) => updateForm('tokenMint', e.target.value)}
                    placeholder="Enter token mint address"
                    className={`w-full bg-slate-950 border ${errors.tokenMint ? 'border-red-500' : 'border-slate-700'} rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent font-mono`}
                  />
                  {errors.tokenMint && <p className="mt-1 text-sm text-red-500">{errors.tokenMint}</p>}
                  <p className="mt-2 text-xs text-slate-500">
                    The Solana token address you want to generate volume for
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Strategy */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white">Select Strategy</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {strategies.map((strategy) => (
                    <button
                      key={strategy.id}
                      onClick={() => updateForm('strategy', strategy.id)}
                      className={`text-left p-4 rounded-lg border transition-all ${
                        form.strategy === strategy.id
                          ? 'bg-violet-600/20 border-violet-500'
                          : 'bg-slate-950 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{strategy.icon}</span>
                        <div>
                          <h3 className="font-medium text-white">{strategy.name}</h3>
                          <p className="text-xs text-slate-400 mt-1">{strategy.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Budget */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white">Budget Settings</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Total Budget (SOL)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={form.totalBudget}
                      onChange={(e) => updateForm('totalBudget', e.target.value)}
                      className={`w-full bg-slate-950 border ${errors.totalBudget ? 'border-red-500' : 'border-slate-700'} rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent`}
                    />
                    {errors.totalBudget && <p className="mt-1 text-sm text-red-500">{errors.totalBudget}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Daily Budget (SOL)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={form.dailyBudget}
                      onChange={(e) => updateForm('dailyBudget', e.target.value)}
                      className={`w-full bg-slate-950 border ${errors.dailyBudget ? 'border-red-500' : 'border-slate-700'} rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent`}
                    />
                    {errors.dailyBudget && <p className="mt-1 text-sm text-red-500">{errors.dailyBudget}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Hourly Budget (SOL)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={form.hourlyBudget}
                      onChange={(e) => updateForm('hourlyBudget', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    MEV Provider
                  </label>
                  <select
                    value={form.mevProvider}
                    onChange={(e) => updateForm('mevProvider', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  >
                    <option value="jito">Jito (Recommended)</option>
                    <option value="nozomi">Nozomi</option>
                    <option value="astralane">Astralane</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 4: Realism */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white">Realism Settings</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Number of Wallets
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="500"
                      value={form.walletCount}
                      onChange={(e) => updateForm('walletCount', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-slate-500">10-500 wallets for distribution</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Buy/Sell Ratio
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={form.buyRatio}
                        onChange={(e) => updateForm('buyRatio', e.target.value)}
                        className="flex-1"
                      />
                      <span className="text-white font-medium w-12 text-right">{form.buyRatio}%</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Higher = more buys, Lower = more sells</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Min/Max Trade Amount (SOL)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        step="0.001"
                        min="0.001"
                        value={form.minAmount}
                        onChange={(e) => updateForm('minAmount', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      />
                      <span className="text-slate-500">-</span>
                      <input
                        type="number"
                        step="0.001"
                        min="0.001"
                        value={form.maxAmount}
                        onChange={(e) => updateForm('maxAmount', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Slippage Range (%)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        max="15"
                        value={form.slippageMin}
                        onChange={(e) => updateForm('slippageMin', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      />
                      <span className="text-slate-500">-</span>
                      <input
                        type="number"
                        min="1"
                        max="15"
                        value={form.slippageMax}
                        onChange={(e) => updateForm('slippageMax', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Delay Between Trades (seconds)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        max="300"
                        value={form.delayMin}
                        onChange={(e) => updateForm('delayMin', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      />
                      <span className="text-slate-500">-</span>
                      <input
                        type="number"
                        min="1"
                        max="300"
                        value={form.delayMax}
                        onChange={(e) => updateForm('delayMax', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-slate-800">
              {currentStep > 1 ? (
                <button
                  onClick={handleBack}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                >
                  Back
                </button>
              ) : (
                <div />
              )}
              
              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating...' : 'Launch Campaign'}
                </button>
              )}
            </div>

            {errors.submit && (
              <p className="mt-4 text-sm text-red-500 text-center">{errors.submit}</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function NewCampaignPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="text-slate-400">Loading...</div></div>}>
      <NewCampaignContent />
    </Suspense>
  );
}
