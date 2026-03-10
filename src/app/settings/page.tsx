'use client';

import { useState } from 'react';
import Header from '../../components/layout/Header';

interface Settings {
  rpcUrl: string;
  jitoUuid: string;
  nozomiApiKey: string;
  astralaneApiKey: string;
  emailAlerts: boolean;
  telegramWebhook: string;
  telegramAlerts: boolean;
  defaultWalletCount: string;
  defaultMinAmount: string;
  defaultMaxAmount: string;
  defaultBuyRatio: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || '',
    jitoUuid: '',
    nozomiApiKey: '',
    astralaneApiKey: '',
    emailAlerts: true,
    telegramWebhook: '',
    telegramAlerts: true,
    defaultWalletCount: '50',
    defaultMinAmount: '0.01',
    defaultMaxAmount: '0.1',
    defaultBuyRatio: '60',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSaveMessage('Settings saved successfully!');
    } catch (error) {
      setSaveMessage('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main className="py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="mt-1 text-slate-400">Configure your SVBB preferences</p>
          </div>

          {/* RPC Settings */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">RPC Configuration</h2>
            <p className="text-sm text-slate-400 mb-4">
              Configure your Solana RPC endpoint. We recommend using a premium provider like Helius or QuickNode for better reliability.
            </p>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                RPC URL
              </label>
              <input
                type="url"
                value={settings.rpcUrl}
                onChange={(e) => updateSetting('rpcUrl', e.target.value)}
                placeholder="https://api.mainnet-beta.solana.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* MEV Provider Settings */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">MEV Protection</h2>
            <p className="text-sm text-slate-400 mb-4">
              Configure your MEV protection providers for better execution quality.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Jito UUID
                </label>
                <input
                  type="text"
                  value={settings.jitoUuid}
                  onChange={(e) => updateSetting('jitoUuid', e.target.value)}
                  placeholder="Your Jito UUID"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-slate-500">Get your UUID from <a href="https://jito.lol" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">jito.lol</a></p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nozomi API Key
                </label>
                <input
                  type="password"
                  value={settings.nozomiApiKey}
                  onChange={(e) => updateSetting('nozomiApiKey', e.target.value)}
                  placeholder="Your Nozomi API key"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Astralane API Key
                </label>
                <input
                  type="password"
                  value={settings.astralaneApiKey}
                  onChange={(e) => updateSetting('astralaneApiKey', e.target.value)}
                  placeholder="Your Astralane API key"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">Notifications</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">Email Alerts</p>
                  <p className="text-sm text-slate-400">Receive campaign updates via email</p>
                </div>
                <button
                  onClick={() => updateSetting('emailAlerts', !settings.emailAlerts)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.emailAlerts ? 'bg-violet-600' : 'bg-slate-700'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.emailAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">Telegram Alerts</p>
                  <p className="text-sm text-slate-400">Receive campaign updates via Telegram</p>
                </div>
                <button
                  onClick={() => updateSetting('telegramAlerts', !settings.telegramAlerts)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.telegramAlerts ? 'bg-violet-600' : 'bg-slate-700'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.telegramAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Telegram Webhook URL
                </label>
                <input
                  type="url"
                  value={settings.telegramWebhook}
                  onChange={(e) => updateSetting('telegramWebhook', e.target.value)}
                  placeholder="https://api.telegram.org/bot<TOKEN>/sendMessage?chat_id=<CHAT_ID>"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Default Campaign Settings */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">Default Campaign Settings</h2>
            <p className="text-sm text-slate-400 mb-4">
              These defaults will be pre-filled when creating new campaigns.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Default Wallet Count
                </label>
                <input
                  type="number"
                  min="10"
                  max="500"
                  value={settings.defaultWalletCount}
                  onChange={(e) => updateSetting('defaultWalletCount', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Default Buy Ratio (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.defaultBuyRatio}
                  onChange={(e) => updateSetting('defaultBuyRatio', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Min Trade Amount (SOL)
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={settings.defaultMinAmount}
                  onChange={(e) => updateSetting('defaultMinAmount', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Max Trade Amount (SOL)
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={settings.defaultMaxAmount}
                  onChange={(e) => updateSetting('defaultMaxAmount', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end space-x-4">
            {saveMessage && (
              <span className={`text-sm ${saveMessage.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
                {saveMessage}
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
