'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, BarChart3, Plus, Wallet, Bell, User, Bookmark, Settings, LogOut, ArrowLeft, Menu, Search, X, Share2, MessageSquare, Repeat2, Heart, Send, Copy, ClipboardList } from 'lucide-react';
import { formatEther, createWalletClient, custom, defineChain, http } from 'viem';

// --- IOPN Testnet Configuration ---
const iopnTestnet = defineChain({
  id: 4202,
  name: 'IOPN Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'IOPN',
    symbol: 'OPN',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-testnet.iopn.io'],
    },
  },
  blockExplorers: {
    default: { name: 'IOPN Explorer', url: 'https://explorer-testnet.iopn.io' },
  },
  testnet: true,
});

// --- COMPONENT: RESONANCE CARD ---
const ResonanceCard = ({ children, themeColor, isShort = false }: { children: React.ReactNode, themeColor: string, isShort?: boolean }) => {
    return (
      <motion.div 
        variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}
        whileHover={{ y: -8, scale: 1.01 }}
        style={{ 
          borderColor: `${themeColor}44`, 
          boxShadow: `0 15px 40px -15px ${themeColor}33`,
        }}
        className={`relative p-8 rounded-[3rem] bg-white/[0.02] border backdrop-blur-3xl transition-all duration-500 hover:bg-white/[0.04] ${isShort ? 'self-start min-w-[320px]' : 'w-full'}`}
      >
        <div 
          className="absolute -top-10 -right-10 w-32 h-32 blur-[80px] rounded-full opacity-20 pointer-events-none"
          style={{ backgroundColor: themeColor }}
        ></div>
        
        {children}

        <div 
            className="absolute bottom-6 right-6 w-3 h-3 rounded-full opacity-50"
            style={{
              backgroundColor: themeColor,
              boxShadow: `0 0 12px 2px ${themeColor}`
            }}
        ></div>
      </motion.div>
    );
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
  const [activeTab, setActiveTab] = useState('home');
  const [isScrolling, setIsScrolling] = useState(false);
  const [lastY, setLastY] = useState(0);
  const [openCommentsId, setOpenCommentsId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  // --- CORE SESSION & PROFILE ENGINE ---
  const [account, setAccount] = useState<`0x${string}` | null>(null);
  const [balance, setBalance] = useState("0.00");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Viem Wallet Client ---
  const walletClient = typeof window !== 'undefined' && window.ethereum ? createWalletClient({
      transport: custom(window.ethereum)
  }) : null;
  
  // --- AUTH FUNCTIONS ---
  const connectWallet = async () => {
    if (!walletClient) {
      setError("wallet not detected. please install a browser wallet like metamask.");
      return;
    }
    
    setIsConnecting(true);
    setError(null);
    try {
      const [address] = await walletClient.requestAddresses();
      
      const chainId = await walletClient.getChainId();
      if (chainId !== iopnTestnet.id) {
        try {
          await walletClient.switchChain({ id: iopnTestnet.id });
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to MetaMask.
          if (switchError.code === 4902) {
            await walletClient.addChain({ chain: iopnTestnet });
          } else {
            throw switchError;
          }
        }
      }
      
      setAccount(address);
      console.log("nexus connected:", address);
    } catch (err: any) {
      setError(err.message || "an unexpected error occurred during connection.");
      console.error("Connection Error:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    if (window.confirm("exit vibesphere? your sovereignty remains on-chain.")) {
      setAccount(null);
      setBalance("0.00");
      setIsSidebarOpen(false);
      console.log("disconnected from nexus.");
    }
  };

  // --- Fetch Balance on Account Change ---
  useEffect(() => {
    if (account) {
      const fetchBalance = async () => {
        try {
          const rpcTarget = "https://rpc-testnet.iopn.io";
          const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rpcTarget)}`;

          const response = await fetch(proxyUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  jsonrpc: "2.0",
                  method: "eth_getBalance",
                  params: [account, "latest"],
                  id: 1
              })
          });

          if (response.ok) {
              const json = await response.json();
              if (json.error) throw new Error(`RPC Error: ${json.error.message}`);
              setBalance(formatEther(BigInt(json.result)));
              console.log("balance synced from iopn.");
          } else {
              throw new Error(`RPC request failed with status ${response.status}`);
          }
        } catch (bgError) {
          console.warn("balance sync failed, showing 0.", bgError);
          setBalance("0.00");
        }
      };
      fetchBalance();
    }
  }, [account]);

  // --- Listen for account changes ---
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0] as `0x${string}`);
        } else {
          setAccount(null);
          setBalance("0.00");
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);


  // --- WALLET FUNCTIONS ---
  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      alert("wallet address copied to clipboard!");
    }
  };

  const handleSendOPN = async () => {
    try {
      if (!recipient || !amount) {
        alert("Recipient and amount are required.");
        return;
      }
      console.log(`sending ${amount} opn to ${recipient}...`);
      // In a real app, this is where you'd use the walletClient to send a transaction
      alert("transaction broadcasted to iopn testnet!");
      setShowSendModal(false);
      setRecipient("");
      setAmount("");
    } catch (error) {
      console.error("Send OPN Error:", error)
      alert("transaction failed. check your balance.");
    }
  };
  
  // --- SCROLL HANDLING ---
  useEffect(() => {
    if (!account) return; // Only run scroll listener when logged in
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastY && currentY > 100) {
        setIsScrolling(true); // Hide on scroll down
      } else {
        setIsScrolling(false); // Show on scroll up
      }
      setLastY(currentY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastY, account]);


  const handleNavigation = (target: string, params?: any) => {
    console.log(`Navigating to: ${target}`, params);
    setActiveTab(target);
    setIsSidebarOpen(false);
  };
  
  const handleSendComment = (postId: number) => {
    if (commentText.trim() === "") return;
    
    // logika pengiriman: saat ini kita tampilkan di konsol sebagai bukti fungsi aktif
    console.log(`vibe sent to post ${postId}: ${commentText}`);
    
    // reset input setelah berhasil "terkirim"
    setCommentText("");
  };
  
  const feedData = [
    { id: 1, postId: 1, userId: "nova.opn", username: "Nova_Architect", handle: "nova.opn", avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=nova.opn&backgroundColor=a855f7`, time: "2m", color: "#a855f7", content: "GM OPN Fam! The sovereign vibes are strong today.", type: "short", commentCount: 12, repostCount: 5, likeCount: 42 },
    { id: 2, postId: 2, userId: "ql.opn", username: "Quantum_Leaper", handle: "ql.opn", avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=ql.opn&backgroundColor=06b6d4`, time: "30m", color: "#06b6d4", content: "Just deployed a new DApp on OPN... the speed is unreal. Year 3000 is now.", type: "medium", commentCount: 8, repostCount: 2, likeCount: 28 },
    { id: 3, postId: 3, userId: "gov.opn", username: "DAO_Steward", handle: "gov.opn", avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=gov.opn&backgroundColor=ef4444`, time: "2h", color: "#ef4444", 
      content: `New governance proposal OIP-8 is live. It suggests adjusting the liquidity provider rewards to incentivize smaller, more diverse pools. This is critical for network health and decentralization.\n\nKey points:\n- Reduce rewards for top 5 pools by 10%\n- Increase rewards for pools outside top 20 by 15%\n- Introduce a 2-week lock-up period for new LPs to claim boosted rewards.\n\nThis will prevent whale dominance and foster a more resilient ecosystem. Please review the full proposal on-chain and cast your vote. Your vibe matters.`, 
      type: "long" , commentCount: 34, repostCount: 15, likeCount: 99
    },
    { id: 4, postId: 4, userId: "chrono.opn", username: "Chrono_Trader", handle: "chrono.opn", avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=chrono.opn&backgroundColor=f59e0b`, time: "5h", color: "#f59e0b", content: "Just aped into the new 'Ethereal Void' NFT collection. The art is pure Year 3000 aesthetic.", type: "short", commentCount: 18, repostCount: 3, likeCount: 66 },
  ];
  
  const marketData = [
    { symbol: 'opn', price: '$1.24', change: '+5.2%', color: 'text-green-400' },
    { symbol: 'eth', price: '$2,450.12', change: '-1.4%', color: 'text-red-400' },
    { symbol: 'usdt', price: '$1.00', change: '0.0%', color: 'text-slate-400' },
  ];


  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      
      <AnimatePresence>
        {isConnecting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[200] bg-[#050505] flex flex-col items-center justify-center"
          >
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-xl font-black italic lowercase tracking-[0.5em] text-white"
            >
              connecting nexus...
            </motion.h2>
            <motion.div 
              animate={{ scaleX: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="w-32 h-[1px] bg-purple-500 mt-4"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {!account ? (
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
                <Wallet size={64} strokeWidth={1} className="text-white relative z-10" />
              </div>

              <h2 className="text-2xl font-black italic lowercase tracking-tighter mb-2">
                nexus login
              </h2>
              <p className="text-[11px] font-mono text-slate-500 mb-12 text-center leading-relaxed">
                connect your sovereignty. <br/> no email. no password. just vibe.
              </p>

              <div className="w-full flex flex-col gap-4">
                <button 
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="w-full py-4 rounded-[2rem] bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold uppercase tracking-[0.2em] hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all disabled:opacity-50"
                >
                  connect wallet
                </button>
              </div>

              {error && (
                  <p className="text-red-400 text-xs text-center mt-8 font-mono lowercase">{error}</p>
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
        {/* --- HEADER --- */}
        <motion.header
          animate={{ y: isScrolling ? -100 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed top-0 w-full p-6 flex justify-between items-center bg-black/40 backdrop-blur-2xl z-50 border-b border-white/5"
        >
          {/* menu toggle (hide when search is active) */}
          {!isSearchOpen && (
            <motion.button 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              onClick={() => setIsSidebarOpen(true)} 
              className="p-2 hover:bg-white/10 rounded-full transition"
            >
              <Menu size={22} className="text-slate-400" />
            </motion.button>
          )}

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
          {!isSearchOpen && (
            <motion.button 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              onClick={() => setIsSearchOpen(true)} 
              className="p-2 hover:bg-white/10 rounded-full transition"
            >
              <Search size={22} className="text-slate-400" />
            </motion.button>
          )}
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
                  <button onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-2 text-slate-500 hover:text-white transition">
                    <ArrowLeft size={18} strokeWidth={1.5} />
                    <span className="text-[10px] font-mono tracking-widest uppercase">back</span>
                  </button>
                  <h2 className="text-2xl font-black lowercase italic bg-gradient-to-tr from-white to-purple-500 bg-clip-text text-transparent">vibesphere</h2>
                </div>
                <nav className="flex-1">
                  <div className="flex flex-col gap-6 px-6 mt-10">
                    <button className="flex items-center gap-4 text-left transition-opacity hover:opacity-70">
                      <span className="text-xl font-light tracking-wide text-white lowercase">profil</span>
                    </button>
                    
                    <button className="flex items-center gap-4 text-left transition-opacity hover:opacity-70">
                      <span className="text-xl font-light tracking-wide text-white lowercase">bookmark</span>
                    </button>
                    
                    <button className="flex items-center gap-4 text-left transition-opacity hover:opacity-70">
                      <span className="text-xl font-light tracking-wide text-white lowercase">defi</span>
                    </button>
                    
                    <button className="flex items-center gap-4 text-left transition-opacity hover:opacity-70">
                      <span className="text-xl font-light tracking-wide text-white lowercase">swap</span>
                    </button>
                    
                    <button className="flex items-center gap-4 text-left transition-opacity hover:opacity-70">
                      <span className="text-xl font-light tracking-wide text-white lowercase">seting</span>
                    </button>
                  </div>
                </nav>
                <div className="mt-auto pt-6 border-t border-white/5">
                  <button onClick={disconnectWallet} className="flex items-center gap-4 text-red-500/60 hover:text-red-500 transition">
                    <LogOut size={18} strokeWidth={1.5} />
                    <span className="text-[11px] font-mono uppercase tracking-widest">logout</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* --- MAIN CONTENT --- */}
        <main className="w-full max-w-4xl mx-auto pb-48 pt-28 px-6 min-h-screen">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'home' && (
                <motion.div 
                  initial="hidden" animate="show"
                  variants={{ show: { transition: { staggerChildren: 0.15 } } }}
                  className="flex flex-col items-center gap-12"
                >
                  {feedData.map((item) => (
                    <ResonanceCard key={item.id} themeColor={item.color} isShort={item.type === 'short'}>
                      <div className="flex justify-between items-start mb-5">
                        <div 
                          onClick={() => handleNavigation('user-profile', { userId: item.userId })} 
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden group-hover:border-purple-500/50 transition-all">
                            <img src={item.avatar} alt="avatar" className="w-full h-full object-cover bg-white/10" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold group-hover:text-purple-400 transition-colors">
                              {item.username}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono tracking-tighter">@{item.handle} • {item.time}</span>
                          </div>
                        </div>
                        <button className="group p-2 -mr-2 mt-1">
                          <Share2 size={18} style={{ stroke: `${item.color}66`, strokeWidth: 1.5 }} className="group-hover:stroke-white transition-colors"/>
                        </button>
                      </div>

                      <div className={item.type === 'long' ? 'max-h-[250px] overflow-y-auto pr-4 custom-scrollbar min-h-[40px]' : 'min-h-[40px]'}>
                        <p className="text-slate-200 text-lg leading-relaxed font-light mb-2 whitespace-pre-wrap">{item.content}</p>
                      </div>
                      
                      <div className="flex gap-10 mt-8 pt-5 border-t border-white/[0.05]">
                        <div className="flex flex-col">
                          <button 
                            onClick={() => setOpenCommentsId(openCommentsId === item.id ? null : item.id)}
                            className={`group flex items-center gap-2 transition-all ${openCommentsId === item.id ? 'text-purple-400' : 'text-slate-500 hover:text-purple-400'}`}
                          >
                            <MessageSquare size={18} strokeWidth={1.5} />
                            <span className="text-[11px] font-mono">{item.commentCount}</span>
                          </button>
                        </div>
                        
                        <button className="group flex items-center gap-2 text-slate-500 hover:text-cyan-400 transition-all">
                          <Repeat2 size={20} strokeWidth={1.5} />
                          <span className="text-[11px] font-mono">{item.repostCount}</span>
                        </button>

                        <button className="group flex items-center gap-2 text-slate-500 hover:text-red-400 transition-all">
                          <Heart size={18} strokeWidth={1.5} />
                          <span className="text-[11px] font-mono">{item.likeCount}</span>
                        </button>
                      </div>
                      <AnimatePresence>
                        {openCommentsId === item.id && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-6 flex flex-col gap-4">
                              {/* input komentar baru */}
                              <div className="flex gap-3 items-center mb-2">
                                <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${account}`} alt="Your avatar" className="w-8 h-8 rounded-full bg-white/5 border border-white/10" />
                                <div className="relative flex-1 flex items-center">
                                  <input 
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value.toLowerCase())}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendComment(item.id)}
                                    placeholder="write your vibe..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-4 pr-10 text-xs font-mono lowercase focus:outline-none focus:border-purple-500/50 transition-all text-slate-200"
                                  />
                                  
                                  <button 
                                    onClick={() => handleSendComment(item.id)}
                                    disabled={!commentText.trim()}
                                    className={`absolute right-3 transition-colors ${
                                      commentText.trim() ? 'text-purple-500 hover:text-purple-400' : 'text-slate-700'
                                    }`}
                                  >
                                    <Send size={14} strokeWidth={2} />
                                  </button>
                                </div>
                              </div>

                              {/* list komentar (placeholder) */}
                              <div className="pl-11 flex flex-col gap-4">
                                <div className="flex flex-col gap-1">
                                  <span className="text-[10px] font-bold text-purple-400">@sovereign_user</span>
                                  <p className="text-[11px] text-slate-300 leading-relaxed">this vibe is real. 100% locked.</p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </ResonanceCard>
                  ))}
                  <div className="h-20"></div>
                </motion.div>
              )}
              {activeTab === 'wallet' && (
                  <motion.div 
                    className="w-full max-w-md mx-auto p-6"
                  >
                    {/* 1. balance card: the core resonance */}
                    <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-purple-600/20 to-cyan-600/20 border border-white/10 p-8 backdrop-blur-3xl shadow-2xl">
                      <div className="absolute top-0 right-0 p-6 opacity-20">
                        <Wallet size={80} strokeWidth={1} />
                      </div>
                      
                      <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-slate-400">total balance</span>
                      <h3 className="text-4xl font-black mt-2 tracking-tighter italic">
                        {parseFloat(balance || '0.00').toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 4})} <span className="text-sm font-light not-italic text-purple-400">opn</span>
                      </h3>
                      <p className="text-[11px] font-mono text-slate-500 mt-1">≈ $... usd</p>

                      <div className="mt-4 flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">your address</span>
                          <code className="text-[10px] font-mono text-purple-300">
                            {account.slice(0, 6)}...{account.slice(-4)}
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

                    {/* 2. asset list */}
                    <div className="mt-12 flex flex-col gap-6">
                      <div className="flex justify-between items-center px-2">
                        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-500">assets</span>
                        <button className="text-[10px] font-mono text-purple-400">view all</button>
                      </div>

                      {[
                        { name: 'sovereign', symbol: 'opn', balance: '1,240.50', color: 'from-purple-500' },
                        { name: 'bitcoin', symbol: 'btc', balance: '0.042', color: 'from-orange-500' },
                        { name: 'ethereum', symbol: 'eth', balance: '1.25', color: 'from-blue-500' }
                      ].map((asset) => (
                        <div key={asset.symbol} className="flex items-center gap-4 p-4 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${asset.color} to-black/20`} />
                          <div className="flex-1">
                            <h4 className="text-sm font-bold lowercase">{asset.name}</h4>
                            <span className="text-[10px] font-mono text-slate-500 uppercase">{asset.symbol}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold font-mono">{asset.balance}</p>
                            <p className="text-[10px] text-green-500/70">+2.4%</p>
                          </div>
                        </div>
                      ))}
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
                            <h3 className="text-sm font-bold lowercase tracking-widest mb-8 text-purple-400">receive opn</h3>
                            
                            <div className="w-48 h-48 bg-white p-4 rounded-3xl mb-8 shadow-[0_0_40px_rgba(255,255,255,0.15)] flex items-center justify-center">
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${account}`} 
                                    alt="wallet qr"
                                    className="w-full h-full object-contain"
                                />
                            </div>

                            <div className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 mb-8 text-center">
                              <p className="text-[10px] font-mono text-slate-400 break-all lowercase">
                                {account}
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
                            <h3 className="text-sm font-bold lowercase tracking-widest mb-6 text-purple-400">send opn</h3>
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
                            <button onClick={handleSendOPN} className="w-full py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest">confirm send</button>
                            <button onClick={() => setShowSendModal(false)} className="w-full mt-4 text-[10px] font-mono text-slate-500 uppercase">cancel</button>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
              )}
              {activeTab === 'market' && (
                <motion.div
                  className="w-full max-w-md mx-auto flex flex-col gap-4"
                >
                  <h2 className="text-center text-slate-500 font-light tracking-widest uppercase text-sm mb-4">Market Pulse / Iopn Testnet</h2>
                  {marketData.map((coin) => (
                    <div key={coin.symbol} className="p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 flex justify-between items-center">
                      <div className="text-left">
                        <p className="text-2xl font-light tracking-widest lowercase">{coin.symbol}</p>
                        <p className="text-sm font-mono text-slate-400">{coin.price}</p>
                      </div>
                      <p className={`text-lg font-mono font-light ${coin.color}`}>{coin.change}</p>
                    </div>
                  ))}
                  {account && (
                    <p className="text-center text-xs font-mono text-blue-400 mt-12">
                      connected to rpc iopn testnet
                    </p>
                  )}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* --- DOCK MENU --- */}
        <motion.div
          variants={{ visible: { y: 0, opacity: 1 }, hidden: { y: 100, opacity: 0 } }}
          animate={(isScrolling || isSidebarOpen) ? "hidden" : "visible"}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="fixed bottom-0 left-0 right-0 flex items-center justify-around py-5 bg-black/80 backdrop-blur-xl border-t border-white/5 z-[80]"
        >
          {/* home - familiar house icon */}
          <button onClick={() => setActiveTab('home')} className={`p-2 transition-all ${activeTab === 'home' ? 'opacity-100 scale-110' : 'opacity-80 hover:opacity-100'}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9.5Z" stroke="url(#paint0_linear)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="paint0_linear" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#A855F7"/>
                  <stop offset="1" stopColor="#3B82F6"/>
                </linearGradient>
              </defs>
            </svg>
          </button>

          {/* market - familiar chart/trading icon */}
          <button onClick={() => setActiveTab('market')} className={`p-2 transition-all ${activeTab === 'market' ? 'opacity-100 scale-110' : 'opacity-80 hover:opacity-100'}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 18L9 12L13 16L21 8M21 8H16M21 8V13" stroke="url(#paint1_linear)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="paint1_linear" x1="3" y1="8" x2="21" y2="18" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#A855F7"/>
                  <stop offset="1" stopColor="#3B82F6"/>
                </linearGradient>
              </defs>
            </svg>
          </button>

          {/* plus button - center focus */}
          <button className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg shadow-purple-500/20 active:scale-90 transition-transform">
            <span className="text-3xl text-white font-light">+</span>
          </button>

          {/* inbok - familiar mail icon */}
          <button className="p-2 opacity-80 hover:opacity-100 transition-all">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 7L12 13L21 7M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="url(#paint2_linear)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="paint2_linear" x1="2" y1="4" x2="22" y2="20" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#A855F7"/>
                  <stop offset="1" stopColor="#3B82F6"/>
                </linearGradient>
              </defs>
            </svg>
          </button>

          {/* wallet - familiar card/wallet icon */}
          <button onClick={() => setActiveTab('wallet')} className={`p-2 transition-all ${activeTab === 'wallet' ? 'opacity-100 scale-110' : 'opacity-80 hover:opacity-100'}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 12V8C20 6.89543 19.1046 6 18 6H4C2.89543 6 2 6.89543 2 8V16C2 17.1046 2.89543 18 4 18H18C19.1046 18 20 17.1046 20 16V14M20 12H17C15.8954 12 15 12.8954 15 14C15 15.1046 15.8954 16 17 16H20M20 12V14" stroke="url(#paint3_linear)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="paint3_linear" x1="2" y1="6" x2="20" y2="18" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#A855F7"/>
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
