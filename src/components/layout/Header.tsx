'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Campaigns', href: '/campaigns' },
  { name: 'Wallets', href: '/wallets' },
  { name: 'Settings', href: '/settings' },
];

export default function Header() {
  const pathname = usePathname();
  const { connected } = useWallet();

  return (
    <header className="bg-slate-900 border-b border-slate-800">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">SVBB</span>
            </Link>
            
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                      isActive
                        ? 'border-violet-500 text-white'
                        : 'border-transparent text-slate-400 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <span className={`h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-slate-500'}`} />
              <span>{connected ? 'Wallet Connected' : 'Not Connected'}</span>
            </div>
            <WalletMultiButton className="!bg-violet-600 !hover:bg-violet-700 !text-white !rounded-lg !text-sm !font-medium" />
          </div>
        </div>
      </nav>
    </header>
  );
}
