'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home as HomeIcon, Wallet, BarChart3, Menu, X, Plus, Bell, Search } from 'lucide-react';


const UserHeader = ({ name, handle, time, color }: { name: string; handle: string; time: string; color: string; }) => (
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${color} p-[2px]`}>
        <div className="w-full h-full rounded-full bg-black overflow-hidden flex items-center justify-center">
          <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${handle}`} alt="pfp" />
        </div>
      </div>
      <div>
        <h4 className="text-sm font-bold text-white leading-none">{name}</h4>
        <p className="text-[10px] text-slate-500 font-mono mt-1">@{handle} • {time}</p>
      </div>
    </div>
  );


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
          variants={{ show: { transition: { staggerChildren: 0.15 } } }}
          className="flex flex-col gap-10" // Tighter gap for dynamic feel
        >
          
          {/* 1. SHORT FEED (GM / SHORT POST) */}
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}
            whileHover={{ y: -5 }}
            className="relative p-6 rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.3)] self-start min-w-[300px]"
          >
            <UserHeader name="Zero_G" handle="zerog.opn" time="2m" color="from-cyan-400 to-blue-500" />
            <p className="text-2xl font-black italic bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">
              GM OPN Fam! ☀️
            </p>
          </motion.div>

          {/* 2. MEDIUM FEED (WITH IMAGE) */}
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}
            whileHover={{ y: -5 }}
            className="relative p-6 rounded-[3rem] bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
          >
            <UserHeader name="CryptoArt" handle="art.opn" time="15m" color="from-purple-500 to-pink-500" />
            <p className="text-slate-300 mb-4">Baru saja menyelesaikan render untuk NFT OPN Nexus terbaru. Gimana menurut kalian?</p>
            <div className="aspect-video w-full rounded-2xl bg-slate-900 overflow-hidden border border-white/5">
              <img src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800" className="w-full h-full object-cover" alt="post" />
            </div>
          </motion.div>

          {/* 3. LONG FEED (WITH MAX HEIGHT & SCROLL) */}
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}
            whileHover={{ y: -5 }}
            className="relative p-6 rounded-[3rem] bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
          >
            <UserHeader name="Dev_Protocol" handle="dev.opn" time="1h" color="from-green-400 to-cyan-500" />
            <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              <h3 className="text-xl font-bold text-cyan-400 mb-2 italic">Update Protokol V3.1</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Kami baru saja mengimplementasikan sistem Quantum-Secure pada jaringan OPN. Ini artinya semua transaksi sosial dan finansial kamu terlindungi dari serangan komputer kuantum di masa depan. 
                <br/><br/>
                Beberapa poin penting:
                1. Kecepatan transaksi naik 400%.
                2. Gas fee turun menjadi 0.0000001 OPN.
                3. Integrasi Soulbound Identity lebih dalam.
                <br/><br/>
                DApp ini sekarang adalah node paling stabil di sektor 7 G. Kami mengharapkan semua pengguna untuk segera melakukan sinkronisasi wallet ke versi terbaru guna menghindari glitch di ruang hampa. Tetap waspada, tetap terdesentralisasi.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 text-[10px] text-slate-600 italic">
              Click to read full proposal on-chain...
            </div>
          </motion.div>

          {/* 4. MARKET FEED (AUTO HEIGHT) */}
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}
            whileHover={{ y: -5 }}
            className="relative p-6 rounded-[3rem] bg-gradient-to-br from-cyan-500/5 to-transparent border border-cyan-500/20 shadow-[0_20px_40px_rgba(6,182,212,0.1)]"
          >
            <UserHeader name="OPN Bot" handle="bot.opn" time="Just Now" color="from-slate-700 to-slate-900" />
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest">Live Price</p>
                <p className="text-3xl font-black text-white">$4.95</p>
              </div>
              <div className="h-12 w-32 bg-green-500/10 rounded-lg flex items-center justify-center border border-green-500/20">
                <span className="text-green-400 font-mono font-bold">+18.2%</span>
              </div>
            </div>
          </motion.div>

          {/* 5. REPOST FEED (NESTED STYLE) */}
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}
            whileHover={{ y: -5 }}
            className="relative p-6 rounded-[3rem] bg-white/[0.03] border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
          >
            <UserHeader name="Alpha_Seeker" handle="alpha.opn" time="3h" color="from-orange-400 to-red-500" />
            <p className="text-slate-300 mb-4 font-medium italic">Ini bener banget, OPN Nexus adalah endgame-nya!</p>
            
            {/* Nested Repost Card */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-2 mb-2 scale-90 origin-left">
                <div className="w-6 h-6 rounded-full bg-blue-500"></div>
                <span className="text-xs font-bold">VibeCoder.opn</span>
              </div>
              <p className="text-xs text-slate-500 italic">"Membangun di atas OPN Network bener-bener gampang..."</p>
            </div>
          </motion.div>
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
