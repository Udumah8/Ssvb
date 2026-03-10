'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import Header from '../../../components/layout/Header';

// Mock campaign data
const mockCampaign = {
  id: '1',
  name: 'PUMP Token Volume',
  tokenMint: 'EPjFWdd5AufqSS9CgBT4...',
  status: 'active',
  strategy: 'drip',
  volume: 124.5,
  makers: 234,
  buyRatio: 62,
  dailySpend: 12.4,
  totalSpend: 45.8,
  createdAt: '2026-03-08',
  wallets: 50,
};

// Mock chart data
const volumeData = [
  { time: '00:00', volume: 12, buys: 8, sells: 4 },
  { time: '04:00', volume: 18, buys: 11, sells: 7 },
  { time: '08:00', volume: 25, buys: 15, sells: 10 },
  { time: '12:00', volume: 32, buys: 20, sells: 12 },
  { time: '16:00', volume: 28, buys: 17, sells: 11 },
  { time: '20:00', volume: 35, buys: 22, sells: 13 },
  { time: '24:00', volume: 42, buys: 26, sells: 16 },
];

// Mock transactions
const mockTransactions = [
  { id: '1', type: 'buy', amount: 0.05, price: 0.042, fees: 0.001, wallet: 'Wallet #12', time: '2 min ago', signature: '5xK9...' },
  { id: '2', type: 'sell', amount: 0.03, price: 0.043, fees: 0.001, wallet: 'Wallet #8', time: '3 min ago', signature: '3fG7...' },
  { id: '3', type: 'buy', amount: 0.08, price: 0.042, fees: 0.002, wallet: 'Wallet #23', time: '5 min ago', signature: '9hJ2...' },
  { id: '4', type: 'buy', amount: 0.02, price: 0.041, fees: 0.001, wallet: 'Wallet #5', time: '7 min ago', signature: '2dS4...' },
  { id: '5', type: 'sell', amount: 0.04, price: 0.044, fees: 0.001, wallet: 'Wallet #17', time: '9 min ago', signature: '7pQ6...' },
  { id: '6', type: 'buy', amount: 0.06, price: 0.042, fees: 0.001, wallet: 'Wallet #31', time: '12 min ago', signature: '4mN8...' },
  { id: '7', type: 'buy', amount: 0.07, price: 0.043, fees: 0.002, wallet: 'Wallet #2', time: '15 min ago', signature: '8kL1...' },
];

const pieData = [
  { name: 'Buys', value: 62, color: '#22c55e' },
  { name: 'Sells', value: 38, color: '#ef4444' },
];

function StatCard({ label, value, subtext }: { label: string; value: string | number; subtext?: string }) {
  return (
    <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
      <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
      {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
    </div>
  );
}

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [campaignStatus, setCampaignStatus] = useState(mockCampaign.status);
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePause = () => {
    setIsUpdating(true);
    setTimeout(() => {
      setCampaignStatus(campaignStatus === 'active' ? 'paused' : 'active');
      setIsUpdating(false);
    }, 500);
  };

  const handleStop = () => {
    if (confirm('Are you sure you want to stop this campaign? This action cannot be undone.')) {
      setCampaignStatus('stopped');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link href="/campaigns" className="text-violet-400 hover:text-violet-300 text-sm font-medium">
              ← Back to Campaigns
            </Link>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold text-white">{mockCampaign.name}</h1>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  campaignStatus === 'active' 
                    ? 'bg-green-500/20 text-green-400'
                    : campaignStatus === 'paused'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-slate-700 text-slate-300'
                }`}>
                  {campaignStatus}
                </span>
              </div>
              <p className="mt-1 text-slate-400 font-mono">{mockCampaign.tokenMint}</p>
              <p className="mt-1 text-sm text-slate-500">
                Strategy: {mockCampaign.strategy} • Created: {mockCampaign.createdAt}
              </p>
            </div>

            {/* Control Buttons */}
            {campaignStatus !== 'stopped' && (
              <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                <button
                  onClick={handlePause}
                  disabled={isUpdating}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    campaignStatus === 'active'
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {campaignStatus === 'active' ? 'Pause' : 'Resume'}
                </button>
                <button
                  onClick={handleStop}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Stop
                </button>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <StatCard label="Total Volume" value={`${mockCampaign.volume} SOL`} />
            <StatCard label="Makers" value={mockCampaign.makers} />
            <StatCard label="Active Wallets" value={mockCampaign.wallets} />
            <StatCard label="Buy Ratio" value={`${mockCampaign.buyRatio}%`} />
            <StatCard label="Daily Spend" value={`${mockCampaign.dailySpend} SOL`} />
            <StatCard label="Total Spend" value={`${mockCampaign.totalSpend} SOL`} />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Volume Chart */}
            <div className="lg:col-span-2 bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h2 className="text-lg font-semibold text-white mb-4">Volume Over Time</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={volumeData}>
                    <defs>
                      <linearGradient id="buyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="sellGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      labelStyle={{ color: '#94a3b8' }}
                    />
                    <Area type="monotone" dataKey="buys" stackId="1" stroke="#22c55e" fill="url(#buyGradient)" name="Buys" />
                    <Area type="monotone" dataKey="sells" stackId="1" stroke="#ef4444" fill="url(#sellGradient)" name="Sells" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Buy/Sell Ratio */}
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h2 className="text-lg font-semibold text-white mb-4">Buy/Sell Ratio</h2>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center space-x-6 mt-4">
                {pieData.map((entry) => (
                  <div key={entry.name} className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
                    <span className="text-sm text-slate-400">{entry.name}: {entry.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Transaction Feed */}
          <div className="bg-slate-900 rounded-xl border border-slate-800">
            <div className="p-6 border-b border-slate-800">
              <h2 className="text-lg font-semibold text-white">Transaction Feed</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-800/50">
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-400 uppercase">Type</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-400 uppercase">Amount</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-400 uppercase">Price</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-400 uppercase">Fees</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-400 uppercase">Wallet</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-400 uppercase">Time</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-400 uppercase">Signature</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          tx.type === 'buy' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {tx.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white">{tx.amount} SOL</td>
                      <td className="py-3 px-4 text-white">${tx.price}</td>
                      <td className="py-3 px-4 text-slate-400">{tx.fees} SOL</td>
                      <td className="py-3 px-4 text-slate-400">{tx.wallet}</td>
                      <td className="py-3 px-4 text-slate-400">{tx.time}</td>
                      <td className="py-3 px-4">
                        <a 
                          href={`https://solscan.io/tx/${tx.signature}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-violet-400 hover:text-violet-300 font-mono text-sm"
                        >
                          {tx.signature}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
