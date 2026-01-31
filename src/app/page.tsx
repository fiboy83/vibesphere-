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

      <main className="w-full max-w-4xl mx-auto pb-32 pt-4 px-4">
        <motion.div 
          animate={{ filter: isSearchOpen ? 'blur(10px)' : 'blur(0px)', opacity: isSearchOpen ? 0.5 : 1 }}
          className="flex flex-col gap-6"
        >
          {/* 1. Postingan Tipe Market Update (Real-time Feel) */}
          <div className="p-6 rounded-[2.5rem] bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 backdrop-blur-sm group hover:border-cyan-500/50 transition-all duration-500">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                  OPN
                </div>
                <div>
                  <h4 className="font-bold text-white group-hover:text-cyan-400 transition">OPN Market Tracker</h4>
                  <p className="text-xs text-slate-500 text-mono">@market_alpha • 2m ago</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold border border-green-500/20 uppercase tracking-widest">Bullish</span>
            </div>
            <p className="text-slate-300 leading-relaxed mb-4">
              $OPN baru saja menembus resistance di <span className="text-cyan-400 font-mono">$4.20</span>. Volume perdagangan di jaringan naik 300% dalam 1 jam terakhir. Siap-siap terbang! 🚀
            </p>
            <div className="h-32 w-full bg-white/5 rounded-2xl border border-white/5 flex items-end p-2 gap-1">
              {/* Simulasi Mini Chart */}
              {[40, 70, 45, 90, 65, 80, 95, 100].map((h, i) => (
                <motion.div 
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  className="flex-1 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-sm"
                />
              ))}
            </div>
          </div>

          {/* 2. Postingan Tipe Sosial (User Cast) */}
          <div className="p-6 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
            <div className="flex gap-4">
              <div className="shrink-0">
                <div className="w-12 h-12 rounded-full bg-[url('https://api.dicebear.com/7.x/avataaars/svg?seed=Felix')] bg-cover border border-white/10"></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-slate-200">Alex_Nexus</span>
                  <span className="text-slate-500 text-sm">@alex88 • 1h</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Membangun di atas OPN Network bener-bener gampang banget. Gas fee-nya hampir nol, dan kecepatannya gila. Vibe coding di tahun 3000 emang beda! 🔥
                </p>
                <div className="flex gap-6 mt-4 text-slate-500">
                  <button className="flex items-center gap-2 hover:text-cyan-400 transition"><span className="text-lg">💬</span> 24</button>
                  <button className="flex items-center gap-2 hover:text-purple-400 transition"><span className="text-lg">🔁</span> 12</button>
                  <button className="flex items-center gap-2 hover:text-red-400 transition"><span className="text-lg">❤️</span> 150</button>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Postingan Tipe NFT Showcase */}
          <div className="p-6 rounded-[2.5rem] bg-white/[0.03] border border-white/5 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4">
              <div className="px-3 py-1 bg-purple-600 text-white text-[10px] font-bold rounded-lg shadow-lg">NEW MINT</div>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-yellow-500"></div>
              <div>
                <p className="font-bold text-sm text-white">Cyber_Art_Collector</p>
                <p className="text-[10px] text-slate-500">0x71C...3a21</p>
              </div>
            </div>
            <div className="aspect-square w-full rounded-3xl bg-gradient-to-tr from-purple-900/40 to-cyan-900/40 border border-white/10 flex items-center justify-center mb-4 relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center group-hover:scale-110 transition-transform duration-700"></div>
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
              <p className="relative z-10 font-black text-4xl italic opacity-50 group-hover:opacity-100 transition-opacity">NEURAL #01</p>
            </div>
            <div className="flex justify-between items-center px-2">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-tighter">Current Bid</p>
                <p className="text-lg font-black text-white">1,250 OPN</p>
              </div>
              <button className="px-6 py-2 bg-white text-black font-bold rounded-2xl hover:bg-cyan-400 transition">Bid Now</button>
            </div>
          </div>

          {/* 4. Simple Text Cast */}
          <div className="p-6 rounded-[2.5rem] bg-white/[0.02] border border-white/5">
            <p className="text-xl font-medium text-slate-300 italic italic leading-snug text-center py-4">
              "The best way to predict the future is to code it." 
              <br/>
              <span className="text-sm text-cyan-500 not-italic mt-2 block font-mono">— OPN Core Manifesto</span>
            </p>
          </div>

          {/* Space tambahan buat scroll melampaui dock */}
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
