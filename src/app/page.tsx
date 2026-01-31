'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home as HomeIcon, Wallet, BarChart3, Menu, X, Plus, Bell, Search, MessageSquare, Repeat2, Heart, Share2 } from 'lucide-react';


// --- HELPER COMPONENT: USER HEADER ---
const UserHeader = ({ name, handle, time, themeColor }: { name: string; handle: string; time: string; themeColor: string; }) => (
    <div className="flex items-center gap-3 mb-5">
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

// --- COMPONENT: INTERACTION BAR (Thin Line Resonance) ---
const InteractionBar = ({ themeColor }: { themeColor: string }) => {
  const [liked, setLiked] = React.useState(false);
  const [reposted, setReposted] = React.useState(false);
  const [stats, setStats] = React.useState<{ comments: number, reposts: number, likes: number } | null>(null);

  React.useEffect(() => {
    // Generate random numbers on the client after mount to prevent hydration errors
    setStats({
      likes: Math.floor(Math.random() * 1000),
      reposts: Math.floor(Math.random() * 100),
      comments: Math.floor(Math.random() * 50)
    });
  }, []);

  // Style untuk ikon garis tipis yang beresonansi
  const getIconStyle = (isActive: boolean) => ({
    stroke: isActive ? themeColor : `${themeColor}88`, // Warna penuh jika aktif, pudar jika tidak
    strokeWidth: 1.5,
    filter: isActive ? `drop-shadow(0 0 5px ${themeColor}aa)` : 'none',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
  });

  return (
    <div className="flex justify-between items-center mt-8 pt-5 border-t border-white/[0.05]">
      <div className="flex gap-10">
        
        {/* Comment - Line Style */}
        <button className="flex items-center gap-2.5 group">
          <div className="p-1 rounded-full group-hover:bg-white/5 transition-colors">
            <MessageSquare 
              size={20} 
              style={{ stroke: `${themeColor}88`, strokeWidth: 1.5 }} 
              className="group-hover:text-white transition-colors"
            />
          </div>
          {stats && <span className="text-[11px] font-mono tracking-tighter" style={{ color: `${themeColor}aa` }}>
            {stats.comments}
          </span>}
        </button>

        {/* Repost - Line Style */}
        <button 
          onClick={() => setReposted(!reposted)}
          className="flex items-center gap-2.5 group"
        >
          <div className="p-1 rounded-full group-hover:bg-white/5 transition-colors">
            <Repeat2 
              size={22} 
              style={getIconStyle(reposted)} 
              className={reposted ? "rotate-180" : ""}
            />
          </div>
          {stats && <span className="text-[11px] font-mono tracking-tighter" style={{ color: reposted ? themeColor : `${themeColor}aa` }}>
            {reposted ? stats.reposts + 1 : stats.reposts}
          </span>}
        </button>

        {/* Like - Line Style */}
        <button 
          onClick={() => setLiked(!liked)}
          className="flex items-center gap-2.5 group"
        >
          <div className="p-1 rounded-full group-hover:bg-white/5 transition-colors">
            <Heart 
              size={20} 
              style={getIconStyle(liked)} 
              fill={liked ? themeColor : "transparent"} // Hanya fill saat diklik
              fillOpacity={0.2}
            />
          </div>
          {stats && <span className="text-[11px] font-mono tracking-tighter" style={{ color: liked ? themeColor : `${themeColor}aa` }}>
            {liked ? stats.likes + 1 : stats.likes}
          </span>}
        </button>
      </div>

      <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
          <Share2 size={20} style={{ stroke: `${themeColor}88`, strokeWidth: 1.5 }} />
       </button>
    </div>
  );
};

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const feedData = [
    { id: 1, user: "Red_Void", handle: "void.opn", time: "1m", color: "#ef4444", content: "GM! Energi merah di orbit OPN hari ini sangat kuat. 🔥", type: "short" },
    { id: 2, user: "Cyan_Pulse", handle: "pulse.opn", time: "12m", color: "#06b6d4", content: "Baru saja mengupdate node di sektor 9. Koneksi super stabil!", type: "medium" },
    { id: 3, user: "Neon_Aura", handle: "neon.opn", time: "45m", color: "#a855f7", content: "Sovereign identity adalah kunci masa depan. Jangan serahkan datamu pada korporasi lama. #DecentralizedYear3000", type: "medium" },
    { id: 4, user: "Amber_Grid", handle: "amber.opn", time: "2h", color: "#f59e0b", content: "Lagi nge-bid NFT rare di pasar OPN. Doakan menang ya frens!", type: "short" },
    { id: 5, user: "Emerald_Dev", handle: "green.opn", time: "5h", color: "#10b981", content: "Update Smart Contract v4.0 sukses dideploy. Outerline warna hijau ini tanda sistem 'Health' 100%.", type: "medium" }
  ];

  return (
    <div className="relative min-h-screen bg-[#050505] text-white font-sans overflow-hidden">
      
      {/* 1. FUTURISTIC SIDEBAR (OVERLAY) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-purple-900/10 backdrop-blur-md z-[60]"
            />
            
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed top-0 left-0 h-full w-72 bg-black/40 backdrop-blur-3xl border-r border-white/10 z-[70] p-6 shadow-[20px_0_50px_rgba(138,99,210,0.1)]"
            >
              {/* Profile moved to Sidebar */}
              <div className="flex items-center gap-3 mb-10 p-3 bg-white/5 rounded-2xl border border-white/10">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-600"></div>
                <div>
                  <p className="font-bold text-sm">VibeCoder.opn</p>
                  <p className="text-xs text-slate-500 italic">Core Developer</p>
                </div>
              </div>

              <nav className="space-y-2">
                {['Profile', 'Settings', 'Governance', 'Soulbound ID'].map((item) => (
                  <div key={item} className="p-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 cursor-pointer transition group">
                    <span className="text-slate-400 group-hover:text-cyan-400 transition">{item}</span>
                  </div>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 2. HEADER WITH EXPANDABLE SEARCH */}
      <header className="sticky top-0 w-full p-4 flex justify-between items-center bg-black/20 backdrop-blur-xl z-50 border-b border-white/5">
        {/* Left: Menu Toggle */}
        {!isSearchOpen && (
          <motion.button 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setIsSidebarOpen(true)}
            className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 border border-white/10 transition"
          >
            <Menu size={24} className="text-cyan-400" />
          </motion.button>
        )}

        {/* Center: Title (Hidden when searching) */}
        {!isSearchOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-bold tracking-widest text-sm text-slate-400 uppercase"
          >
            OPN NEXUS
          </motion.div>
        )}

        {/* Right: Expandable Search Bar */}
        <div className={`flex items-center justify-end ${isSearchOpen ? 'w-full' : 'w-auto'}`}>
          <motion.div 
            layout
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`flex items-center bg-white/5 border border-white/10 rounded-2xl overflow-hidden ${isSearchOpen ? 'w-full p-1' : 'w-12 h-12'}`}
          >
            {isSearchOpen && (
              <input 
                autoFocus
                type="text" 
                placeholder="Search OPN ecosystem..." 
                className="bg-transparent border-none focus:ring-0 w-full px-4 text-sm text-white placeholder:text-slate-500"
              />
            )}
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-3 transition-colors ${isSearchOpen ? 'hover:bg-white/5 text-cyan-400' : 'text-slate-400 hover:text-white'}`}
            >
              {isSearchOpen ? <X size={20} /> : <Search size={24} />}
            </button>
          </motion.div>
        </div>
      </header>
      
      <main className="w-full max-w-4xl mx-auto pb-48 pt-10 px-6 min-h-screen">
        <motion.div 
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.15 } } }}
            className="flex flex-col gap-12"
        >
            {feedData.map((item) => (
                <ResonanceCard key={item.id} themeColor={item.color} isShort={item.type === 'short'}>
                    <UserHeader 
                        name={item.user} 
                        handle={item.handle} 
                        time={item.time} 
                        themeColor={item.color} 
                    />
                    <div className="min-h-[40px]">
                      <p className="text-slate-200 text-lg leading-relaxed font-light mb-2">
                          {item.content}
                      </p>
                    </div>
                    <InteractionBar themeColor={item.color} />
                </ResonanceCard>
            ))}
             <div className="h-20"></div>
        </motion.div>
      </main>

      {/* 4. BOTTOM FLOATING DOCK */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-6">
        <nav className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-2 flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          <button className="p-4 rounded-full text-cyan-400 bg-white/5"><HomeIcon size={24} /></button>
          <button className="p-4 rounded-full text-slate-400 hover:text-white"><BarChart3 size={24} /></button>
          <button className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform">
            <Plus size={24} strokeWidth={3} />
          </button>
          <button className="p-4 rounded-full text-slate-400 hover:text-white"><Wallet size={24} /></button>
          <button className="p-4 rounded-full text-slate-400 hover:text-white"><Bell size={24} /></button>
        </nav>
      </div>

    </div>
  );
}
