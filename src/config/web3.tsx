'use client';

import { createConfig, http, createStorage } from 'wagmi';
import { walletConnect, injected } from 'wagmi/connectors';
import { defineChain } from 'viem';

export const projectId = '8d221f109724c678bf97f2382983376c';

if (!projectId) {
  throw new Error('VITE_PROJECT_ID is not set');
}

// Updated metadata to force identity change
export const metadata = {
  name: 'vibesphere_atlantic',
  description: 'Vibesphere on Pharos Atlantic - a new sovereign session.',
  url: 'https://web3modal.com', // Static URL to avoid SSR issues
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
     public: {
      http: ['https://rpc.atlantic.pharos.network'],
    },
  },
  blockExplorers: {
    default: { name: 'Pharos Scan', url: 'https://pharos-testnet.socialscan.io' },
  },
  testnet: true,
});

// The chains array now ONLY contains pharosTestnet
export const chains = [pharosTestnet] as const;

export const wagmiConfig = createConfig({
  chains,
  transports: {
    // Force secure HTTP transport, disable batching
    [pharosTestnet.id]: http('https://rpc.atlantic.pharos.network', { batch: false })
  },
  connectors: [
    walletConnect({ projectId, metadata, showQrModal: false }),
    injected({ shimDisconnect: true }),
  ],
  // Use a new storage key to force a new session and resolve pairing errors
  storage: createStorage({
    storage: typeof window !== 'undefined' ? window.localStorage : ({ getItem: () => null, setItem: () => {}, removeItem: () => {} }),
    key: 'vibesphere_v3',
  }),
  // Enable SSR and disable multi-provider discovery for stability in Next.js
  ssr: true,
  multiInjectedProviderDiscovery: false,
});
