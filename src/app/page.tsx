'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home as HomeIcon, Wallet, BarChart3, Menu, X, Plus, Bell, Search } from 'lucide-react';

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('feed');

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

      <main className="w-full max-w-4xl mx-auto pb-48 pt-10 px-6">
        <motion.div 
          initial="hidden"
          animate="show"
          variants={{
            show: { transition: { staggerChildren: 0.15 } }
          }}
          className="flex flex-col gap-16" // Gap besar agar tiap kartu fokus melayang
        >
          
          {/* 1. MARKET INSIGHT CARD (Cyan Aura) */}
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}
            whileHover={{ y: -12, scale: 1.01 }}
            className="relative p-8 rounded-[3.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-[0_25px_60px_rgba(6,182,212,0.15)] group"
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 blur-[80px] rounded-full"></div>
            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-lg">
                  <BarChart3 size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-white italic">MARKET PULSE</h4>
                  <p className="text-[10px] text-cyan-400 font-mono tracking-widest">OPN/USDT • REALTIME</p>
                </div>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl border border-white/10 text-right font-mono">
                <p className="text-lg font-bold text-white leading-none">$4.82</p>
                <p className="text-[10px] text-green-400">+8.2%</p>
              </div>
            </div>
            <p className="text-slate-300 text-lg leading-relaxed">Liquidity OPN baru saja melonjak. <span className="text-cyan-400">Smart money</span> mulai masuk ke ekosistem. Cek dex tracker sekarang!</p>
          </motion.div>

          {/* 2. CREATOR SOCIAL CAST (Purple Aura) */}
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}
            whileHover={{ y: -12 }}
            className="relative p-8 rounded-[3.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-md shadow-[0_25px_60px_rgba(139,92,246,0.1)]"
          >
            <div className="flex gap-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 p-[3px] shrink-0 shadow-2xl">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Neon" alt="pfp" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-bold text-lg text-white">Nova_Architect</span>
                  <span className="text-xs text-slate-500 font-mono">@nova.opn • 12m</span>
                </div>
                <p className="text-slate-400 text-xl font-light leading-snug">
                  Tahun 3000 bukan tentang siapa yang punya server terbanyak, tapi siapa yang punya <span className="text-purple-400">vibe</span> paling sinkron di jaringan. 🌌
                </p>
                <div className="flex gap-8 mt-6 text-slate-500 text-sm font-bold">
                  <span className="hover:text-cyan-400 cursor-pointer transition">REPLY 42</span>
                  <span className="hover:text-purple-400 cursor-pointer transition">RECAST 12</span>
                  <span className="hover:text-red-400 cursor-pointer transition">LOVE 550</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 3. NFT DROP GALLERY (Gold Aura) */}
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}
            whileHover={{ y: -12 }}
            className="relative p-4 rounded-[4rem] bg-white/[0.05] border border-white/10 shadow-[0_30px_70px_rgba(245,158,11,0.1)] group overflow-hidden"
          >
            <div className="aspect-square w-full rounded-[3.5rem] bg-slate-800 mb-6 overflow-hidden relative">
              <img src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=800" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
              <div className="absolute bottom-10 left-10">
                <p className="text-xs font-mono text-amber-400 mb-2">LIMITED EDITION</p>
                <h3 className="text-3xl font-black text-white italic tracking-tighter">ETHEREAL_VOID #88</h3>
              </div>
            </div>
            <div className="px-6 pb-6 flex justify-between items-center">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Floor Price</p>
                <p className="text-2xl font-black text-white tracking-tighter">850 OPN</p>
              </div>
              <button className="px-10 py-4 bg-white text-black font-black rounded-full hover:bg-amber-400 transition-colors shadow-xl">COLLECT</button>
            </div>
          </motion.div>

          {/* 4. GOVERNANCE PROPOSAL (Red/Pink Aura) */}
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}
            whileHover={{ y: -12 }}
            className="p-8 rounded-[3.5rem] bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20 backdrop-blur-md shadow-[0_25px_60px_rgba(239,68,68,0.1)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-20"><Plus size={80} className="rotate-45" /></div>
            <h4 className="text-xs font-black text-red-400 tracking-[0.4em] mb-4 uppercase">Governance Active</h4>
            <h3 className="text-2xl font-bold text-white mb-4">OIP-14: Implementasi Quantum-Staking di Jaringan OPN</h3>
            <div className="w-full h-2 bg-white/5 rounded-full mb-4 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: '72%' }} className="h-full bg-red-500" />
            </div>
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>YES (72%)</span>
              <span>24h REMAINING</span>
            </div>
          </motion.div>

          {/* 5. SIMPLE MINIMALIST QUOTE (Mono Aura) */}
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}
            whileHover={{ y: -12 }}
            className="p-12 rounded-[3.5rem] bg-white/[0.01] border border-dashed border-white/20 flex flex-col items-center justify-center text-center shadow-2xl"
          >
            <div className="w-12 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 mb-8"></div>
            <p className="text-2xl font-medium text-slate-400 italic">
              "Di tahun 3000, privasi bukan lagi pilihan, tapi protokol dasar."
            </p>
            <p className="mt-6 text-xs font-mono text-slate-600">— OPN_ANONYMOUS_VOID</p>
          </motion.div>

          {/* Footer Spacer */}
          <div className="h-32"></div>

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
