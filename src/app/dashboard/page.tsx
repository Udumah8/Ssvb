'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useAppState } from '../../components/Providers';

// Mock data for the volume chart
const mockChartData = [
  { time: '00:00', volume: 45 },
  { time: '04:00', volume: 52 },
  { time: '08:00', volume: 78 },
  { time: '12:00', volume: 110 },
  { time: '16:00', volume: 95 },
  { time: '20:00', volume: 130 },
  { time: '24:00', volume: 120 },
];

// Mock campaigns data
const mockCampaigns = [
  {
    id: '1',
    name: 'PUMP Token Volume',
    tokenMint: 'EPjFWdd5AufqSS...',
    status: 'active',
    volume: 124.5,
    makers: 234,
    buyRatio: 62,
    dailySpend: 12.4,
  },
  {
    id: '2',
    name: 'Meme Launch Boost',
    tokenMint: 'Dm4iM8jQwQxp...',
    status: 'active',
    volume: 89.2,
    makers: 156,
    buyRatio: 58,
    dailySpend: 8.7,
  },
  {
    id: '3',
    name: 'New Token Push',
    tokenMint: '7xKXtg2Q...',
    status: 'paused',
    volume: 45.8,
    makers: 89,
    buyRatio: 65,
    dailySpend: 4.2,
  },
];

const strategies = [
  { 
    name: 'Drip Mode', 
    description: 'Gradual 24/7 volume (1-5 tx/min)',
    icon: '💧',
    href: '/campaigns/new?strategy=drip'
  },
  { 
    name: 'Burst Mode', 
    description: 'Short aggressive spikes (10-50 tx/min)',
    icon: '⚡',
    href: '/campaigns/new?strategy=burst'
  },
  { 
    name: 'Volume Only', 
    description: 'Maximize tx/makers with micro-swaps',
    icon: '📊',
    href: '/campaigns/new?strategy=volume'
  },
  { 
    name: 'Market Maker', 
    description: 'Liquidity provision within ranges',
    icon: '🏭',
    href: '/campaigns/new?strategy=mm'
  },
];

function StatsCard({ 
  title, 
  value, 
  change, 
  changeType 
}: { 
  title: string; 
  value: string | number; 
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}) {
  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
      <p className="text-sm font-medium text-slate-400">{title}</p>
      <div className="mt-2 flex items-baseline justify-between">
        <p className="text-3xl font-bold text-white">{value}</p>
        {change && (
          <span className={`text-sm font-medium ${
            changeType === 'positive' ? 'text-green-400' : 
            changeType === 'negative' ? 'text-red-400' : 'text-slate-400'
          }`}>
            {change}
          </span>
        )}
      </div>
    </div>
  );
}

function CampaignRow({ campaign }: { campaign: typeof mockCampaigns[0] }) {
  return (
    <tr className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
      <td className="py-4 px-4">
        <div>
          <p className="font-medium text-white">{campaign.name}</p>
          <p className="text-sm text-slate-400 font-mono">{campaign.tokenMint}</p>
        </div>
      </td>
      <td className="py-4 px-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          campaign.status === 'active' 
            ? 'bg-green-500/20 text-green-400'
            : campaign.status === 'paused'
            ? 'bg-yellow-500/20 text-yellow-400'
            : 'bg-slate-700 text-slate-300'
        }`}>
          {campaign.status}
        </span>
      </td>
      <td className="py-4 px-4 text-white">{campaign.volume} SOL</td>
      <td className="py-4 px-4 text-white">{campaign.makers}</td>
      <td className="py-4 px-4">
        <div className="flex items-center">
          <div className="w-16 bg-slate-700 rounded-full h-2 mr-2">
            <div 
              className="bg-violet-500 h-2 rounded-full" 
              style={{ width: `${campaign.buyRatio}%` }}
            />
          </div>
          <span className="text-sm text-slate-400">{campaign.buyRatio}%</span>
        </div>
      </td>
      <td className="py-4 px-4 text-white">{campaign.dailySpend} SOL</td>
      <td className="py-4 px-4">
        <Link 
          href={`/campaigns/${campaign.id}`}
          className="text-violet-400 hover:text-violet-300 text-sm font-medium"
        >
          View →
        </Link>
      </td>
    </tr>
  );
}

export default function DashboardPage() {
  const { stats } = useAppState();
  
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-slate-400">Monitor and manage your volume campaigns</p>
        </div>
        <Link
          href="/campaigns/new"
          className="inline-flex items-center px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Campaign
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Volume" 
          value="259.5 SOL" 
          change="+23.4%" 
          changeType="positive"
        />
        <StatsCard 
          title="Active Campaigns" 
          value={2} 
          change="Running" 
          changeType="neutral"
        />
        <StatsCard 
          title="Total Makers" 
          value="479" 
          change="+89" 
          changeType="positive"
        />
        <StatsCard 
          title="Total Spend" 
          value="25.3 SOL" 
          change="-$4.2" 
          changeType="negative"
        />
      </div>

      {/* Quick Start Section */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Quick Start</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {strategies.map((strategy) => (
            <Link
              key={strategy.name}
              href={strategy.href}
              className="bg-slate-900 hover:bg-slate-800 rounded-xl p-6 border border-slate-800 hover:border-violet-500/50 transition-all group"
            >
              <div className="text-3xl mb-3">{strategy.icon}</div>
              <h3 className="font-semibold text-white group-hover:text-violet-400 transition-colors">
                {strategy.name}
              </h3>
              <p className="text-sm text-slate-400 mt-1">{strategy.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Active Campaigns Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Active Campaigns</h2>
          <Link href="/campaigns" className="text-violet-400 hover:text-violet-300 text-sm font-medium">
            View All →
          </Link>
        </div>
        
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-800/50">
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Volume
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Makers
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Buy Ratio
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Daily Spend
                  </th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {mockCampaigns.map((campaign) => (
                  <CampaignRow key={campaign.id} campaign={campaign} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Volume Chart */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Volume Over Time</h2>
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData}>
                <defs>
                  <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="time" 
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis 
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(value) => `${value} SOL`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#94a3b8' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value) => [`${value} SOL`, 'Volume']}
                />
                <Area 
                  type="monotone" 
                  dataKey="volume" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  fill="url(#volumeGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
