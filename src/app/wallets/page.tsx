'use client';

import { useState } from 'react';
import Header from '../../components/layout/Header';

// Mock wallet data
const mockWallets = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `Wallet #${i + 1}`,
  address: `${(Math.random().toString(36).substring(2, 10) + '...').padEnd(44, 'x')}`,
  status: i < 15 ? 'active' : i < 18 ? 'cooling' : 'paused',
  balance: (Math.random() * 2).toFixed(3),
  totalVolume: (Math.random() * 50).toFixed(1),
  transactions: Math.floor(Math.random() * 200),
  lastUsed: `${Math.floor(Math.random() * 24)} hours ago`,
}));

const statusFilters = ['all', 'active', 'cooling', 'paused'];

export default function WalletsPage() {
  const [filter, setFilter] = useState('all');
  const [selectedWallets, setSelectedWallets] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const filteredWallets = mockWallets.filter((wallet) => {
    return filter === 'all' || wallet.status === filter;
  });

  const handleSelectAll = () => {
    if (selectedWallets.length === filteredWallets.length) {
      setSelectedWallets([]);
    } else {
      setSelectedWallets(filteredWallets.map((w) => w.id));
    }
  };

  const handleSelectWallet = (id: number) => {
    setSelectedWallets((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
  };

  const handleFund = async () => {
    if (selectedWallets.length === 0) return;
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    alert(`Funded ${selectedWallets.length} wallets`);
    setSelectedWallets([]);
  };

  const handleRecover = async () => {
    if (selectedWallets.length === 0) return;
    if (!confirm(`Recover funds from ${selectedWallets.length} wallets?`)) return;
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    alert(`Recovered funds from ${selectedWallets.length} wallets`);
    setSelectedWallets([]);
  };

  const totalStats = {
    wallets: mockWallets.length,
    active: mockWallets.filter((w) => w.status === 'active').length,
    totalBalance: mockWallets.reduce((sum, w) => sum + parseFloat(w.balance), 0).toFixed(2),
    totalVolume: mockWallets.reduce((sum, w) => sum + parseFloat(w.totalVolume), 0).toFixed(1),
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Wallet Management</h1>
              <p className="mt-1 text-slate-400">Manage your burner wallets</p>
            </div>
            <button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors">
              Generate New Wallets
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
              <p className="text-xs text-slate-500 uppercase">Total Wallets</p>
              <p className="text-2xl font-bold text-white mt-1">{totalStats.wallets}</p>
            </div>
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
              <p className="text-xs text-slate-500 uppercase">Active</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{totalStats.active}</p>
            </div>
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
              <p className="text-xs text-slate-500 uppercase">Total Balance</p>
              <p className="text-2xl font-bold text-white mt-1">{totalStats.totalBalance} SOL</p>
            </div>
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
              <p className="text-xs text-slate-500 uppercase">Total Volume</p>
              <p className="text-2xl font-bold text-white mt-1">{totalStats.totalVolume} SOL</p>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
            
            <div className="flex-1" />

            {selectedWallets.length > 0 && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-slate-400">
                  {selectedWallets.length} selected
                </span>
                <button
                  onClick={handleFund}
                  disabled={isLoading}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Fund'}
                </button>
                <button
                  onClick={handleRecover}
                  disabled={isLoading}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Recover'}
                </button>
              </div>
            )}
          </div>

          {/* Wallets Table */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-800/50">
                    <th className="py-3 px-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedWallets.length === filteredWallets.length && filteredWallets.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-slate-600 bg-slate-800 text-violet-600 focus:ring-violet-500"
                      />
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-400 uppercase">Wallet</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-400 uppercase">Status</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-400 uppercase">Balance</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-400 uppercase">Volume</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-400 uppercase">TXs</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-400 uppercase">Last Used</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWallets.map((wallet) => (
                    <tr key={wallet.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedWallets.includes(wallet.id)}
                          onChange={() => handleSelectWallet(wallet.id)}
                          className="rounded border-slate-600 bg-slate-800 text-violet-600 focus:ring-violet-500"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-white">{wallet.name}</p>
                          <p className="text-xs text-slate-500 font-mono">{wallet.address}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          wallet.status === 'active'
                            ? 'bg-green-500/20 text-green-400'
                            : wallet.status === 'cooling'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-slate-700 text-slate-300'
                        }`}>
                          {wallet.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white">{wallet.balance} SOL</td>
                      <td className="py-3 px-4 text-white">{wallet.totalVolume} SOL</td>
                      <td className="py-3 px-4 text-white">{wallet.transactions}</td>
                      <td className="py-3 px-4 text-slate-400">{wallet.lastUsed}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <button className="text-violet-400 hover:text-violet-300 text-sm font-medium">
                            Fund
                          </button>
                          <button className="text-yellow-400 hover:text-yellow-300 text-sm font-medium">
                            Recover
                          </button>
                        </div>
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
