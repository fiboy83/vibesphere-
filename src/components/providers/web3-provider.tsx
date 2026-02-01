'use client';

import React from 'react';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import { WagmiProvider } from 'wagmi';
import { defineChain } from 'viem';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 0. Set up a QueryClient
const queryClient = new QueryClient();

// 1. Get projectID at https://cloud.walletconnect.com
const projectId = '8d221f109724c678bf97f2382983376c';

// 2. Create wagmiConfig
const metadata = {
  name: 'vibesphere',
  description: 'pharos social layer',
  url: 'https://localhost:3000', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

const pharosTestnet = defineChain({
  id: 237,
  name: 'Pharos Atlantic Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'PHAROS',
    symbol: 'PHRS',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.atlantic.pharos.network'],
    },
  },
  blockExplorers: {
    default: { name: 'Pharos Scan', url: 'https://pharos-testnet.socialscan.io' },
  },
  testnet: true,
});

const chains = [pharosTestnet] as const;

const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  //...wagmiOptions // Optional - Override createConfig parameters
});

// 3. Create modal
createWeb3Modal({ wagmiConfig, projectId, chains });

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
