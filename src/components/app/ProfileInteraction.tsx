'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { VibeAction } from './VibeAction';
import { cn } from '@/lib/utils';

interface ProfileInteractionProps {
  isVibing: boolean;
  onVibe: () => void;
  onUnvibe: () => void;
  onDm: () => void;
  themeColor: string;
}

export const ProfileInteraction: React.FC<ProfileInteractionProps> = ({
  isVibing,
  onVibe,
  onUnvibe,
  onDm,
  themeColor,
}) => {
  const cardBaseStyle = "relative backdrop-blur-xl rounded-3xl transition-all duration-300 bg-white/[0.03] border border-white/10 p-1";
  const buttonBaseStyle = "flex items-center justify-center gap-2 w-full py-2 px-5 rounded-2xl text-sm font-mono lowercase tracking-widest transition-all duration-300 ease-in-out";

  return (
    <div 
      className="mt-8 flex items-center justify-center gap-2"
      style={{'--profile-color': themeColor} as React.CSSProperties}
    >
      <VibeAction
        isVibing={isVibing}
        onVibe={onVibe}
        onUnvibe={onUnvibe}
        themeColor={themeColor}
      />
      <div className={cn(cardBaseStyle)}>
        <motion.button
          onClick={onDm}
          className={cn(buttonBaseStyle, "text-[hsl(var(--profile-color))] bg-[hsla(var(--profile-color),0.1)] hover:bg-[hsla(var(--profile-color),0.2)] hover:shadow-[0_0_15px_0px_hsla(var(--profile-color),0.4)]")}
          whileTap={{ scale: 0.95 }}
        >
          <MessageSquare size={14} />
          <span className="w-12 text-center">dm</span>
        </motion.button>
      </div>
    </div>
  );
};
