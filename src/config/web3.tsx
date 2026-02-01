import { defaultWagmiConfig } from '@web3modal/wagmi/react';
import { defineChain } from 'viem';

// 1. Get projectID at https://cloud.walletconnect.com
export const projectId = '8d221f109724c678bf97f2382983376c';

// 2. Create wagmiConfig
export const metadata = {
  name: 'vibesphere',
  description: 'pharos social layer',
  url: 'https://web3modal.com', // origin must match your domain & subdomain
  icons: []
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

export const chains = [pharosTestnet] as const;

export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
});
