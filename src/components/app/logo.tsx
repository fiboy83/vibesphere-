import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center w-12 h-12 text-xl bg-primary rounded-lg text-primary-foreground font-bold', className)}>
      FC
    </div>
  );
}
