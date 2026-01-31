'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, BarChart3, Plus, Wallet, Bell, User, Bookmark, Settings, LogOut, ArrowLeft, Menu, Search, X, Share2, MessageSquare, Repeat2, Heart } from 'lucide-react';


// --- HELPER COMPONENT: USER HEADER ---
const UserHeader = ({ name, handle, time, themeColor }: { name: string; handle: string; time: string; themeColor: string; }) => (
    <div className="flex items-center gap-3">
      <div 
        className="w-12 h-12 rounded-full p-[2px] shadow-lg"
        style={{ background: `linear-gradient(to top right, ${themeColor}, #ffffff)` }}
      >
        <div className="w-full h-full rounded-full bg-[#050505] overflow-hidden flex items-center justify-center border border-white/10">
          <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${handle}&backgroundColor=${themeColor.replace('#','')}`} alt="pfp" />
        </div>
      </div>
      <div>
        <h4 className="text-sm font-black text-white leading-none tracking-tight">{name}</h4>
        <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-tighter">@{handle} • {time}</p>
      </div>
    </div>
);

// --- HELPER COMPONENT: INTERACTION BUTTON ---
const InteractionButton = ({ type, icon, count, themeColor }: { type: 'comment' | 'repost' | 'like', icon: React.ReactNode, count: number, themeColor: string }) => {
  const [isActive, setIsActive] = React.useState(false);

  const getIconStyle = () => {
    if (type === 'comment') {
      return { stroke: `${themeColor}88`, strokeWidth: 1.5 };
    }

    const style = {
      stroke: isActive ? themeColor : `${themeColor}88`,
      strokeWidth: 1.5,
      filter: isActive ? `drop-shadow(0 0 5px ${themeColor}aa)` : 'none',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    };
    
    if (type === 'like') {
      // @ts-ignore
      style.fill = isActive ? themeColor : 'transparent';
      // @ts-ignore
      style.fillOpacity = 0.2;
    }

    return style;
  };

  const handleClick = () => {
    if (type === 'like' || type === 'repost') {
      setIsActive(!isActive);
    }
  };
  
  const displayCount = (type === 'like' || type === 'repost') && isActive ? count + 1 : count;
  const countColor = (type === 'like' || type === 'repost') && isActive ? themeColor : `${themeColor}aa`;

  return (
    <button onClick={handleClick} className="flex items-center gap-2.5 group">
      <div className="p-1 rounded-full group-hover:bg-white/5 transition-colors">
        {React.cloneElement(icon as React.ReactElement, {
          style: getIconStyle(),
          className: `
            ${type === 'comment' ? 'group-hover:stroke-white transition-colors' : ''}
            ${type === 'repost' && isActive ? 'rotate-180' : ''}
          `,
        })}
      </div>
      <span className="text-[11px] font-mono tracking-tighter" style={{ color: countColor }}>
        {displayCount}
      </span>
    </button>
  );
};

// --- COMPONENT: INTERACTION BAR ---
const InteractionBar = ({ themeColor }: { themeColor: string }) => {
  const [stats, setStats] = React.useState<{ comments: number, reposts: number, likes: number } | null>(null);

  useEffect(() => {
    setStats({
      likes: Math.floor(Math.random() * 1000),
      reposts: Math.floor(Math.random() * 100),
      comments: Math.floor(Math.random() * 50)
    });
  }, []);

  if (!stats) {
    return <div className="mt-8 pt-5 border-t border-white/[0.05] h-[37px]" />;
  }

  return (
    <div className="flex gap-10 mt-8 pt-5 border-t border-white/[0.05]">
      <InteractionButton type="comment" icon={<MessageSquare size={20} />} count={stats.comments} themeColor={themeColor} />
      <InteractionButton type="repost" icon={<Repeat2 size={22} />} count={stats.reposts} themeColor={themeColor} />
      <InteractionButton type="like" icon={<Heart size={20} />} count={stats.likes} themeColor={themeColor} />
    </div>
  );
};
  
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

  useEffect(() => {
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
  }, [lastY]);

  const handleNavigation = (target: string) => {
    setActiveTab(target);
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    alert("Logging out from Vibesphere...");
  };

  const feedData = [
    { id: 1, user: "Nova_Architect", handle: "nova.opn", time: "2m", color: "#a855f7", content: "GM OPN Fam! The sovereign vibes are strong today.", type: "short" },
    { id: 2, user: "Quantum_Leaper", handle: "ql.opn", time: "30m", color: "#06b6d4", content: "Just deployed a new DApp on OPN... the speed is unreal. Year 3000 is now.", type: "medium" },
    { id: 3, user: "DAO_Steward", handle: "gov.opn", time: "2h", color: "#ef4444", 
      content: `New governance proposal OIP-8 is live. It suggests adjusting the liquidity provider rewards to incentivize smaller, more diverse pools. This is critical for network health and decentralization.\n\nKey points:\n- Reduce rewards for top 5 pools by 10%\n- Increase rewards for pools outside top 20 by 15%\n- Introduce a 2-week lock-up period for new LPs to claim boosted rewards.\n\nThis will prevent whale dominance and foster a more resilient ecosystem. Please review the full proposal on-chain and cast your vote. Your vibe matters.`, 
      type: "long" 
    },
    { id: 4, user: "Chrono_Trader", handle: "chrono.opn", time: "5h", color: "#f59e0b", content: "Just aped into the new 'Ethereal Void' NFT collection. The art is pure Year 3000 aesthetic.", type: "short" },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden font-sans">
      
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
              
              {/* tombol close (x) */}
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
                      <UserHeader name={item.user} handle={item.handle} time={item.time} themeColor={item.color} />
                      <button className="group p-2 -mr-2 mt-1">
                        <Share2 size={18} style={{ stroke: `${item.color}66`, strokeWidth: 1.5 }} className="group-hover:stroke-white transition-colors"/>
                      </button>
                    </div>
                    <div className={item.type === 'long' ? 'max-h-[250px] overflow-y-auto pr-4 custom-scrollbar min-h-[40px]' : 'min-h-[40px]'}>
                      <p className="text-slate-200 text-lg leading-relaxed font-light mb-2 whitespace-pre-wrap">{item.content}</p>
                    </div>
                    <InteractionBar themeColor={item.color} />
                  </ResonanceCard>
                ))}
                <div className="h-20"></div>
              </motion.div>
            )}
            {activeTab !== 'home' && (
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

    </div>
  );
}
