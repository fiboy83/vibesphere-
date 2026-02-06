'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { defineChain } from 'viem';
import { useState, useEffect } from 'react';

export const pharosTestnet = defineChain({
  id: 688689,
  name: 'Pharos Atlantic Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'PHAROS',
    symbol: 'PHRS',
  },
  rpcUrls: {
    default: {
      http: ['https://atlantic.dplabs-internal.com'],
    },
  },
  blockExplorers: {
    default: { name: 'Pharos Scan', url: 'https://pharos-testnet.socialscan.io' },
  },
  testnet: true,
});

export function PrivyClientProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Return null on the server and during the initial client-side render
  // to prevent Privy from initializing during the build or prerender.
  if (!mounted) {
    return null;
  }

  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!privyAppId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-900 text-white text-center p-4 font-mono">
        <div>
            <h1 className="text-2xl font-bold mb-4">Privy App ID Not Found</h1>
            <p>Please set the <code className="bg-black/50 px-2 py-1 rounded">NEXT_PUBLIC_PRIVY_APP_ID</code> environment variable in your <code className="bg-black/50 px-2 py-1 rounded">.env.local</code> file.</p>
        </div>
      </div>
    );
  }

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#FFFFFF',
          showWalletLoginFirst: true,
        },
        loginMethods: ['wallet'],
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
        defaultChain: pharosTestnet,
        supportedChains: [pharosTestnet],
      }}
    >
      {children}
    </PrivyProvider>
  );
}
