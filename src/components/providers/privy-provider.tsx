'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { defineChain } from 'viem';

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

export function PrivyClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId="cml3q7qoi00btkw0cm7usfh1k"
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#FFFFFF',
          showWalletLoginFirst: true,
        },
        loginMethods: ['wallet'],
        defaultChain: pharosTestnet,
        supportedChains: [pharosTestnet],
      }}
    >
      {children}
    </PrivyProvider>
  );
}
