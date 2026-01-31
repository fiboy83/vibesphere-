import { cn } from '@/lib/utils';
import { Waves } from 'lucide-react';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center w-12 h-12 text-2xl bg-primary/10 border border-primary/20 rounded-lg text-primary font-bold shadow-[0_0_15px_-2px_rgba(var(--primary-glow),0.4)]', className)}>
      <Waves />
    </div>
  );
}
