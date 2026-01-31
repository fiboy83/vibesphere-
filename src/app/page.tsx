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

      <main className="w-full max-w-4xl mx-auto pb-48 pt-10 px-6 min-h-screen">
        <motion.div 
          initial="hidden"
          animate="show"
          variants={{
            show: { transition: { staggerChildren: 0.2 } }
          }}
          className="flex flex-col gap-20" // Consistent spacing between cards
        >
          
          {/* 1. MARKET CARD (CYAN) */}
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 50 }, show: { opacity: 1, y: 0 } }}
            whileHover={{ y: -15, scale: 1.02 }}
            className="relative p-10 rounded-[3.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-2xl shadow-[0_30px_70px_rgba(6,182,212,0.12)] group"
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 blur-[80px] rounded-full"></div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-4 items-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg">
                  <BarChart3 size={28} />
                </div>
                <h4 className="text-xl font-black text-white italic tracking-tighter">MARKET ALPHA</h4>
              </div>
              <div className="text-right">
                <p className="text-2xl font-mono font-bold text-white">$4.82</p>
                <p className="text-xs text-green-400 font-bold">+12.5%</p>
              </div>
            </div>
            <p className="text-slate-300 text-lg">OPN Network volume is surging. <span className="text-cyan-400 font-bold">#BullishVibe</span> detected across all nodes.</p>
          </motion.div>

          {/* 2. SOCIAL CARD (PURPLE) */}
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 50 }, show: { opacity: 1, y: 0 } }}
            whileHover={{ y: -15, scale: 1.02 }}
            className="relative p-10 rounded-[3.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-2xl shadow-[0_30px_70px_rgba(139,92,246,0.12)] group"
          >
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 blur-[80px] rounded-full"></div>
            <div className="flex gap-6 items-start">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 p-[3px] shrink-0">
                <div className="w-full h-full rounded-full bg-[#050505] overflow-hidden">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Vibe" alt="pfp" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <span className="font-bold text-white text-lg">VibeCoder_OPN</span>
                  <span className="text-xs text-slate-500 font-mono">24m ago</span>
                </div>
                <p className="text-slate-300 text-xl font-light leading-relaxed">
                  Layout synced. All cards are now floating in the correct orbit. <span className="text-purple-400">#NexusUI</span> is ready for launch.
                </p>
              </div>
            </div>
          </motion.div>

          {/* 3. NFT CARD (GOLD) */}
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 50 }, show: { opacity: 1, y: 0 } }}
            whileHover={{ y: -15 }}
            className="relative p-6 rounded-[4rem] bg-white/[0.04] border border-white/10 shadow-[0_40px_80px_rgba(245,158,11,0.1)] group"
          >
            <div className="aspect-[16/10] w-full rounded-[3rem] bg-slate-900 mb-6 overflow-hidden relative">
              <img src="https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3s]" alt="nft" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8">
                 <p className="text-amber-400 font-mono text-xs mb-1">AUCTION LIVE</p>
                 <h3 className="text-3xl font-black text-white italic">NEURAL_STATION #02</h3>
              </div>
            </div>
            <div className="flex justify-between items-center px-4 pb-4">
              <p className="text-2xl font-black text-white">1,200 OPN</p>
              <button className="px-10 py-4 bg-white text-black font-black rounded-2xl hover:bg-amber-400 transition-all">PLACE BID</button>
            </div>
          </motion.div>

          {/* 4. GOVERNANCE CARD (RED) */}
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 50 }, show: { opacity: 1, y: 0 } }}
            whileHover={{ y: -15 }}
            className="relative p-10 rounded-[3.5rem] bg-gradient-to-br from-red-500/5 to-transparent border border-red-500/20 shadow-[0_30px_70px_rgba(239,68,68,0.1)]"
          >
            <div className="flex justify-between items-center mb-6">
              <span className="px-4 py-1 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/30 tracking-[0.2em]">VOTING ACTIVE</span>
              <span className="text-slate-500 text-xs font-mono italic">OIP-77</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-6 leading-tight">Implement Auto-Burn Fee for OPN Network</h3>
            <div className="flex gap-3">
              <button className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-green-500/20 hover:border-green-500/50 transition-all text-green-400">YES</button>
              <button className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-red-500/20 hover:border-red-500/50 transition-all text-red-400">NO</button>
            </div>
          </motion.div>

          {/* 5. COMMUNITY UPDATE CARD (BLUE) */}
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 50 }, show: { opacity: 1, y: 0 } }}
            whileHover={{ y: -15 }}
            className="relative p-10 rounded-[3.5rem] bg-white/[0.02] border border-white/5 shadow-[0_30px_70px_rgba(59,130,246,0.1)]"
          >
            <div className="flex items-center gap-4 mb-6 text-blue-400">
              <div className="w-10 h-1 text-blue-500 bg-blue-500 rounded-full"></div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-400">Node Update</p>
            </div>
            <p className="text-slate-300 text-lg leading-relaxed mb-4">
              OPN Mainnet just hit <span className="text-white font-bold">1 Million Transactions</span> per second. We are making new history in the Web3 world!
            </p>
            <div className="flex -space-x-3 mt-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-4 border-[#050505] bg-slate-800"></div>
              ))}
              <div className="flex items-center pl-6 text-xs text-slate-500 font-bold italic">+ 12k Nodes Online</div>
            </div>
          </motion.div>

          <div className="h-20"></div> {/* Bottom Spacer */}
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
