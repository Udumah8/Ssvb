'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../../components/layout/Header';

// Mock campaigns data
const mockCampaigns = [
  {
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
  },
  {
    id: '2',
    name: 'Meme Launch Boost',
    tokenMint: 'Dm4iM8jQwQxpm5G...',
    status: 'active',
    strategy: 'burst',
    volume: 89.2,
    makers: 156,
    buyRatio: 58,
    dailySpend: 8.7,
    totalSpend: 23.4,
    createdAt: '2026-03-09',
  },
  {
    id: '3',
    name: 'New Token Push',
    tokenMint: '7xKXtg2QwGPh5v...',
    status: 'paused',
    strategy: 'volume',
    volume: 45.8,
    makers: 89,
    buyRatio: 65,
    dailySpend: 4.2,
    totalSpend: 12.1,
    createdAt: '2026-03-07',
  },
  {
    id: '4',
    name: 'SOL Token Boost',
    tokenMint: 'So1111111111111...',
    status: 'stopped',
    strategy: 'mm',
    volume: 210.3,
    makers: 445,
    buyRatio: 55,
    dailySpend: 0,
    totalSpend: 89.5,
    createdAt: '2026-03-01',
  },
];

const statusFilters = ['all', 'active', 'paused', 'stopped'];

export default function CampaignsPage() {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCampaigns = mockCampaigns.filter((campaign) => {
    const matchesFilter = filter === 'all' || campaign.status === filter;
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.tokenMint.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Campaigns</h1>
              <p className="mt-1 text-slate-400">Manage your volume generation campaigns</p>
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

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 pl-10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <div className="flex gap-2">
              {statusFilters.map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === status
                      ? 'bg-violet-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Campaigns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => (
              <Link
                key={campaign.id}
                href={`/campaigns/${campaign.id}`}
                className="bg-slate-900 rounded-xl border border-slate-800 p-6 hover:border-violet-500/50 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-violet-400 transition-colors">
                      {campaign.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-1">
                      {campaign.tokenMint}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    campaign.status === 'active' 
                      ? 'bg-green-500/20 text-green-400'
                      : campaign.status === 'paused'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-slate-700 text-slate-300'
                  }`}>
                    {campaign.status}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Strategy</span>
                    <span className="text-white capitalize">{campaign.strategy}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Volume</span>
                    <span className="text-white">{campaign.volume} SOL</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Makers</span>
                    <span className="text-white">{campaign.makers}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Total Spend</span>
                    <span className="text-white">{campaign.totalSpend} SOL</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Created {campaign.createdAt}</span>
                    <span className="text-violet-400 group-hover:text-violet-300">View Details →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredCampaigns.length === 0 && (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-slate-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-white">No campaigns found</h3>
              <p className="mt-2 text-slate-400">Get started by creating a new campaign.</p>
              <Link
                href="/campaigns/new"
                className="mt-4 inline-flex items-center px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors"
              >
                Create Campaign
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
