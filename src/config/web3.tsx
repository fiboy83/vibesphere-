'use client';

import { createConfig, http } from 'wagmi';
import { walletConnect, injected } from 'wagmi/connectors';
import { defineChain } from 'viem';

export const projectId = '8d221f109724c678bf97f2382983376c';

if (!projectId) {
  throw new Error('VITE_PROJECT_ID is not set');
}

export const metadata = {
  name: 'vibesphere_atlantic',
  description: 'Vibesphere on Pharos Atlantic - a new sovereign session.',
  url: 'https://web3modal.com',
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

export const chains = [pharosTestnet] as const;

export const wagmiConfig = createConfig({
  chains,
  transports: {
    [pharosTestnet.id]: http('https://rpc.atlantic.pharos.network', { batch: false })
  },
  connectors: [
    injected({ shimDisconnect: true }),
    walletConnect({ projectId, metadata, showQrModal: true }),
  ],
  ssr: true,
  multiInjectedProviderDiscovery: false,
});
