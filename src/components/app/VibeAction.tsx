'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface VibeActionProps {
  isVibing: boolean;
  onVibe: () => void;
  onUnvibe: () => void;
  className?: string;
  themeColor?: string;
}

export const VibeAction: React.FC<VibeActionProps> = ({ isVibing: initialIsVibing, onVibe, onUnvibe, className, themeColor = '259 94% 71%' }) => {
  const [isVibing, setIsVibing] = useState(initialIsVibing);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setIsVibing(initialIsVibing);
  }, [initialIsVibing]);

  const cardBaseStyle = "relative backdrop-blur-xl rounded-3xl transition-all duration-300 bg-white/[0.03] border border-white/10 p-1";
  const buttonBaseStyle = "flex items-center justify-center gap-2 w-full py-2 px-5 rounded-2xl text-sm font-mono lowercase tracking-widest transition-all duration-300 ease-in-out";

  return (
    <div 
        className={cn(cardBaseStyle, className)} 
        style={{'--profile-color': themeColor} as React.CSSProperties}
    >
      {isVibing ? (
        <motion.button
          onClick={onUnvibe}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          className={cn(buttonBaseStyle, "bg-transparent text-slate-300 hover:bg-red-900/30 hover:text-red-400")}
          whileTap={{ scale: 0.95 }}
        >
          <motion.span 
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-all",
              isHovered ? "bg-red-400 shadow-[0_0_6px_1px_rgba(248,113,113,0.7)]" : "bg-slate-500"
            )}
            layoutId="vibe-dot"
          ></motion.span>
          <span className="relative w-16 text-center">
            <AnimatePresence mode="wait">
              <motion.span
                key={isHovered ? 'unvibe' : 'vibing'}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="block"
              >
                {isHovered ? 'unvibe' : 'vibing'}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.button>
      ) : (
        <motion.button
          onClick={onVibe}
          className={cn(buttonBaseStyle, "text-[hsl(var(--profile-color))] bg-[hsla(var(--profile-color),0.1)] hover:bg-[hsla(var(--profile-color),0.2)] hover:shadow-[0_0_15px_0px_hsla(var(--profile-color),0.4)]")}
           whileTap={{ scale: 0.95 }}
        >
          <motion.span 
            className="w-1.5 h-1.5 rounded-full"
            style={{ 
                backgroundColor: `hsl(var(--profile-color))`,
                boxShadow: `0 0 6px 1px hsla(var(--profile-color), 0.7)`
            }}
            layoutId="vibe-dot"
          ></motion.span>
          <span className="w-16 text-center">vibe</span>
        </motion.button>
      )}
    </div>
  );
};
