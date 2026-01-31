'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Home as HomeIcon, Wallet, BarChart3, Menu, X, Plus, Bell, Search, MessageSquare, Repeat2, Heart, Share2, Waves, User, Bookmark, Settings, ArrowLeft, LogOut } from 'lucide-react';


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

    return {
      stroke: isActive ? themeColor : `${themeColor}88`,
      strokeWidth: 1.5,
      filter: isActive ? `drop-shadow(0 0 5px ${themeColor}aa)` : 'none',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      ...(type === 'like' && {
        fill: isActive ? themeColor : 'transparent',
        fillOpacity: 0.2,
      }),
    };
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
    // Client-side only effect to avoid hydration mismatch
    setStats({
      likes: Math.floor(Math.random() * 1000),
      reposts: Math.floor(Math.random() * 100),
      comments: Math.floor(Math.random() * 50)
    });
  }, []);

  if (!stats) {
    // Render a placeholder or null during SSR and initial client render
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
  
// --- COMPONENT: RESONANCE CARD (The Floating Shell) ---
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

// --- HELPER COMPONENT: DOCK ITEM ---
const DockItem = ({ icon, active = false }: { icon: React.ReactNode; active?: boolean }) => (
  <button className="text-slate-400 hover:text-white transition-all">
    {React.cloneElement(icon as React.ReactElement, {
        strokeWidth: active ? 2.5 : 1.5,
        className: `transition-all duration-300 ${active ? 'text-white' : ''}`
    })}
  </button>
);


export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navigateTo = (path: string) => console.log(`Navigating to ${path}`);

  const { scrollY } = useScroll();
  const [isHidden, setIsHidden] = useState(false);
  const [lastY, setLastY] = useState(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const diff = latest - lastY;
    if (Math.abs(diff) > 5) {
      setIsHidden(true);
    }
    setLastY(latest);
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsHidden(false);
    }, 150);
    return () => clearTimeout(timeout);
  }, [lastY]);
  
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
    <div className="relative min-h-screen bg-[#050505] text-white font-sans overflow-hidden">
      
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
            />

            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 w-64 bg-[#050505]/98 backdrop-blur-3xl z-[100] border-r border-white/5 p-8 flex flex-col"
            >
              {/* 1. top section: back button & branding */}
              <div className="flex flex-col gap-6 mb-12">
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="group flex items-center gap-2 text-slate-500 hover:text-white transition-all"
                >
                  <ArrowLeft size={18} strokeWidth={1.5} />
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em]">back</span>
                </button>

                <h2 className="text-2xl font-black tracking-[0.2em] lowercase italic bg-gradient-to-tr from-white via-purple-400 to-purple-600 bg-clip-text text-transparent leading-none">
                  vibesphere
                </h2>
              </div>

              {/* 2. menu sidebar: slim & mono style */}
              <nav className="flex flex-col gap-8 flex-1">
                {/* profile */}
                <button onClick={() => navigateTo('profile')} className="group flex items-center gap-4 transition-all">
                  <User size={18} className="text-slate-500 group-hover:text-purple-400" strokeWidth={1.5} />
                  <span className="text-[11px] font-mono font-bold tracking-[0.2em] lowercase text-slate-400 group-hover:text-white">
                    profile
                  </span>
                </button>

                {/* bookmark */}
                <button onClick={() => navigateTo('bookmarks')} className="group flex items-center gap-4 transition-all">
                  <Bookmark size={18} className="text-slate-500 group-hover:text-purple-400" strokeWidth={1.5} />
                  <span className="text-[11px] font-mono font-bold tracking-[0.2em] lowercase text-slate-400 group-hover:text-white">
                    bookmark
                  </span>
                </button>

                {/* settings */}
                <button onClick={() => navigateTo('settings')} className="group flex items-center gap-4 transition-all">
                  <Settings size={18} className="text-slate-500 group-hover:text-purple-400" strokeWidth={1.5} />
                  <span className="text-[11px] font-mono font-bold tracking-[0.2em] lowercase text-slate-400 group-hover:text-white">
                    settings
                  </span>
                </button>
              </nav>

              {/* 3. bottom section: logout */}
              <div className="mt-auto pt-6 border-t border-white/5">
                <button className="group flex items-center gap-4 w-full transition-all">
                  <LogOut size={18} className="text-red-500/60 group-hover:text-red-500" strokeWidth={1.5} />
                  <span className="text-[11px] font-mono font-bold tracking-[0.2em] lowercase text-red-500/60 group-hover:text-red-500">
                    logout
                  </span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.header
        variants={{
          visible: { y: 0, opacity: 1 },
          hidden: { y: -100, opacity: 0 }
        }}
        animate={isHidden ? "hidden" : "visible"}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 w-full p-6 flex justify-between items-center bg-black/40 backdrop-blur-2xl z-50 border-b border-white/5"
      >
        <AnimatePresence>
          {!isSearchOpen ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              className="flex items-center gap-4"
            >
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-white/5 rounded-xl transition">
                <Menu size={22} className="text-slate-400" />
              </button>
            </motion.div>
          ) : (
            <div className="w-[40px]" />
          )}
        </AnimatePresence>

        <motion.div
            layout
            className="flex-1 flex justify-center overflow-hidden"
        >
            {!isSearchOpen && (
                <motion.h1 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm md:text-base font-black tracking-[0.3em] lowercase whitespace-nowrap bg-gradient-to-r from-slate-400 via-white to-slate-400 bg-clip-text text-transparent italic"
                >
                    vibes of sovereign
                </motion.h1>
            )}
        </motion.div>


        <div className={`flex items-center justify-end ${isSearchOpen ? 'w-full absolute inset-x-0 px-6' : 'min-w-[40px]'}`}>
          <motion.div
            layout
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`flex items-center justify-end rounded-2xl ${isSearchOpen ? 'w-full bg-white/10' : ''}`}
          >
            <AnimatePresence>
            {isSearchOpen ? (
              <>
                <Search size={22} className="text-slate-400 ml-4 flex-shrink-0 pointer-events-none" />
                <motion.input
                    initial={{ width: 0, opacity: 0, paddingLeft: 0, paddingRight: 0 }}
                    animate={{ width: '100%', opacity: 1, paddingLeft: '1rem', paddingRight: '1rem' }}
                    exit={{ width: 0, opacity: 0, paddingLeft: 0, paddingRight: 0, transition: { duration: 0.2 } }}
                    autoFocus
                    type="text"
                    placeholder="Search the vibescape..."
                    className="bg-transparent border-none focus:ring-0 w-full text-base text-white placeholder:text-slate-500"
                />
              </>
            ) : null}
            </AnimatePresence>
            <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="p-2 hover:bg-white/5 rounded-xl transition">
              {isSearchOpen ? <X size={22} className="text-slate-400" /> : <Search size={22} className="text-slate-400" />}
            </button>
          </motion.div>
        </div>
      </motion.header>
      
      <main className="w-full max-w-4xl mx-auto pb-48 pt-28 px-6 min-h-screen">
        <motion.div 
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.15 } } }}
            className="flex flex-col items-center gap-12"
        >
            {feedData.map((item) => (
                <ResonanceCard key={item.id} themeColor={item.color} isShort={item.type === 'short'}>
                    <div className="flex justify-between items-start mb-5">
                      <UserHeader 
                          name={item.user} 
                          handle={item.handle} 
                          time={item.time} 
                          themeColor={item.color} 
                      />
                      <button className="group p-2 -mr-2 mt-1">
                        <Share2 
                          size={18} 
                          style={{ stroke: `${item.color}66`, strokeWidth: 1.5 }} 
                          className="group-hover:stroke-white transition-colors"
                        />
                      </button>
                    </div>

                    <div className={item.type === 'long' ? 'max-h-[250px] overflow-y-auto pr-4 custom-scrollbar min-h-[40px]' : 'min-h-[40px]'}>
                      <p className="text-slate-200 text-lg leading-relaxed font-light mb-2 whitespace-pre-wrap">
                          {item.content}
                      </p>
                    </div>
                    <InteractionBar themeColor={item.color} />
                </ResonanceCard>
            ))}
             <div className="h-20"></div>
        </motion.div>
      </main>

      <motion.nav
        variants={{
          visible: { y: 0, opacity: 1 },
          hidden: { y: 120, opacity: 0 }
        }}
        animate={(isHidden || isSidebarOpen) ? "hidden" : "visible"}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="fixed bottom-10 left-1/2 -translate-x-1/2 px-8 py-4 bg-black/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 z-[80] flex gap-12 items-center shadow-2xl"
      >
        <DockItem icon={<HomeIcon size={22} />} active />
        <DockItem icon={<BarChart3 size={22} />} />
        <button className="bg-gradient-to-tr from-purple-500 to-cyan-500 p-3 rounded-2xl -mt-2 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:scale-110 transition-transform cursor-pointer">
          <Plus size={24} className="text-white" />
        </button>
        <DockItem icon={<Wallet size={22} />} />
        <DockItem icon={<Bell size={22} />} />
      </motion.nav>

    </div>
  );
}
