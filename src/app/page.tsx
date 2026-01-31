'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, BarChart3, Plus, Wallet, Bell, User, Bookmark, Settings, LogOut, ArrowLeft, Menu, Search, X, Share2, MessageSquare, Repeat2, Heart, Send, Copy, ClipboardList } from 'lucide-react';
import { formatEther } from 'viem';
import { mnemonicToAccount } from 'viem/accounts';

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

  // --- CORE SESSION & PROFILE ENGINE ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState({
    username: "sovereign_viber",
    address: "",
    avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=vibe",
    balance: "0.00"
  });
  const [authStep, setAuthStep] = useState('gateway'); // gateway, create, import, show-mnemonic
  const [mnemonic, setMnemonic] = useState("");

  // --- AUTH FUNCTIONS ---
  const handleAuthSuccess = async (seedPhrase: string) => {
    const cleanMnemonic = seedPhrase.trim().toLowerCase().replace(/\s+/g, ' ');

    if (cleanMnemonic.split(/\s+/).length !== 12) {
        alert("check your vibe: seed phrase must be 12 words.");
        return;
    }
    
    try {
        // 1. GENERATE WALLET LOCALLY
        const account = mnemonicToAccount(cleanMnemonic);
        
        // 2. LOGIN IMMEDIATELY with local data
        setUserProfile({
            username: "viber_" + account.address.slice(2, 8),
            address: account.address,
            avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${account.address}`,
            balance: "0.00"
        });
        setMnemonic(cleanMnemonic);
        setIsLoggedIn(true);
        setAuthStep('gateway');
        console.log("local nexus active. syncing with iopn in background...");

        // 3. BACKGROUND SYNC
        try {
            const rpcTarget = "https://rpc-testnet.iopn.io";
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rpcTarget)}`;

            const response = await fetch(proxyUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    method: "eth_getBalance",
                    params: [account.address, "latest"],
                    id: 1
                })
            });

            if (response.ok) {
                const json = await response.json();
                if (json.error) {
                    throw new Error(`RPC Error: ${json.error.message}`);
                }
                const rawBalance = json.result;
                const formattedBalance = formatEther(BigInt(rawBalance));

                // Update profile with real balance from RPC
                setUserProfile(prev => ({ ...prev, balance: formattedBalance }));
                console.log("balance synced from iopn.");
            } else {
                const errorBody = await response.text();
                throw new Error(`RPC request failed with status ${response.status}: ${errorBody}`);
            }
        } catch (bgError) {
            console.warn("RPC sync failed in background, using local balance.", bgError);
        }

    } catch (error) {
        console.error("Critical Auth Error:", error);
        alert("vibe check failed. could not derive wallet from seed phrase.");
    }
  };
  
  const handleLogout = () => {
    if (window.confirm("exit vibesphere? your sovereignty remains on-chain.")) {
      setIsLoggedIn(false);
      setIsSidebarOpen(false);
      setAuthStep('gateway'); // Reset auth flow for next login
      console.log("disconnected from nexus.");
    }
  };

  // --- WALLET FUNCTIONS ---
  const handleCreateWallet = () => {
    // simulasi generate 12 kata (seed phrase)
    const dummyMnemonic = "vibe soul orbit neon spark pulse crypto sovereign nexus logic flow wave";
    setMnemonic(dummyMnemonic);
    setAuthStep('show-mnemonic'); // pindah ke layar tampilkan seed phrase
    console.log("new wallet generated locally.");
  };

  const handleImportWallet = (inputMnemonic: string) => {
    handleAuthSuccess(inputMnemonic);
  };

  const copyToClipboard = () => {
    if (mnemonic) {
      navigator.clipboard.writeText(mnemonic);
      alert("seed phrase copied to clipboard. stay safe, vibe coder.");
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setMnemonic(text);
      console.log("seed phrase pasted.");
    } catch (err) {
      alert("failed to paste. please allow clipboard access.");
    }
  };

  const copyAddress = () => {
    if (userProfile.address) {
      navigator.clipboard.writeText(userProfile.address);
      alert("wallet address copied to clipboard!");
    }
  };
  
  // --- SCROLL HANDLING ---
  useEffect(() => {
    if (!isLoggedIn) return; // Only run scroll listener when logged in
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
  }, [lastY, isLoggedIn]);

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


  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden font-sans">
      
      {!isLoggedIn ? (
        <div className="flex items-center justify-center min-h-screen">
          <AnimatePresence mode="wait">
            <motion.div
              key={authStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm mx-auto flex flex-col items-center justify-center p-8"
            >
              {authStep === 'gateway' && (
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
                      secure your sovereignty. <br/> no email. no password. just vibe.
                    </p>

                    <div className="w-full flex flex-col gap-4">
                      <button 
                        onClick={handleCreateWallet}
                        className="w-full py-4 rounded-[2rem] bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold uppercase tracking-[0.2em] hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all"
                      >
                        create new wallet
                      </button>

                      <button 
                        onClick={() => setAuthStep('import')}
                        className="w-full py-4 rounded-[2rem] bg-white/5 border border-white/10 text-slate-300 text-xs font-bold uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
                      >
                        import existing wallet
                      </button>
                    </div>

                    <div className="mt-12 p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                      <p className="text-[9px] font-mono text-slate-600 text-center leading-normal lowercase">
                        *vibesphere does not store your seed phrase. 100% on-chain & non-custodial.
                      </p>
                    </div>
                  </motion.div>
              )}
              {authStep === 'show-mnemonic' && (
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="w-full"
                >
                  <motion.div className="w-full p-6 bg-white/[0.02] border border-purple-500/20 rounded-[2rem]">
                    <h3 className="text-xs font-mono text-purple-400 mb-4 lowercase tracking-[0.2em]">your seed phrase:</h3>
                    <div className="grid grid-cols-3 gap-2 mb-6">
                      {mnemonic.split(' ').map((word, i) => (
                        <div key={i} className="bg-white/5 p-2 rounded-lg text-center text-[10px] font-mono text-slate-300">
                          {word}
                        </div>
                      ))}
                    </div>
                    
                    <button 
                      onClick={copyToClipboard}
                      className="w-full py-3 mb-3 bg-white/5 border border-white/10 text-purple-400 text-[10px] font-bold uppercase rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                    >
                      <Copy size={14} /> copy seed phrase
                    </button>
                    
                    <button onClick={() => handleAuthSuccess(mnemonic)} className="w-full py-3 bg-white text-black text-[10px] font-bold uppercase rounded-xl">
                      i've saved it
                    </button>
                  </motion.div>
                  <div className="mt-12 p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                    <p className="text-[9px] font-mono text-slate-600 text-center leading-normal lowercase">
                      *vibesphere does not store your seed phrase. 100% on-chain & non-custodial.
                    </p>
                  </div>
                </motion.div>
              )}
              {authStep === 'import' && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="w-full"
                >
                  <motion.div>
                    <div className="relative">
                      <textarea 
                        value={mnemonic}
                        onChange={(e) => setMnemonic(e.target.value)}
                        placeholder="enter your 12 word seed phrase..."
                        className="w-full h-32 bg-white/5 border border-white/10 rounded-[2rem] p-6 text-xs font-mono lowercase focus:outline-none focus:border-purple-500/50"
                      />
                      <button 
                        onClick={pasteFromClipboard}
                        className="absolute bottom-4 right-6 text-[10px] font-mono text-purple-400 hover:text-white uppercase flex items-center gap-1"
                      >
                        <ClipboardList size={14} /> paste
                      </button>
                    </div>
                    
                    <button onClick={() => handleImportWallet(mnemonic)} className="w-full mt-4 py-4 bg-purple-600 text-white text-[10px] font-bold uppercase rounded-2xl shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                      verify & import
                    </button>
                     <button onClick={() => setAuthStep('gateway')} className="w-full mt-4 text-purple-400 font-mono text-sm p-2 rounded-lg hover:bg-purple-500/10 transition-colors">Back to Gateway</button>
                  </motion.div>
                  <div className="mt-12 p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                    <p className="text-[9px] font-mono text-slate-600 text-center leading-normal lowercase">
                      *vibesphere does not store your seed phrase. 100% on-chain & non-custodial.
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
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
                <nav className="flex flex-col gap-8 flex-1">
                  <SidebarLink icon={<User size={18} strokeWidth={1.5}/>} label="profile" onClick={() => handleNavigation('profile')} />
                  <SidebarLink icon={<Bookmark size={18} strokeWidth={1.5}/>} label="bookmark" onClick={() => handleNavigation('bookmark')} />
                  <SidebarLink icon={<Settings size={18} strokeWidth={1.5}/>} label="settings" onClick={() => handleNavigation('settings')} />
                </nav>
                <div className="mt-auto pt-6 border-t border-white/5">
                  <button onClick={handleLogout} className="flex items-center gap-4 text-red-500/60 hover:text-red-500 transition">
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
                                <img src={userProfile.avatar} alt="Your avatar" className="w-8 h-8 rounded-full bg-white/5 border border-white/10" />
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
                        {parseFloat(userProfile.balance || '0.00').toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 4})} <span className="text-sm font-light not-italic text-purple-400">opn</span>
                      </h3>
                      <p className="text-[11px] font-mono text-slate-500 mt-1">≈ $... usd</p>

                      <div className="mt-4 flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">your address</span>
                          <code className="text-[10px] font-mono text-purple-300">
                            {userProfile.address.slice(0, 6)}...{userProfile.address.slice(-4)}
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
                        <button className="flex-1 py-3 rounded-2xl bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-purple-400 transition-colors">
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
                            
                            <div className="w-48 h-48 bg-white p-3 rounded-3xl mb-8 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                               <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300">
                                 <span className="text-[8px] text-slate-400 font-mono">qr code generated for {userProfile.address.slice(0,4)}</span>
                               </div>
                            </div>

                            <div className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 mb-8">
                              <p className="text-[10px] font-mono text-slate-400 break-all text-center lowercase leading-relaxed">
                                {userProfile.address}
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
                    </AnimatePresence>
                  </motion.div>
              )}
              {activeTab !== 'home' && activeTab !== 'wallet' && (
                <div className="text-center pt-20">
                  <h2 className="text-4xl font-black uppercase tracking-widest bg-gradient-to-r from-slate-300 to-slate-600 bg-clip-text text-transparent">{activeTab}</h2>
                  <p className="text-slate-500 mt-4 font-mono">Resonance field stabilizing... content will materialize shortly.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* --- DOCK MENU --- */}
        <div className="fixed bottom-10 left-0 right-0 flex justify-center z-[80] pointer-events-none">
          <motion.nav
            variants={{ visible: { y: 0, opacity: 1 }, hidden: { y: 120, opacity: 0 } }}
            animate={(isScrolling || isSidebarOpen) ? "hidden" : "visible"}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="pointer-events-auto px-6 py-4 bg-black/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 flex gap-8 items-center shadow-2xl"
          >
            <button onClick={() => setActiveTab('home')} className={activeTab === 'home' ? "text-purple-400" : "text-slate-500"}><Home size={22} strokeWidth={1.5} /></button>
            <button onClick={() => setActiveTab('market')} className={activeTab === 'market' ? "text-purple-400" : "text-slate-500"}><BarChart3 size={22} strokeWidth={1.5} /></button>
            <div className="bg-gradient-to-tr from-purple-500 to-cyan-500 p-3 rounded-2xl shadow-[0_0_20px_rgba(168,85,247,0.4)]"><Plus size={24} strokeWidth={2} className="text-white" /></div>
            <button onClick={() => setActiveTab('wallet')} className={activeTab === 'wallet' ? "text-purple-400" : "text-slate-500"}><Wallet size={22} strokeWidth={1.5} /></button>
            <button onClick={() => setActiveTab('notif')} className={activeTab === 'notif' ? "text-purple-400" : "text-slate-500"}><Bell size={22} strokeWidth={1.5} /></button>
          </motion.nav>
        </div>
      </>
      )}
    </div>
  );
}
