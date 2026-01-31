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
      name: 'DevDude',
      handle: '@devdude',
      avatar: PlaceHolderImages.find(img => img.id === 'another-user-avatar')!,
  }
};

export const currentUser = {
    avatar: PlaceHolderImages.find(img => img.id === 'current-user-avatar')!
}

export const mockCasts: Cast[] = [
  {
    id: 1,
    user: users.vibecoder,
    timestamp: '2h',
    content: 'Just finished building a Farcaster clone layout. The decentralized vibe is real! 🚀 $DEGEN',
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
    content: 'Excited to be on Castaway! This feels like the future of social media. What are you all building?',
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
    content: 'Thinking about the next feature to build. Maybe DMs or channels? What do you think?',
    stats: {
      comments: 34,
      recasts: 15,
      likes: 99,
    },
  }
];
