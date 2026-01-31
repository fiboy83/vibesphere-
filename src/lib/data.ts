import type { ImagePlaceholder } from './placeholder-images';
import { PlaceHolderImages } from './placeholder-images';

type User = {
  name: string;
  handle: string;
  avatar: ImagePlaceholder;
};

export type Cast = {
  id: number;
  user: User;
  timestamp: string;
  content: string;
  stats: {
    comments: number;
    recasts: number;
    likes: number;
  };
};

const users = {
  vibecoder: {
    name: 'VibeCoder.eth',
    handle: '@vibecoder',
    avatar: PlaceHolderImages.find(img => img.id === 'vibecoder-avatar')!,
  },
  anotherUser: {
      name: '0xNeon',
      handle: '@neondreamer',
      avatar: PlaceHolderImages.find(img => img.id === 'another-user-avatar')!,
  }
};

export const currentUser = {
    name: 'VibeCoder.eth',
    handle: '@vibecoder',
    avatar: PlaceHolderImages.find(img => img.id === 'current-user-avatar')!
}

export const mockCasts: Cast[] = [
  {
    id: 1,
    user: users.vibecoder,
    timestamp: '2h',
    content: 'Just deployed the first iteration of the OPN Nexus. The Year 3000 aesthetic is coming to life. Glassmorphism + Neon = Future 🔮',
    stats: {
      comments: 12,
      recasts: 5,
      likes: 42,
    },
  },
  {
    id: 2,
    user: users.anotherUser,
    timestamp: '5h',
    content: `Quantum trackers are showing a spike in $OPN. The network is buzzing... Haptic feedback on the charts feels incredible. It's like feeling the market's pulse.`,
    stats: {
      comments: 8,
      recasts: 2,
      likes: 28,
    },
  },
  {
    id: 3,
    user: users.vibecoder,
    timestamp: '1d',
    content: `Thinking about integrating a ZK-proof system for private transactions within the Neural Wallet. Who's interested in contributing? #web3 #privacy`,
    stats: {
      comments: 34,
      recasts: 15,
      likes: 99,
    },
  }
];
