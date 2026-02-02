'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, ArrowDownLeft, ArrowUpRight, CheckCircle, Clock, Menu, Search, X, Share2, MessageSquare, Repeat, Heart, Send, Copy, ArrowLeft, Edit2, FileUp, Video, Type, FileText, Bookmark, User, Bell, DollarSign, Settings, Link as LinkIcon } from 'lucide-react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { createPublicClient, http, formatEther, parseEther, createWalletClient, custom, fallback } from 'viem';
import { pharosTestnet } from '@/components/providers/privy-provider';
import { useToast } from "@/hooks/use-toast";


// --- PHAROS CHAIN ID ---
const PHAROS_CHAIN_ID = 237;

// --- Helper Functions ---
function hexToRgb(hex: string): [number, number, number] | null {
  if (!hex) return null;
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.startsWith('#') ? hex.substring(1) : hex);
  return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
  ] : null;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s, l];
}

const getDominantColorFromImage = (imageUrl: string, onComplete: (hslValues: string) => void) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;
    img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = 10;
        canvas.height = 10;
        ctx.drawImage(img, 0, 0, 10, 10);

        const imageData = ctx.getImageData(0, 0, 10, 10);
        const data = imageData.data;
        let r = 0, g = 0, b = 0;

        for (let i = 0; i < data.length; i += 4) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
        }

        const pixelCount = data.length / 4;
        r = Math.floor(r / pixelCount);
        g = Math.floor(g / pixelCount);
        b = Math.floor(b / pixelCount);

        let [h, s, l] = rgbToHsl(r, g, b);
        
        s = Math.min(1, s * 1.5); // Boost saturation
        l = Math.max(0.55, Math.min(0.75, l)); // Adjust lightness for visibility

        const newPrimaryValues = `${h.toFixed(0)} ${(s * 100).toFixed(0)}% ${(l * 100).toFixed(0)}%`;
        onComplete(newPrimaryValues);
    };
};

// --- COMPONENT: RESONANCE CARD ---
const ResonanceCard = ({ children, style, onClick }: { children: React.ReactNode, style?: React.CSSProperties, onClick?: () => void }) => {
    const cardContent = (
      <motion.div 
        variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}
        whileHover={onClick ? { y: -8, scale: 1.01 } : {}}
        className="relative px-8 py-5 rounded-[3rem] bg-white/[0.02] border border-primary/30 backdrop-blur-3xl transition-all duration-500 hover:bg-white/[0.04] shadow-lg shadow-primary/10 hover:shadow-glow-md w-full"
        style={style}
      >
        <div 
          className="absolute -top-10 -right-10 w-32 h-32 bg-primary blur-[80px] rounded-full opacity-20 pointer-events-none transition-colors duration-500"
        ></div>
        
        {children}
      </motion.div>
    );

    if (onClick) {
        return <div onClick={onClick} className="cursor-pointer w-full">{cardContent}</div>
    }

    return cardContent;
};


// --- Sub-komponen untuk Sidebar Link ---
const SidebarLink = ({ icon, label, onClick }: {icon: React.ReactNode, label: string, onClick: () => void}) => (
  <button onClick={onClick} className="group flex items-center gap-4 transition-all">
    <span className="text-slate-500 group-hover:text-purple-400 transition-colors">{icon}</span>
    <span className="text-[11px] font-mono font-bold tracking-[0.2em] lowercase text-slate-400 group-hover:text-white">{label}</span>
  </button>
);


// --- MAIN APP COMPONENT ---
export default function VibesphereApp() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolling, setIsScrolling] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [showSecurityHint, setShowSecurityHint] = useState(false);
  const [balance, setBalance] = useState('0.00');
  const [isSending, setIsSending] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { toast } = useToast();
  
  // --- COMPOSER STATE ---
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerTab, setComposerTab] = useState<'media' | 'tekt' | 'artikel'>('tekt');
  const [composerText, setComposerText] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  
  // --- PROFILE STATE ENGINE ---
  const [profile, setProfile] = useState({
    username: 'Sovereign_User',
    handle: 'user.opn',
    avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=default-user&backgroundColor=a855f7`,
    joinDate: 'vibing since now',
    themeColor: '262 100% 70%',
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [tempProfile, setTempProfile] = useState({ username: '', joinDate: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- FEED & BOOKMARK STATE ---
  const initialFeedData = [
    { id: 1, userId: "nova.opn", username: "Nova_Architect", handle: "nova.opn", avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=nova.opn&backgroundColor=a855f7`, time: "2m", text: "GM PHAROS Fam! The sovereign vibes are strong today.", type: "tekt", commentCount: 1, repostCount: 5, likeCount: 42, media: null, comments: [
        { id: 101, userId: "ql.opn", username: "Quantum_Leaper", handle: "ql.opn", avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=ql.opn&backgroundColor=06b6d4`, time: "1m", text: "this is fire. the future is now.", commentCount: 1, repostCount: 0, likeCount: 3, bookmarked: false, comments: [
             { id: 1011, userId: "nova.opn", username: "Nova_Architect", handle: "nova.opn", avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=nova.opn&backgroundColor=a855f7`, time: "now", text: "indeed it is!", commentCount: 0, repostCount: 0, likeCount: 1, bookmarked: false, comments: [] }
        ] }
    ] },
    { id: 2, userId: "ql.opn", username: "Quantum_Leaper", handle: "ql.opn", avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=ql.opn&backgroundColor=06b6d4`, time: "30m", text: "Just deployed a new DApp on PHAROS... the speed is unreal. Year 3000 is now.", type: "tekt", commentCount: 0, repostCount: 2, likeCount: 28, media: null, comments: [] },
    { id: 3, userId: "gov.opn", username: "DAO_Steward", handle: "gov.opn", avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=gov.opn&backgroundColor=ef4444`, time: "2h", 
      text: `New governance proposal PIP-8 is live. It suggests adjusting the liquidity provider rewards to incentivize smaller, more diverse pools. This is critical for network health and decentralization.\n\nKey points:\n- Reduce rewards for top 5 pools by 10%\n- Increase rewards for pools outside top 20 by 15%\n- Introduce a 2-week lock-up period for new LPs to claim boosted rewards.\n\nThis will prevent whale dominance and foster a more resilient ecosystem. Please review the full proposal on-chain and cast your vote. Your vibe matters.`, 
      type: "artikel" , commentCount: 1, repostCount: 15, likeCount: 99, media: null,
      comments: [
          { id: 301, userId: "user.opn", username: "Sovereign_User", handle: "user.opn", avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=chrono.opn&backgroundColor=f59e0b`, time: "1h", text: "Important proposal. Everyone should vote.", commentCount: 0, repostCount: 2, likeCount: 10, bookmarked: false, comments: [] }
      ]
    },
    { id: 4, userId: "user.opn", username: "Sovereign_User", handle: "user.opn", avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=chrono.opn&backgroundColor=f59e0b`, time: "5h", text: "Just aped into the new 'Ethereal Void' NFT collection. The art is pure Year 3000 aesthetic.", type: "tekt", commentCount: 0, repostCount: 3, likeCount: 66, media: null, comments: [] },
  ];
  const [feed, setFeed] = useState(initialFeedData);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<number[]>([]);

  // --- SOCIAL ACTION STATE ---
  const [showShareModal, setShowShareModal] = useState(false);
  const [postToShare, setPostToShare] = useState<any | null>(null);

  // --- FOCUS MODE & COMMENT STATE ---
  const [isCommentSectionVisible, setIsCommentSectionVisible] = useState(false);

  // --- NAVIGATION STATE ---
  const [viewStack, setViewStack] = useState([{ tab: 'home', viewingProfile: null, focusedPost: null }]);
  const currentView = viewStack[viewStack.length - 1];
  const { tab: activeTab, viewingProfile, focusedPost } = currentView;

  const pushView = (newView: Partial<typeof currentView>) => {
    // Merge with the previous view to carry over properties like the tab when opening a focused post
    // But if we are changing tabs (e.g. from home to profile), we want a clean slate.
    const isNewTab = newView.tab && newView.tab !== currentView.tab;
    const baseView = isNewTab ? { tab: 'home', viewingProfile: null, focusedPost: null } : currentView;

    setViewStack(prev => [...prev, { ...baseView, ...newView }]);
    setIsSidebarOpen(false); // Always close sidebar on navigation
    if (newView.focusedPost) {
        setIsCommentSectionVisible(false); // Reset comment visibility when focusing a new post
    }
  };

  const popView = () => {
    if (viewStack.length > 1) {
        setViewStack(prev => prev.slice(0, -1));
    }
  };

  // --- CORE SESSION & PROFILE ENGINE (PRIVY) ---
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const wallet = wallets && wallets.length > 0 ? wallets[0] : undefined;
  const isConnected = ready && authenticated && !!wallet;
  
  // --- LOCALSTORAGE & PROFILE/FEED/BOOKMARK SYNC ---
  useEffect(() => {
    if (wallet?.address) {
      const savedProfile = localStorage.getItem(`vibesphere_profile_${wallet.address}`);
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        setProfile(parsed);
      } else {
        const defaultProfile = {
          username: 'Sovereign_User',
          handle: `${wallet.address.slice(0, 6)}.opn`,
          avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${wallet.address}&backgroundColor=a855f7`,
          joinDate: 'vibing since now',
          themeColor: '262 100% 70%',
        };
        setProfile(defaultProfile);
      }
      const savedFeed = localStorage.getItem(`vibesphere_feed_${wallet.address}`);
      if(savedFeed) {
        setFeed(JSON.parse(savedFeed));
      }
      const savedBookmarks = localStorage.getItem(`vibesphere_bookmarks_${wallet.address}`);
      if (savedBookmarks) {
        setBookmarkedPosts(JSON.parse(savedBookmarks));
      }
    }
  }, [wallet?.address]);

  useEffect(() => {
    if (wallet?.address && profile.handle !== 'user.opn') {
      localStorage.setItem(`vibesphere_profile_${wallet.address}`, JSON.stringify(profile));
    }
  }, [profile, wallet?.address]);

  useEffect(() => {
    if (wallet?.address && feed !== initialFeedData) {
      localStorage.setItem(`vibesphere_feed_${wallet.address}`, JSON.stringify(feed));
    }
  }, [feed, wallet?.address]);

  useEffect(() => {
    if (wallet?.address) {
        localStorage.setItem(`vibesphere_bookmarks_${wallet.address}`, JSON.stringify(bookmarkedPosts));
    }
  }, [bookmarkedPosts, wallet?.address]);


  // --- GLOBAL THEME CONTROLLER ---
  useEffect(() => {
    if (profile.themeColor) {
        document.documentElement.style.setProperty('--primary', profile.themeColor);
        const glowColor = profile.themeColor.replace(/ /g, ', ');
        document.documentElement.style.setProperty('--primary-glow', glowColor);
        document.body.classList.add('theme-transition');
        setTimeout(() => document.body.classList.remove('theme-transition'), 1000);
    }
  }, [profile.themeColor]);
  
  
  // --- REAL-TIME BALANCE ---
  useEffect(() => {
    const fetchBalance = async () => {
      if (!wallet?.address) return;
      try {
        const response = await fetch(`/api/balance?address=${wallet.address}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setBalance(data.balance);
      } catch (error) {
        console.warn("vibe check failed, rpc error:", error);
        setBalance('0.01'); // Fallback balance on error
      }
    }

    if (isConnected && wallet?.address) {
      fetchBalance();
    }
  }, [isConnected, wallet?.address]);

  const handleLogin = async () => {
    setShowSecurityHint(false);
    setIsLoggingIn(true);
    try {
      await login();
    } catch (error) {
      console.warn("vibe check error:", error);
      setShowSecurityHint(true);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Auto-switch chain if the connected wallet is on the wrong chain
  useEffect(() => {
    if (isConnected && wallet && wallet.chainId !== `eip155:${PHAROS_CHAIN_ID}`) {
      wallet.switchChain(PHAROS_CHAIN_ID);
    }
  }, [isConnected, wallet]);

  const disconnectWallet = async () => {
    if (window.confirm("exit vibesphere? your sovereignty remains on-chain.")) {
      await logout();
      setIsSidebarOpen(false);
    }
  };

  // --- WALLET & PROFILE FUNCTIONS ---
  const copyAddress = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address);
      toast({title: "wallet address copied"});
    }
  };

  const handleSend = async () => {
    if (!wallet || !recipient || !amount) {
      toast({ variant: "destructive", title: "recipient and amount are required."});
      return;
    }
    if (!wallet.address) {
      toast({ variant: "destructive", title: "Wallet address not found."});
      return;
    }
  
    setIsSending(true);
    try {
      const provider = await wallet.getEthereumProvider();
      const walletClient = createWalletClient({
        chain: pharosTestnet,
        transport: custom(provider),
      });
  
      const [address] = await walletClient.getAddresses();
  
      const transaction = {
        account: address,
        to: recipient as `0x${string}`,
        value: parseEther(amount),
      };
  
      const txHash = await walletClient.sendTransaction(transaction);
      toast({ title: "transaction sent", description: `view on explorer: ${txHash.slice(0,10)}...`});
  
      setShowSendModal(false);
      setRecipient('');
      setAmount('');
    } catch (error) {
      console.warn('send phrs error:', error);
      toast({ variant: "destructive", title: 'network is tight', description: 'try opening in a new tab.'});
    } finally {
      setIsSending(false);
    }
  };
  
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleProfileFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        
        getDominantColorFromImage(imageUrl, (newColorValues) => {
            setProfile(prev => ({ 
              ...prev, 
              avatar: imageUrl,
              themeColor: newColorValues,
            }));

            toast({
              title: "vibe updated...",
            });
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const openProfileModal = () => {
    setTempProfile({ username: profile.username, joinDate: profile.joinDate });
    setIsProfileModalOpen(true);
  };

  const handleProfileSave = () => {
    setProfile(prev => ({ ...prev, username: tempProfile.username, joinDate: tempProfile.joinDate }));
    setIsProfileModalOpen(false);
  };

  
  // --- SCROLL HANDLING ---
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isConnected) return;

    const handleScroll = () => {
      const isAtTop = window.scrollY < 100;
      const isAtBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 10;

      if (isAtTop || isAtBottom) {
        setIsScrolling(false);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        return;
      }
      
      setIsScrolling(true); // Hide bars while scrolling
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false); // Show bars after scrolling stops
      }, 300); // 300ms of inactivity
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isConnected]);
  
  const handleSendComment = (postId: number) => {
    if (commentText.trim() === "") return;
    console.log(`vibe sent to post ${postId}: ${commentText}`);
    setCommentText("");
  };

  // --- SOCIAL ACTIONS ---

  const handleToggleBookmark = (postId: number) => {
    setBookmarkedPosts(prev => {
        const isBookmarked = prev.includes(postId);
        if (isBookmarked) {
            return prev.filter(id => id !== postId);
        } else {
            return [...prev, postId];
        }
    });
  };

  const handleRepost = (postId: number) => {
    const originalPost = feed.find(p => p.id === postId);
    if (!originalPost) return;

    const newPost = {
        id: Date.now(),
        userId: profile.handle,
        username: profile.username,
        handle: profile.handle,
        avatar: profile.avatar,
        time: 'now',
        commentCount: 0,
        repostCount: 0,
        likeCount: 0,
        text: '',
        type: 'revibe',
        quotedPost: originalPost,
    };

    setFeed(prevFeed => {
        const updatedFeed = prevFeed.map(p => 
            p.id === postId ? { ...p, repostCount: p.repostCount + 1 } : p
        );
        return [newPost, ...updatedFeed];
    });

    toast({ title: "vibe re-shared" });
  };
  
  const handleOpenShareModal = (post: any) => {
    setPostToShare(post);
    setShowShareModal(true);
  };

  const handleCopyLink = () => {
    if (!postToShare) return;
    const postUrl = `${window.location.origin}/post/${postToShare.id}`;
    navigator.clipboard.writeText(postUrl);
    toast({ title: "link copied" });
    setShowShareModal(false);
  };

  const handleNativeShare = async () => {
    if (!postToShare) return;
    const postUrl = `${window.location.origin}/post/${postToShare.id}`;
    if (navigator.share) {
        try {
            await navigator.share({
                title: `Vibe from @${postToShare.handle}`,
                text: postToShare.text,
                url: postUrl,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    } else {
        handleCopyLink();
    }
    setShowShareModal(false);
  };

  const handlePost = () => {
    let newPost: any = {
      id: Date.now(),
      userId: profile.handle,
      username: profile.username,
      handle: profile.handle,
      avatar: profile.avatar,
      time: 'now',
      commentCount: 0,
      repostCount: 0,
      likeCount: 0,
      text: composerText,
      media: null,
      comments: [],
    };

    if (composerTab === 'media' && mediaPreview) {
      newPost.type = 'media';
      newPost.media = { url: mediaPreview, type: mediaType };
    } else if (composerTab === 'tekt') {
      newPost.type = 'tekt';
    } else if (composerTab === 'artikel') {
      newPost.type = 'artikel';
    } else {
      return; // No content
    }

    setFeed(prevFeed => [newPost, ...prevFeed]);
    setIsComposerOpen(false);
    resetComposer();
  };

  const resetComposer = () => {
    setComposerText('');
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    setComposerTab('tekt');
  };

  const handleMediaFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setMediaFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
        if (file.type.startsWith('video')) {
          setMediaType('video');
        } else {
          setMediaType('image');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getPostAuraColor = (post: any) => {
    if (!post) return '262 100% 70%';
    if (post.handle === profile.handle) {
      return profile.themeColor;
    }
    try {
      const url = new URL(post.avatar);
      const bgColorHex = url.searchParams.get('backgroundColor');
      if (bgColorHex) {
        const rgb = hexToRgb(bgColorHex);
        if (rgb) {
          let [h, s, l] = rgbToHsl(...rgb);
          s = Math.min(1, s * 1.5);
          l = Math.max(0.55, Math.min(0.75, l));
          return `${h.toFixed(0)} ${(s * 100).toFixed(0)}% ${(l * 100).toFixed(0)}%`;
        }
      }
      return '262 100% 70%';
    } catch(e) {
      return '262 100% 70%';
    }
  };

  const displayedFeed = activeTab === 'bookmarks'
    ? feed.filter(item => bookmarkedPosts.includes(item.id))
    : (activeTab === 'user-profile' && viewingProfile)
    ? feed.filter(item => item.handle === viewingProfile.handle)
    : feed;
  
  
  if (!ready) {
    return null; // or a loading spinner
  }

  const isSubView = viewStack.length > 1;

  let currentAuraColor = profile.themeColor;
  if (focusedPost) {
      const postOrComment = focusedPost.quotedPost ? focusedPost.quotedPost : focusedPost;
      currentAuraColor = getPostAuraColor(postOrComment);
  } else if (viewingProfile) {
      currentAuraColor = getPostAuraColor({avatar: viewingProfile.avatar, handle: viewingProfile.handle});
  } else if (activeTab !== 'home' && activeTab !== 'bookmarks') {
      currentAuraColor = profile.themeColor;
  }
  
  const isFocusedPostBookmarked = focusedPost ? bookmarkedPosts.includes(focusedPost.id) : false;

  const headerStyle = focusedPost ? { borderBottom: `1px solid hsla(${currentAuraColor.replace(/ /g, ',')}, 0.4)` } : {};

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      
      {!isConnected ? (
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-sm mx-auto flex flex-col items-center justify-center p-8"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full flex flex-col items-center"
            >
              <div className="mb-12 relative">
                <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full" />
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" strokeWidth="1" className="text-white relative z-10">
                  <path d="M20 12V8C20 6.89543 19.1046 6 18 6H4C2.89543 6 2 6.89543 2 8V16C2 17.1046 2.89543 18 4 18H18C19.1046 18 20 17.1046 20 16V14M20 12H17C15.8954 12 15 12.8954 15 14C15 15.1046 15.8954 16 17 16H20M20 12V14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <h2 className="text-2xl font-black italic lowercase tracking-tighter mb-2">
                nexus login
              </h2>
              <p className="text-[11px] font-mono text-slate-500 mb-12 text-center leading-relaxed">
                connect your sovereignty. <br/> no email. no password. just vibe.
              </p>

              <div className="w-full flex flex-col gap-4">
                  <button
                    onClick={handleLogin}
                    disabled={isLoggingIn}
                    type="button"
                    className="w-full h-14 flex items-center justify-center py-4 rounded-[2rem] bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all disabled:opacity-70"
                  >
                    {isLoggingIn ? (
                      <span className="text-xs font-light lowercase tracking-widest">
                        connecting...
                      </span>
                    ) : (
                      <span className="text-xs font-bold uppercase tracking-[0.2em]">
                        connect wallet
                      </span>
                    )}
                  </button>
              </div>

              {showSecurityHint && (
                <p className="mt-6 text-center text-[11px] font-light text-slate-500 lowercase">
                  please open in a new tab for the best experience.
                </p>
              )}

              <div className="mt-12 p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                <p className="text-[9px] font-mono text-slate-600 text-center leading-normal lowercase">
                  *vibesphere is a decentralized application. 100% on-chain & non-custodial.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      ) : (
      <>
        <input type="file" ref={fileInputRef} onChange={handleProfileFileChange} style={{ display: 'none' }} accept="image/*" />
        <input type="file" ref={mediaInputRef} onChange={handleMediaFileChange} style={{ display: 'none' }} accept="image/*,video/*" />
        
        {/* --- HEADER --- */}
        <motion.header
          animate={{ y: isScrolling ? -100 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed top-0 w-full p-6 flex justify-between items-center bg-black/40 backdrop-blur-2xl z-50 border-b"
          style={isSubView ? { borderColor: `hsla(${currentAuraColor.replace(/ /g, ',')}, 0.4)` } : {borderColor: 'rgba(255,255,255,0.05)'} }
        >
          <AnimatePresence mode="wait">
            {isSubView && !isSearchOpen ? (
              <motion.button
                key="back-button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{duration: 0.3, ease: "easeOut"}}
                onClick={popView}
                className="p-2 hover:bg-white/10 rounded-full transition-colors h-10 w-10 flex items-center justify-center"
                style={{ color: `hsl(${currentAuraColor})` }}
              >
                <ArrowLeft size={22} strokeWidth={1.5} />
              </motion.button>
            ) : !isSearchOpen ? (
              <motion.button
                key="menu-button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-white/10 rounded-full transition"
              >
                <Menu size={22} className="text-slate-400" />
              </motion.button>
            ) : <div className='w-10 h-10'/>}
          </AnimatePresence>

          {/* title & search bar container */}
          <div className="flex-1 flex justify-center px-4">
            {isSearchOpen ? (
              <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "100%", opacity: 1 }}
                className="relative flex items-center w-full max-w-md"
              >
                <input 
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="search sovereign users..."
                  className="w-full bg-white/5 border border-purple-500/30 rounded-full py-2 pl-10 pr-12 text-sm font-mono lowercase tracking-wider focus:outline-none focus:border-purple-500 transition-all"
                />
                <Search size={16} className="absolute left-4 text-purple-400" />
                
                <button 
                  onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}
                  className="absolute right-4 p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={18} className="text-slate-400 hover:text-white" strokeWidth={1.5} />
                </button>
              </motion.div>
            ) : (
              <motion.h1 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-sm font-black tracking-[0.3em] lowercase italic bg-gradient-to-r from-slate-400 via-white to-slate-400 bg-clip-text text-transparent"
              >
                vibes of sovereign
              </motion.h1>
            )}
          </div>

          {/* search trigger icon */}
          {!isSearchOpen ? (
            <motion.button 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              onClick={() => setIsSearchOpen(true)} 
              className="p-2 hover:bg-white/10 rounded-full transition"
            >
              <Search size={22} className="text-slate-400" />
            </motion.button>
          ) : <div className='w-10 h-10'/>}
        </motion.header>

        {/* --- SIDEBAR --- */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
              />
              <motion.div 
                initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed inset-y-0 left-0 w-64 bg-[#050505] z-[100] border-r border-white/5 p-8 flex flex-col"
              >
                <div className="flex flex-col gap-6 mb-12">
                   <button onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-2 text-primary/80 hover:text-primary transition-colors duration-500">
                    <ArrowLeft size={18} strokeWidth={1.5} />
                    <span className="text-[10px] font-mono tracking-widest uppercase">back</span>
                  </button>
                  <h2 className="text-2xl font-black lowercase italic text-primary transition-colors duration-500 text-shadow-glow">vibesphere</h2>
                </div>
                <nav className="flex-1">
                <div className="flex flex-col gap-4 mt-8">
                    <button
                      onClick={() => pushView({ tab: 'profile', viewingProfile: null, focusedPost: null })}
                      className={`group relative flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300
                      ${activeTab === 'profile' && !viewingProfile
                        ? 'border-primary/30 text-primary shadow-[0_0_10px_rgba(var(--primary-glow),0.2)]'
                        : 'border-primary/20 text-primary/70 hover:border-primary/20 hover:text-primary'
                      }`}
                    >
                      <div
                        className={`absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${activeTab === 'profile' && !viewingProfile ? 'opacity-100' : ''}`}
                        style={{ background: `radial-gradient(circle at center, hsla(var(--primary-glow), ${activeTab === 'profile' && !viewingProfile ? '0.15' : '0.1'}) 0%, transparent 70%)` }}
                      />
                      <div className="relative flex items-center gap-4">
                        <User size={20} strokeWidth={1.5} className={`${activeTab === 'profile' && !viewingProfile ? 'drop-shadow-[0_0_3px_hsl(var(--primary-glow))]' : ''}`} />
                        <span className={`text-xl font-bold tracking-widest lowercase ${activeTab === 'profile' && !viewingProfile ? 'text-shadow-glow' : ''}`}>profile</span>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => pushView({ tab: 'bookmarks', viewingProfile: null, focusedPost: null })}
                      className={`group relative flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300
                      ${activeTab === 'bookmarks'
                        ? 'border-primary/30 text-primary shadow-[0_0_10px_rgba(var(--primary-glow),0.2)]'
                        : 'border-primary/20 text-primary/70 hover:border-primary/20 hover:text-primary'
                      }`}
                    >
                        <div
                            className={`absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${activeTab === 'bookmarks' ? 'opacity-100' : ''}`}
                            style={{ background: `radial-gradient(circle at center, hsla(var(--primary-glow), ${activeTab === 'bookmarks' ? '0.15' : '0.1'}) 0%, transparent 70%)` }}
                        />
                        <div className="relative flex items-center gap-4">
                            <Bookmark size={20} strokeWidth={1.5} className={`${activeTab === 'bookmarks' ? 'drop-shadow-[0_0_3px_hsl(var(--primary-glow))]' : ''}`} />
                            <span className={`text-xl font-bold tracking-widest lowercase ${activeTab === 'bookmarks' ? 'text-shadow-glow' : ''}`}>bookmark</span>
                        </div>
                    </button>
                    
                    <button
                        onClick={() => pushView({ tab: 'notifications', viewingProfile: null, focusedPost: null })}
                        className={`group relative flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300
                        ${activeTab === 'notifications'
                            ? 'border-primary/30 text-primary shadow-[0_0_10px_rgba(var(--primary-glow),0.2)]'
                            : 'border-primary/20 text-primary/70 hover:border-primary/20 hover:text-primary'
                        }`}
                        >
                        <div
                            className={`absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${activeTab === 'notifications' ? 'opacity-100' : ''}`}
                            style={{ background: `radial-gradient(circle at center, hsla(var(--primary-glow), ${activeTab === 'notifications' ? '0.15' : '0.1'}) 0%, transparent 70%)` }}
                        />
                        <div className="relative flex items-center gap-4">
                            <div className="relative">
                                <Bell size={20} strokeWidth={1.5} className={`${activeTab === 'notifications' ? 'drop-shadow-[0_0_3px_hsl(var(--primary-glow))]' : ''}`} />
                                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-primary ring-2 ring-[#050505] shadow-[0_0_8px_1px_hsl(var(--primary))] transition-all duration-500" />
                            </div>
                            <span className={`text-xl font-bold tracking-widest lowercase ${activeTab === 'notifications' ? 'text-shadow-glow' : ''}`}>notifications</span>
                        </div>
                    </button>

                    <button
                        onClick={() => pushView({ tab: 'defi', viewingProfile: null, focusedPost: null })}
                        className={`group relative flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300
                        ${activeTab === 'defi'
                            ? 'border-primary/30 text-primary shadow-[0_0_10px_rgba(var(--primary-glow),0.2)]'
                            : 'border-primary/20 text-primary/70 hover:border-primary/20 hover:text-primary'
                        }`}
                        >
                        <div
                            className={`absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${activeTab === 'defi' ? 'opacity-100' : ''}`}
                            style={{ background: `radial-gradient(circle at center, hsla(var(--primary-glow), ${activeTab === 'defi' ? '0.15' : '0.1'}) 0%, transparent 70%)` }}
                        />
                        <div className="relative flex items-center gap-4">
                            <DollarSign size={20} strokeWidth={1.5} className={`${activeTab === 'defi' ? 'drop-shadow-[0_0_3px_hsl(var(--primary-glow))]' : ''}`} />
                            <span className={`text-xl font-bold tracking-widest lowercase ${activeTab === 'defi' ? 'text-shadow-glow' : ''}`}>defi</span>
                        </div>
                    </button>
                    
                    <button
                        onClick={() => pushView({ tab: 'swap', viewingProfile: null, focusedPost: null })}
                        className={`group relative flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300
                        ${activeTab === 'swap'
                            ? 'border-primary/30 text-primary shadow-[0_0_10px_rgba(var(--primary-glow),0.2)]'
                            : 'border-primary/20 text-primary/70 hover:border-primary/20 hover:text-primary'
                        }`}
                        >
                        <div
                            className={`absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${activeTab === 'swap' ? 'opacity-100' : ''}`}
                            style={{ background: `radial-gradient(circle at center, hsla(var(--primary-glow), ${activeTab === 'swap' ? '0.15' : '0.1'}) 0%, transparent 70%)` }}
                        />
                        <div className="relative flex items-center gap-4">
                            <Repeat size={20} strokeWidth={1.5} className={`${activeTab === 'swap' ? 'drop-shadow-[0_0_3px_hsl(var(--primary-glow))]' : ''}`} />
                            <span className={`text-xl font-bold tracking-widest lowercase ${activeTab === 'swap' ? 'text-shadow-glow' : ''}`}>swap</span>
                        </div>
                    </button>
                    
                    <button
                        onClick={() => pushView({ tab: 'settings', viewingProfile: null, focusedPost: null })}
                        className={`group relative flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300
                        ${activeTab === 'settings'
                            ? 'border-primary/30 text-primary shadow-[0_0_10px_rgba(var(--primary-glow),0.2)]'
                            : 'border-primary/20 text-primary/70 hover:border-primary/20 hover:text-primary'
                        }`}
                        >
                        <div
                            className={`absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${activeTab === 'settings' ? 'opacity-100' : ''}`}
                            style={{ background: `radial-gradient(circle at center, hsla(var(--primary-glow), ${activeTab === 'settings' ? '0.15' : '0.1'}) 0%, transparent 70%)` }}
                        />
                        <div className="relative flex items-center gap-4">
                            <Settings size={20} strokeWidth={1.5} className={`${activeTab === 'settings' ? 'drop-shadow-[0_0_3px_hsl(var(--primary-glow))]' : ''}`} />
                            <span className={`text-xl font-bold tracking-widest lowercase ${activeTab === 'settings' ? 'text-shadow-glow' : ''}`}>settings</span>
                        </div>
                    </button>
                  </div>
                </nav>
                <div className="mt-auto pt-6 border-t border-white/5">
                  <div className="flex items-center gap-3 mb-6 px-2">
                    <img src={profile.avatar} alt="User Avatar" className="w-10 h-10 rounded-full border-2 border-primary/50 object-cover transition-colors duration-500" />
                    <div>
                      <p className="font-bold text-sm text-white">{profile.username}</p>
                      <p className="text-xs text-slate-400 font-mono">@{profile.handle}</p>
                    </div>
                  </div>
                  <button onClick={disconnectWallet} className="flex items-center gap-4 text-red-500/60 hover:text-red-500 transition">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1.5">
                      <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15M10 17L15 12L10 7M15 12H3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-[11px] font-mono font-light lowercase tracking-widest">logout</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* --- MAIN CONTENT --- */}
        <main className="w-full max-w-4xl mx-auto pb-48 pt-28 px-6 min-h-screen">
          <AnimatePresence mode="wait">
            {focusedPost ? (
               <motion.div
                key="detail"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="relative"
              >
                 <div
                    className="absolute inset-x-0 -top-20 h-96"
                    style={{
                      background: `radial-gradient(ellipse 50% 50% at 50% 0%, hsla(${currentAuraColor.replace(/ /g, ',')}, 0.2), transparent 70%)`
                    }}
                 />
                <div 
                    className="relative"
                    style={{'--primary': currentAuraColor, '--primary-glow': currentAuraColor.replace(/ /g, ', ') } as React.CSSProperties}
                >
                    <div 
                        onClick={(e) => { e.stopPropagation(); pushView({ tab: 'user-profile', viewingProfile: {username: focusedPost.username, handle: focusedPost.handle, avatar: focusedPost.avatar}, focusedPost: null })}}
                        className="flex items-center gap-4 mb-4 cursor-pointer group"
                    >
                        <img src={focusedPost.avatar} alt="avatar" className="w-12 h-12 rounded-full border-2 transition-all group-hover:scale-105" style={{borderColor: `hsl(${currentAuraColor})`}} />
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-white transition-colors group-hover:brightness-125" style={{color: `hsl(${currentAuraColor})`}}>{focusedPost.username}</h2>
                          </div>
                          <p className="text-sm font-mono text-slate-400">@{focusedPost.handle}</p>
                        </div>
                    </div>

                    <div className='pl-16'>
                      <div className="p-4 rounded-2xl shadow-[0_0_15px_hsla(var(--primary-glow),0.3)]">
                        {focusedPost.media && (
                            <div className="mb-4 rounded-2xl overflow-hidden border border-white/10">
                            {focusedPost.media.type === 'image' && <img src={focusedPost.media.url} alt="Post media" className="w-full h-auto" />}
                            {focusedPost.media.type === 'video' && <video src={focusedPost.media.url} className="w-full h-auto" autoPlay muted loop playsInline />}
                            </div>
                        )}

                        <p className="text-2xl text-slate-200 leading-relaxed font-light whitespace-pre-wrap">{focusedPost.text}</p>
                        
                        <p className="text-xs font-mono text-slate-500 mt-6">{focusedPost.time}</p>
                      </div>

                      <div 
                        className="flex justify-between items-center my-6 py-4 border-y"
                        style={{borderColor: `hsla(${currentAuraColor.replace(/ /g, ',')}, 0.4)`}}
                      >
                          <div className="flex items-center gap-10">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setIsCommentSectionVisible(prev => !prev); }}
                                className={`group flex items-center gap-2 transition-all text-primary hover:brightness-125`}
                              >
                                <MessageSquare size={20} strokeWidth={1.5} />
                                <span className="text-sm font-mono">{focusedPost.commentCount}</span>
                              </button>
                            
                              <button onClick={(e) => {e.stopPropagation(); handleRepost(focusedPost.id)}} className="group flex items-center gap-2 text-primary hover:brightness-125 transition-all">
                                <Repeat size={22} strokeWidth={1.5} />
                                <span className="text-sm font-mono">{focusedPost.repostCount}</span>
                              </button>

                              <button onClick={(e) => e.stopPropagation()} className="group flex items-center gap-2 text-primary hover:brightness-125 transition-all">
                                <Heart size={20} strokeWidth={1.5} />
                                <span className="text-sm font-mono">{focusedPost.likeCount}</span>
                              </button>
                          </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleToggleBookmark(focusedPost.id); }}
                                className={`group flex items-center gap-2 transition-all text-primary hover:brightness-125`}
                              >
                                <Bookmark 
                                  size={20} 
                                  strokeWidth={1.5} 
                                  className="transition-all duration-300"
                                  fill={isFocusedPostBookmarked ? 'currentColor' : 'none'}
                                />
                            </button>
                      </div>
                    
                      <AnimatePresence>
                      {isCommentSectionVisible && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                        >
                          <h3 className="text-base font-bold lowercase tracking-widest text-slate-400 mb-6">replies</h3>
                          <div className="flex flex-col gap-6">
                              {/* New Comment Input */}
                              <div className="flex gap-3 items-start">
                                  <img src={profile.avatar} alt="Your avatar" className="w-10 h-10 rounded-full border-2 object-cover" style={{borderColor: `hsl(${profile.themeColor})`}}/>
                                  <div className="flex-1">
                                      <div className="relative flex items-center">
                                        <textarea 
                                          value={commentText}
                                          onChange={(e) => setCommentText(e.target.value.toLowerCase())}
                                          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendComment(focusedPost.id))}
                                          placeholder="post your reply..."
                                          className="w-full bg-transparent border-b border-white/10 pb-2 pl-2 pr-10 text-base font-light lowercase focus:outline-none focus:border-primary/50 transition-all text-slate-200 resize-none"
                                          rows={1}
                                        />
                                        <button 
                                          onClick={() => handleSendComment(focusedPost.id)}
                                          disabled={!commentText.trim()}
                                          className={`absolute right-1 bottom-1 transition-colors ${
                                            commentText.trim() ? 'text-primary hover:text-primary/80' : 'text-slate-700'
                                          }`}
                                        >
                                          <Send size={16} strokeWidth={2} />
                                        </button>
                                      </div>
                                  </div>
                              </div>
                              
                              {/* Vibe Thread */}
                              {focusedPost.comments && focusedPost.comments.length > 0 ? (
                                focusedPost.comments.map(comment => (
                                    <div 
                                        key={comment.id} 
                                        className="flex gap-3 items-start cursor-pointer hover:bg-white/5 p-2 -m-2 rounded-lg transition-colors"
                                        onClick={() => pushView({ focusedPost: comment })}
                                    >
                                        <img src={comment.avatar} alt="commenter avatar" className="w-10 h-10 rounded-full border-2 object-cover" style={{borderColor: `hsl(${getPostAuraColor(comment)})`}}/>
                                        <div className="flex-1">
                                            <div onClick={(e) => { e.stopPropagation(); pushView({ tab: 'user-profile', viewingProfile: {username: comment.username, handle: comment.handle, avatar: comment.avatar}, focusedPost: null })}} className='flex items-center gap-2 group'>
                                                <span className="text-sm font-bold group-hover:underline" style={{color: `hsl(${getPostAuraColor(comment)})`}}>{comment.username}</span>
                                                <span className="text-xs text-slate-500 font-mono">@{comment.handle} &bull; {comment.time}</span>
                                            </div>
                                            <p className="text-base text-slate-300 leading-relaxed mt-1 font-light whitespace-pre-wrap">{comment.text}</p>
                                            {/* Interaction bar for comments */}
                                            <div className="flex items-center gap-6 mt-3 -ml-2" onClick={e => e.stopPropagation()} style={{'--primary': getPostAuraColor(comment)} as React.CSSProperties}>
                                                <button className="group flex items-center gap-2 text-primary/70 hover:text-primary transition-all">
                                                    <MessageSquare size={16} strokeWidth={1.5} />
                                                    <span className="text-xs font-mono">{comment.commentCount}</span>
                                                </button>
                                                <button className="group flex items-center gap-2 text-primary/70 hover:text-primary transition-all">
                                                    <Repeat size={18} strokeWidth={1.5} />
                                                    <span className="text-xs font-mono">{comment.repostCount}</span>
                                                </button>
                                                <button className="group flex items-center gap-2 text-primary/70 hover:text-primary transition-all">
                                                    <Heart size={16} strokeWidth={1.5} />
                                                    <span className="text-xs font-mono">{comment.likeCount}</span>
                                                </button>
                                                <button className="group flex items-center gap-2 text-primary/70 hover:text-primary transition-all">
                                                    <Bookmark size={16} strokeWidth={1.5} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                              ) : (
                                <div className="text-center py-8">
                                    <p className="text-sm text-slate-500 font-mono">no replies yet.</p>
                                </div>
                              )}
                          </div>
                        </motion.div>
                      )}
                      </AnimatePresence>
                    </div>
                </div>
              </motion.div>
            ) : (
            <motion.div
              key={activeTab + (viewingProfile?.handle || '')}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'home' || activeTab === 'bookmarks' || (activeTab === 'user-profile' && viewingProfile) ? (
                <>
                <motion.div 
                  initial="hidden" animate="show"
                  variants={{ show: { transition: { staggerChildren: 0.15 } } }}
                  className="flex flex-col items-center gap-8"
                >
                  {(activeTab === 'bookmarks' || activeTab === 'user-profile') && displayedFeed.length === 0 && (
                      <motion.div className="text-center py-20 flex flex-col items-center text-slate-500">
                          <Bookmark size={32} strokeWidth={1.5} className="mb-6"/>
                          <h2 className="text-xl font-light lowercase tracking-widest text-slate-300">
                            {activeTab === 'bookmarks' ? 'no saved vibes' : 'no vibes yet'}
                          </h2>
                          <p className="text-sm font-mono mt-2">
                            {activeTab === 'bookmarks' ? 'your saved posts will appear here.' : 'posts from this user will appear here.'}
                          </p>
                      </motion.div>
                  )}
                  {activeTab === 'user-profile' && viewingProfile && (
                     <ResonanceCard style={{'--primary': currentAuraColor, '--primary-glow': currentAuraColor.replace(/ /g, ', ')} as React.CSSProperties}>
                        <div className="flex flex-col items-center text-center">
                          <img 
                            src={viewingProfile.avatar} 
                            alt="User avatar" 
                            className="w-32 h-32 rounded-full border-4 border-primary/20 object-cover shadow-lg"
                          />
                          <h2 className="text-3xl font-black lowercase italic tracking-tighter text-white mt-6">{viewingProfile.username}</h2>
                          <p className="text-sm font-mono text-slate-400">@{viewingProfile.handle}</p>
                        </div>
                      </ResonanceCard>
                  )}
                  {displayedFeed.map((item) => {
                    const postAuraColor = getPostAuraColor(item.type === 'revibe' ? item.quotedPost : item);
                    const cardStyle = { 
                        '--primary': postAuraColor,
                        '--primary-glow': postAuraColor.replace(/ /g, ', '),
                    } as React.CSSProperties;
                    const isBookmarked = bookmarkedPosts.includes(item.id);

                    const handleCardClick = () => {
                        const targetPost = (item.type === 'revibe' && item.quotedPost) ? item.quotedPost : item;
                        pushView({ focusedPost: targetPost });
                    };

                    return (
                      <ResonanceCard 
                        key={item.id} 
                        style={cardStyle}
                        onClick={handleCardClick}
                      >
                        {item.type === 'revibe' && (
                            <div className="text-xs font-mono text-slate-400 mb-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <Repeat size={14} />
                                <span>re-vibed by @{item.handle}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-start mb-4">
                          <div 
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                const userToView = item.type === 'revibe' ? {username: item.username, handle: item.handle, avatar: item.avatar} : {username: item.username, handle: item.handle, avatar: item.avatar}; 
                                pushView({ tab: 'user-profile', viewingProfile: userToView, focusedPost: null });
                            }}
                            className="flex items-center gap-3 cursor-pointer group"
                          >
                            <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden group-hover:border-primary/50 transition-all">
                              <img src={item.avatar} alt="avatar" className="w-full h-full object-cover bg-white/10" />
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white group-hover:text-primary transition-colors duration-500">
                                  {item.username}
                                </span>
                                <div 
                                    className="w-2 h-2 rounded-full bg-primary opacity-75 transition-colors duration-500 shadow-[0_0_8px_1px_hsl(var(--primary))]"
                                ></div>
                              </div>
                              <span className="text-[11px] text-slate-500 font-mono tracking-tighter">@{item.handle} • {item.time}</span>
                            </div>
                          </div>
                          <button onClick={(e) => {e.stopPropagation(); handleOpenShareModal(item.type === 'revibe' ? item.quotedPost : item)}} className="group p-2 -mr-2 mt-1">
                            <Share2 size={18} className="text-primary/70 group-hover:text-white transition-colors duration-500" style={{strokeWidth: 1.5}}/>
                          </button>
                        </div>
                        
                        <div className="min-h-[40px]">
                            {item.type === 'revibe' ? (
                                <div 
                                    className="mt-4 p-4 rounded-3xl border border-white/10" 
                                    style={{ borderColor: `hsla(${getPostAuraColor(item.quotedPost).replace(/ /g, ',')}, 0.3)` }}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <img src={item.quotedPost.avatar} alt="avatar" className="w-8 h-8 rounded-full" />
                                        <div>
                                            <span className="text-sm font-bold text-white">{item.quotedPost.username}</span>
                                            <span className="text-xs text-slate-500 font-mono tracking-tighter"> @{item.quotedPost.handle} • {item.quotedPost.time}</span>
                                        </div>
                                    </div>
                                    {item.quotedPost.media && (
                                        <div className="mb-2 rounded-xl overflow-hidden border border-white/10">
                                            {item.quotedPost.media.type === 'image' && <img src={item.quotedPost.media.url} alt="Post media" className="w-full h-auto" />}
                                            {item.quotedPost.media.type === 'video' && <video src={item.quotedPost.media.url} className="w-full h-auto" autoPlay muted loop playsInline />}
                                        </div>
                                    )}
                                    <p className="text-slate-300 text-base leading-relaxed font-light whitespace-pre-wrap">{item.quotedPost.text}</p>
                                </div>
                            ) : (
                                <div className={item.type === 'artikel' ? 'max-h-[250px] overflow-y-auto pr-4 custom-scrollbar' : ''}>
                                  {item.media && (
                                     <div className="mb-4 rounded-2xl overflow-hidden border border-white/10">
                                       {item.media.type === 'image' && <img src={item.media.url} alt="Post media" className="w-full h-auto" />}
                                       {item.media.type === 'video' && <video src={item.media.url} className="w-full h-auto" autoPlay muted loop playsInline />}
                                     </div>
                                  )}
                                  <p className="text-slate-200 text-lg leading-relaxed font-light mb-2 whitespace-pre-wrap">{item.text}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center mt-4 -mx-4" onClick={(e) => e.stopPropagation()}>
                            <button onClick={(e) => {e.stopPropagation(); pushView({ focusedPost: item, viewingProfile: viewingProfile }); setTimeout(() => setIsCommentSectionVisible(true), 100); }} className="group flex items-center gap-2 text-primary/70 hover:text-primary transition-all p-2 rounded-full hover:bg-primary/10">
                                <MessageSquare size={18} strokeWidth={1.5} />
                                <span className="text-sm font-mono">{item.commentCount}</span>
                            </button>
                            <button onClick={(e) => {e.stopPropagation(); handleRepost(item.id)}} className="group flex items-center gap-2 text-primary/70 hover:text-primary transition-all p-2 rounded-full hover:bg-primary/10">
                                <Repeat size={20} strokeWidth={1.5} />
                                <span className="text-sm font-mono">{item.repostCount}</span>
                            </button>
                            <button onClick={(e) => e.stopPropagation()} className="group flex items-center gap-2 text-primary/70 hover:text-primary transition-all p-2 rounded-full hover:bg-primary/10">
                                <Heart size={18} strokeWidth={1.5} />
                                <span className="text-sm font-mono">{item.likeCount}</span>
                            </button>
                            <button onClick={(e) => {e.stopPropagation(); handleToggleBookmark(item.id)}} className="group flex items-center gap-2 text-primary/70 hover:text-primary transition-all p-2 rounded-full hover:bg-primary/10">
                                <Bookmark size={18} strokeWidth={1.5} className="transition-all duration-300" fill={isBookmarked ? 'currentColor' : 'none'}/>
                            </button>
                        </div>

                      </ResonanceCard>
                    )
                  })}
                  <div className="h-20"></div>
                </motion.div>
                </>
              ) : activeTab === 'profile' && !viewingProfile ? (
                <motion.div className="flex flex-col items-center">
                   <ResonanceCard style={{'--primary': profile.themeColor, '--primary-glow': profile.themeColor.replace(/ /g, ', ')} as React.CSSProperties}>
                    <div className="flex flex-col items-center text-center">
                      <div 
                        className="relative group mb-6 cursor-pointer"
                        onClick={handleAvatarClick}
                      >
                        <img 
                          src={profile.avatar} 
                          alt="User avatar" 
                          className="w-32 h-32 rounded-full border-4 border-primary/20 object-cover shadow-lg transition-all duration-500 group-hover:border-primary/50 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white text-xs font-bold uppercase tracking-widest">change</span>
                        </div>
                      </div>
                      <h2 className="text-3xl font-black lowercase italic tracking-tighter text-white">{profile.username}</h2>
                      <p className="text-sm font-mono text-slate-400">@{profile.handle}</p>
                      <p className="text-xs font-mono text-slate-500 mt-4 lowercase">{profile.joinDate}</p>
                      
                      <button 
                        onClick={openProfileModal}
                        className="mt-8 flex items-center gap-2 py-2 px-6 bg-white/10 rounded-full text-xs font-mono lowercase tracking-widest text-slate-300 hover:bg-white/20 hover:text-white transition-all"
                      >
                        <Edit2 size={14} />
                        edit profile
                      </button>
                    </div>
                  </ResonanceCard>
                </motion.div>
              ) : activeTab === 'notifications' ? (
                <motion.div 
                    className="w-full max-w-md mx-auto flex flex-col gap-6"
                >
                    <h2 className="text-center text-slate-300 font-light tracking-widest uppercase text-lg mb-4">Notifications</h2>
                    
                    <div className="flex items-start gap-4 p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                        <div className="w-8 h-8 flex-shrink-0 rounded-full bg-red-500/20 flex items-center justify-center">
                            <Heart size={16} className="text-red-400" />
                        </div>
                        <div>
                            <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=ql.opn&backgroundColor=06b6d4`} alt="Quantum_Leaper avatar" className="w-6 h-6 rounded-full inline-block mr-2 border border-white/10" />
                            <p className="inline text-sm text-slate-300 font-light">
                                <span className="font-bold text-white">Quantum_Leaper</span> and 2 others liked your vibe.
                            </p>
                            <p className="text-xs text-slate-500 font-mono mt-1">2 hours ago</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                        <div className="w-8 h-8 flex-shrink-0 rounded-full bg-primary/20 flex items-center justify-center transition-colors duration-500">
                            <Bookmark size={16} className="text-primary transition-colors duration-500" />
                        </div>
                        <div>
                            <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=gov.opn&backgroundColor=ef4444`} alt="DAO_Steward avatar" className="w-6 h-6 rounded-full inline-block mr-2 border border-white/10" />
                            <p className="inline text-sm text-slate-300 font-light">
                                <span className="font-bold text-white">DAO_Steward</span> saved your article: "New governance proposal PIP-8..."
                            </p>
                            <p className="text-xs text-slate-500 font-mono mt-1">5 hours ago</p>
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                        <div className="w-8 h-8 flex-shrink-0 rounded-full bg-cyan-500/20 flex items-center justify-center">
                            <MessageSquare size={16} className="text-cyan-400" />
                        </div>
                        <div>
                            <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=nova.opn&backgroundColor=a855f7`} alt="Nova_Architect avatar" className="w-6 h-6 rounded-full inline-block mr-2 border border-white/10" />
                            <p className="inline text-sm text-slate-300 font-light">
                                New post from <span className="font-bold text-white">Nova_Architect</span>.
                            </p>
                            <p className="text-xs text-slate-500 font-mono mt-1">1 day ago</p>
                        </div>
                    </div>
                </motion.div>
              ) : activeTab === 'defi' ? (
                <motion.div>
                    <h2 className="text-center text-slate-300 font-light tracking-widest uppercase text-lg">DeFi</h2>
                    <p className="text-center text-slate-500 font-mono mt-2">decentralized finance hub coming soon.</p>
                </motion.div>
              ) : activeTab === 'swap' ? (
                 <motion.div>
                    <h2 className="text-center text-slate-300 font-light tracking-widest uppercase text-lg">Swap</h2>
                    <p className="text-center text-slate-500 font-mono mt-2">token swap interface coming soon.</p>
                </motion.div>
              ) : activeTab === 'settings' ? (
                <motion.div>
                    <h2 className="text-center text-slate-300 font-light tracking-widest uppercase text-lg">Settings</h2>
                    <p className="text-center text-slate-500 font-mono mt-2">sovereign settings panel coming soon.</p>
                </motion.div>
              ) : activeTab === 'wallet' ? (
                  <motion.div 
                    className="w-full max-w-md mx-auto p-6"
                  >
                    {/* 1. balance card: the core resonance */}
                    <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-purple-600/20 to-cyan-600/20 border border-white/10 p-8 backdrop-blur-3xl shadow-2xl">
                      <div className="absolute top-0 right-0 p-6 opacity-20">
                         <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" strokeWidth="1" className="text-white">
                           <path d="M20 12V8C20 6.89543 19.1046 6 18 6H4C2.89543 6 2 6.89543 2 8V16C2 17.1046 2.89543 18 4 18H18C19.1046 18 20 17.1046 20 16V14M20 12H17C15.8954 12 15 12.8954 15 14C15 15.1046 15.8954 16 17 16H20M20 12V14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                         </svg>
                      </div>
                      
                      <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-slate-400">total balance</span>
                      <h3 className="text-4xl font-black mt-2 tracking-tighter italic">
                        {isConnected ? parseFloat(balance).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 4}) : '---'} <span className="text-sm font-light not-italic text-purple-400">phrs</span>
                      </h3>
                      {isConnected && <p className="text-[11px] font-mono text-slate-500 mt-1">≈ $... usd</p>}

                      <div className="mt-4 flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">your address</span>
                          <code className="text-[10px] font-mono text-purple-300">
                            {wallet?.address && `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`}
                          </code>
                        </div>
                        <button 
                          onClick={copyAddress}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                        >
                          <Copy size={14} />
                        </button>
                      </div>

                      {/* quick actions */}
                      <div className="flex gap-4 mt-6">
                        <button 
                            onClick={() => setShowSendModal(true)}
                            className="flex-1 py-3 rounded-2xl bg-purple-600 text-xs font-bold uppercase tracking-widest hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all text-white"
                        >
                          send
                        </button>
                        <button 
                          onClick={() => setShowReceiveModal(true)}
                          className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all text-white"
                        >
                          receive
                        </button>
                      </div>
                    </div>

                    {/* 2. transaction history */}
                    <div className="mt-12 flex flex-col gap-4">
                      <div className="flex justify-between items-center px-2">
                          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-500">transaction history</span>
                          {wallet?.address && <a href={`https://pharos-testnet.socialscan.io/address/${wallet.address}`} target="_blank" rel="noopener noreferrer" className="text-[10px] font-mono text-purple-400 hover:underline">view all on explorer</a>}
                      </div>
                      
                      <div className="flex flex-col gap-3">
                          {parseFloat(balance) > 0 ? (
                              <div className="flex items-center justify-between gap-4 p-6 rounded-[2rem] bg-white/[0.02] border border-white/5">
                                  <div className="flex items-center gap-4">
                                      <div className="p-2 bg-green-500/10 rounded-full">
                                          <ArrowDownLeft size={16} className="text-green-400"/>
                                      </div>
                                      <div>
                                          <p className="text-sm font-light text-white lowercase">faucet received</p>
                                          <p className="text-[11px] font-mono text-slate-500">confirmed</p>
                                      </div>
                                  </div>
                                  <p className="text-sm font-mono text-green-400">+0.03 phrs</p>
                              </div>
                          ) : (
                              <div className="flex items-center gap-4 p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group justify-center text-center">
                                  <p className="text-sm text-slate-400 font-mono lowercase">your transaction history is synced on-chain.</p>
                              </div>
                          )}
                      </div>
                    </div>

                    <AnimatePresence>
                      {showReceiveModal && (
                        <motion.div 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }} 
                          exit={{ opacity: 0 }}
                          onClick={() => setShowReceiveModal(false)}
                          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
                        >
                          <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 flex flex-col items-center shadow-2xl"
                          >
                            <h3 className="text-sm font-bold lowercase tracking-widest mb-8 text-purple-400">receive PHRS</h3>
                            
                            <div className="w-48 h-48 bg-white p-4 rounded-3xl mb-8 shadow-[0_0_40px_rgba(255,255,255,0.15)] flex items-center justify-center">
                                {wallet?.address && <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${wallet.address}`} 
                                    alt="wallet qr"
                                    className="w-full h-full object-contain"
                                />}
                            </div>

                            <div className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 mb-8 text-center">
                              <p className="text-[10px] font-mono text-slate-400 break-all lowercase">
                                {wallet?.address}
                              </p>
                            </div>

                            <button 
                              onClick={copyAddress}
                              className="w-full py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest mb-3"
                            >
                              copy address
                            </button>
                            
                            <button 
                              onClick={() => setShowReceiveModal(false)}
                              className="text-[10px] font-mono text-slate-500 hover:text-white uppercase tracking-widest mt-2"
                            >
                              close
                            </button>
                          </motion.div>
                        </motion.div>
                      )}
                      {showSendModal && (
                        <motion.div 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }} 
                          exit={{ opacity: 0 }}
                          onClick={() => setShowSendModal(false)}
                          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
                        >
                          <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8"
                          >
                            <h3 className="text-sm font-bold lowercase tracking-widest mb-6 text-purple-400">send PHRS</h3>
                            <input 
                              placeholder="recipient address (0x...)"
                              value={recipient}
                              onChange={(e) => setRecipient(e.target.value)}
                              className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl mb-4 text-[10px] font-mono focus:outline-none focus:border-purple-500"
                            />
                            <input 
                              placeholder="amount"
                              type="number"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl mb-6 text-[10px] font-mono focus:outline-none focus:border-purple-500"
                            />
                            <button 
                              onClick={handleSend} 
                              disabled={isSending}
                              className="w-full py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                            >
                              {isSending ? 'sending...' : 'confirm send'}
                            </button>
                            <button onClick={() => setShowSendModal(false)} className="w-full mt-4 text-[10px] font-mono text-slate-500 uppercase">cancel</button>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
              ) : activeTab === 'market' ? (
                <motion.div
                  className="w-full max-w-md mx-auto flex flex-col gap-4"
                >
                  <h2 className="text-center text-slate-500 font-light tracking-widest uppercase text-sm mb-4">Market Pulse / Pharos Atlantic Testnet</h2>
                  {/* Market data would go here */}
                </motion.div>
              ) : activeTab === 'inbox' ? (
                <motion.div className="text-center py-20">
                  <h2 className="text-xl font-black lowercase italic tracking-[0.3em]">inbox</h2>
                  <p className="text-slate-500 font-mono mt-2">your sovereign messages will appear here.</p>
                </motion.div>
              ) : null}
            </motion.div>
            )}
          </AnimatePresence>
        </main>
        
        {isConnected && (
          <motion.div
            animate={{ y: isScrolling ? 100 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed bottom-24 left-6 z-50 pointer-events-none"
          >
              <p className="text-blue-400 text-[10px] font-mono lowercase bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-blue-400/20">
                  network: pharos atlantic testnet
              </p>
          </motion.div>
        )}

        {/* --- COMPOSER MODAL --- */}
        <AnimatePresence>
          {isComposerOpen && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsComposerOpen(false)}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 flex flex-col shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <img src={profile.avatar} alt="Your avatar" className="w-8 h-8 rounded-full border border-primary/50 object-cover" />
                    <span className="text-sm font-bold lowercase">{profile.username}</span>
                  </div>
                  <button onClick={() => setIsComposerOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-slate-400">
                    <X size={18} />
                  </button>
                </div>
                
                {/* Composer Tabs */}
                <div className="flex gap-2 mb-4 p-1 bg-white/5 rounded-full">
                  <button onClick={() => setComposerTab('media')} className={`flex-1 flex items-center justify-center gap-2 text-xs font-light lowercase tracking-widest py-2 rounded-full transition-colors ${composerTab === 'media' ? 'bg-primary/20 text-white' : 'text-slate-400 hover:bg-white/5'}`}><FileUp size={14}/>media</button>
                  <button onClick={() => setComposerTab('tekt')} className={`flex-1 text-xs font-light lowercase tracking-widest py-2 rounded-full transition-colors ${composerTab === 'tekt' ? 'bg-primary/20 text-white' : 'text-slate-400 hover:bg-white/5'}`}><Type size={14}/>tekt</button>
                  <button onClick={() => setComposerTab('artikel')} className={`flex-1 text-xs font-light lowercase tracking-widest py-2 rounded-full transition-colors ${composerTab === 'artikel' ? 'bg-primary/20 text-white' : 'text-slate-400 hover:bg-white/5'}`}><FileText size={14}/>artikel</button>
                </div>

                {/* Content Area */}
                <div className="flex-1">
                  <textarea
                    value={composerText}
                    onChange={e => setComposerText(e.target.value)}
                    placeholder={
                      composerTab === 'media' ? 'add a vibe to your media...' :
                      composerTab === 'tekt' ? 'what is your vibe...' :
                      'share your sovereign thoughts...'
                    }
                    className="w-full bg-transparent text-lg text-slate-200 resize-none focus:outline-none placeholder:text-slate-600"
                    rows={composerTab === 'artikel' ? 8 : 4}
                  />

                  {composerTab === 'media' && (
                    <div className="mt-4">
                      {mediaPreview ? (
                        <div className="relative group rounded-2xl overflow-hidden border border-white/10">
                          {mediaType === 'image' && <img src={mediaPreview} alt="media preview" className="w-full h-auto max-h-60 object-contain" />}
                          {mediaType === 'video' && <video src={mediaPreview} className="w-full h-auto max-h-60" autoPlay muted loop playsInline />}
                          <button onClick={() => { setMediaFile(null); setMediaPreview(null); }} className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => mediaInputRef.current?.click()} className="w-full h-32 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-slate-500 hover:border-primary/50 hover:text-primary transition-colors">
                          <Video size={24}/>
                          <span className="text-xs font-light lowercase mt-2">upload photo or video</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                   <button 
                      onClick={handlePost} 
                      disabled={!composerText.trim() && !mediaFile}
                      className="py-3 px-8 bg-primary text-primary-foreground rounded-full text-xs font-bold uppercase tracking-widest hover:shadow-[0_0_20px_rgba(var(--primary-glow),0.4)] transition-all disabled:opacity-50 disabled:shadow-none"
                    >
                      post
                    </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isProfileModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileModalOpen(false)}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8"
              >
                <h3 className="text-sm font-bold lowercase tracking-widest mb-6 text-purple-400">edit profile</h3>
                <div className='flex flex-col gap-4'>
                  <div>
                    <label className='text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400'>username</label>
                    <input 
                      value={tempProfile.username}
                      onChange={(e) => setTempProfile(p => ({...p, username: e.target.value}))}
                      className="w-full mt-1 p-3 bg-white/5 border border-white/10 rounded-2xl text-sm font-mono lowercase focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className='text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400'>join date</label>
                    <input 
                      value={tempProfile.joinDate}
                      onChange={(e) => setTempProfile(p => ({...p, joinDate: e.target.value}))}
                      className="w-full mt-1 p-3 bg-white/5 border border-white/10 rounded-2xl text-sm font-mono lowercase focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                    <button 
                        onClick={() => setIsProfileModalOpen(false)}
                        className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all text-white"
                    >
                        cancel
                    </button>
                    <button 
                        onClick={handleProfileSave} 
                        disabled={tempProfile.username === profile.username && tempProfile.joinDate === profile.joinDate}
                        className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest hover:shadow-[0_0_20px_rgba(var(--primary-glow),0.4)] transition-all disabled:opacity-50"
                    >
                        save
                    </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence>
            {showShareModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowShareModal(false)}
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[110] flex items-end"
                >
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-black rounded-t-3xl border-t-2"
                        style={{ borderColor: `hsl(var(--primary))`}}
                    >
                        <div className="p-8 flex flex-col gap-6">
                            <button onClick={handleCopyLink} className="flex items-center gap-4 text-slate-300 hover:text-white group">
                                <Copy size={20} strokeWidth={1.5} className="text-primary group-hover:scale-110 transition-transform" />
                                <span className="text-lg font-light lowercase tracking-wider">copy link</span>
                            </button>
                            <button onClick={handleNativeShare} className="flex items-center gap-4 text-slate-300 hover:text-white group">
                                <Share2 size={20} strokeWidth={1.5} className="text-primary group-hover:scale-110 transition-transform" />
                                <span className="text-lg font-light lowercase tracking-wider">share with...</span>
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>


        {/* --- DOCK MENU --- */}
        <motion.div
          variants={{ visible: { y: 0, opacity: 1 }, hidden: { y: 100, opacity: 0 } }}
          animate={(isScrolling || isSidebarOpen || focusedPost) ? "hidden" : "visible"}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="fixed bottom-0 left-0 right-0 flex items-center justify-around py-5 bg-black/80 backdrop-blur-xl border-t border-white/5 z-[80]"
        >
          {/* home - familiar house icon */}
          <button onClick={() => pushView({ tab: 'home', viewingProfile: null, focusedPost: null })} className={`p-2 transition-all ${activeTab === 'home' ? 'opacity-100 scale-110' : 'opacity-80 hover:opacity-100'}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9.5Z" stroke="url(#paint0_linear)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="paint0_linear" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                  <stop stopColor="hsl(var(--primary))"/>
                  <stop offset="1" stopColor="#3B82F6"/>
                </linearGradient>
              </defs>
            </svg>
          </button>

          {/* market - familiar chart/trading icon */}
          <button onClick={() => pushView({ tab: 'market', viewingProfile: null, focusedPost: null })} className={`p-2 transition-all ${activeTab === 'market' ? 'opacity-100 scale-110' : 'opacity-80 hover:opacity-100'}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 18L9 12L13 16L21 8M21 8H16M21 8V13" stroke="url(#paint1_linear)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="paint1_linear" x1="3" y1="8" x2="21" y2="18" gradientUnits="userSpaceOnUse">
                  <stop stopColor="hsl(var(--primary))"/>
                  <stop offset="1" stopColor="#3B82F6"/>
                </linearGradient>
              </defs>
            </svg>
          </button>

          {/* plus button - center focus */}
          <button onClick={() => setIsComposerOpen(true)} className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-blue-600 shadow-lg shadow-primary/20 active:scale-90 transition-all duration-500">
            <span className="text-3xl text-white font-light">+</span>
          </button>

          {/* inbok - familiar mail icon */}
          <button onClick={() => pushView({ tab: 'inbox', viewingProfile: null, focusedPost: null })} className={`p-2 transition-all ${activeTab === 'inbox' ? 'opacity-100 scale-110' : 'opacity-80 hover:opacity-100'}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 7L12 13L21 7M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="url(#paint2_linear)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="paint2_linear" x1="2" y1="4" x2="22" y2="20" gradientUnits="userSpaceOnUse">
                  <stop stopColor="hsl(var(--primary))"/>
                  <stop offset="1" stopColor="#3B82F6"/>
                </linearGradient>
              </defs>
            </svg>
          </button>

          {/* wallet - familiar card/wallet icon */}
          <button onClick={() => pushView({ tab: 'wallet', viewingProfile: null, focusedPost: null })} className={`p-2 transition-all ${activeTab === 'wallet' ? 'opacity-100 scale-110' : 'opacity-80 hover:opacity-100'}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 12V8C20 6.89543 19.1046 6 18 6H4C2.89543 6 2 6.89543 2 8V16C2 17.1046 2.89543 18 4 18H18C19.1046 18 20 17.1046 20 16V14M20 12H17C15.8954 12 15 12.8954 15 14C15 15.1046 15.8954 16 17 16H20M20 12V14" stroke="url(#paint3_linear)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="paint3_linear" x1="2" y1="6" x2="20" y2="18" gradientUnits="userSpaceOnUse">
                  <stop stopColor="hsl(var(--primary))"/>
                  <stop offset="1" stopColor="#3B82F6"/>
                </linearGradient>
              </defs>
            </svg>
          </button>
        </motion.div>
      </>
      )}
    </div>
  );
}
