'use client';

import { createContext, useContext, useState, useSyncExternalStore, ReactNode } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Client-side only store
function useClientOnly() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

// Socket context for real-time updates
interface SocketContextType {
  isConnected: boolean;
  socket: unknown | null;
}

const SocketContext = createContext<SocketContextType>({
  isConnected: false,
  socket: null,
});

export const useSocket = () => useContext(SocketContext);

// App state context
interface AppStateContextType {
  campaigns: unknown[];
  wallets: unknown[];
  stats: {
    totalVolume: number;
    activeCampaigns: number;
    totalMakers: number;
  };
}

const AppStateContext = createContext<AppStateContextType>({
  campaigns: [],
  wallets: [],
  stats: {
    totalVolume: 0,
    activeCampaigns: 0,
    totalMakers: 0,
  },
});

export const useAppState = () => useContext(AppStateContext);

const WalletConnectionProvider = ({ children }: { children: ReactNode }) => {
  const isMounted = useClientOnly();
  
  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ];

  const endpoint = clusterApiUrl('mainnet-beta');

  // Always render providers - the wallet adapter handles SSR gracefully
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={isMounted}>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WalletConnectionProvider>
      <AppStateProvider>
        <SocketProvider>
          {children}
        </SocketProvider>
      </AppStateProvider>
    </WalletConnectionProvider>
  );
}

// Socket Provider
function SocketProvider({ children }: { children: ReactNode }) {
  const [isConnected] = useState(false);
  const [socket] = useState<unknown>(null);

  return (
    <SocketContext.Provider value={{ isConnected, socket }}>
      {children}
    </SocketContext.Provider>
  );
}

// App State Provider
function AppStateProvider({ children }: { children: ReactNode }) {
  const [campaigns] = useState<unknown[]>([]);
  const [wallets] = useState<unknown[]>([]);
  const [stats] = useState({
    totalVolume: 0,
    activeCampaigns: 0,
    totalMakers: 0,
  });

  return (
    <AppStateContext.Provider value={{ campaigns, wallets, stats }}>
      {children}
    </AppStateContext.Provider>
  );
}
