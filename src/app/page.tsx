'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home as HomeIcon, Wallet, BarChart3, Menu, X, Plus, Bell, User } from 'lucide-react';

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('feed');

  return (
    <div className="relative min-h-screen bg-background text-white overflow-hidden">
      
      {/* 1. FUTURISTIC SIDEBAR (OVERLAY) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop Glow */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-purple-900/10 backdrop-blur-md z-[60]"
            />
            
            {/* Sidebar Content */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed top-0 left-0 h-full w-72 bg-black/40 backdrop-blur-3xl border-r border-white/10 z-[70] p-6 shadow-[20px_0_50px_rgba(138,99,210,0.1)]"
            >
              <div className="flex justify-between items-center mb-10">
                <div className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                  OPN NEXUS
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition">
                  <X size={24} />
                </button>
              </div>

              <nav className="space-y-2">
                {['Profile', 'Settings', 'Nodes', 'Governance', 'Soulbound ID'].map((item) => (
                  <div key={item} className="p-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 cursor-pointer transition group">
                    <span className="text-slate-400 group-hover:text-cyan-400 transition">{item}</span>
                  </div>
                ))}
              </nav>

              <div className="absolute bottom-10 left-6 right-6 p-4 rounded-2xl bg-gradient-to-br from-purple-600/20 to-cyan-600/20 border border-white/10">
                <p className="text-xs text-slate-400">Network Status</p>
                <p className="text-sm font-mono text-cyan-400">OPN-MAINNET: ONLINE</p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 2. HEADER (FULL SCREEN FEED CONTROL) */}
      <header className="sticky top-0 w-full p-4 flex justify-between items-center bg-black/20 backdrop-blur-xl z-50 border-b border-white/5">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 border border-white/10 transition"
        >
          <Menu size={24} className="text-cyan-400" />
        </button>
        <div className="font-bold tracking-widest text-sm text-slate-400 uppercase">Global Feed</div>
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-blue-500 p-[1px]">
            <div className="w-full h-full rounded-2xl bg-background flex items-center justify-center">
              <User size={20} />
            </div>
          </div>
        </div>
      </header>

      {/* 3. MAIN FEED (FULL SCREEN VIEW) */}
      <main className="w-full max-w-4xl mx-auto pb-32 pt-4 px-4">
        {/* Your feed content here */}
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ type: 'spring' }}
            key={i}
            className="mb-6 p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:border-purple-500/30 transition-all duration-500 group"
          >
            <div className="h-40 w-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl mb-4 overflow-hidden relative">
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            </div>
            <h3 className="text-lg font-bold group-hover:text-cyan-400 transition">Neural Cast #{i}</h3>
            <p className="text-slate-400 mt-2">The OPN market is pulsing with high liquidity today. Ready for the year 3000 upgrade? #Web3Future</p>
          </motion.div>
        ))}
      </main>

      {/* 4. BOTTOM FLOATING DOCK (NEW ICON POSITION) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-6">
        <nav className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-2 flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <button className={`p-4 rounded-full transition-all ${activeTab === 'feed' ? 'bg-purple-600 shadow-[0_0_20px_rgba(138,99,210,0.5)]' : 'hover:bg-white/5'}`} onClick={() => setActiveTab('feed')}>
            <HomeIcon size={24} />
          </button>
          <button className={`p-4 rounded-full transition-all ${activeTab === 'market' ? 'bg-purple-600 shadow-[0_0_20px_rgba(138,99,210,0.5)]' : 'hover:bg-white/5'}`} onClick={() => setActiveTab('market')}>
            <BarChart3 size={24} />
          </button>
          
          {/* Action Button */}
          <button className="bg-white text-black p-4 rounded-full hover:scale-110 transition-transform active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            <Plus size={24} strokeWidth={3} />
          </button>

          <button className={`p-4 rounded-full transition-all ${activeTab === 'wallet' ? 'bg-purple-600 shadow-[0_0_20px_rgba(138,99,210,0.5)]' : 'hover:bg-white/5'}`} onClick={() => setActiveTab('wallet')}>
            <Wallet size={24} />
          </button>
          <button className="p-4 rounded-full hover:bg-white/5 transition-all text-slate-500">
            <Bell size={24} />
          </button>
        </nav>
      </div>

    </div>
  );
}
