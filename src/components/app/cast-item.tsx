import Link from 'next/link';
import { MessageCircle, Repeat, Heart, Coins } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { type Cast } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

export function CastItem({ cast }: { cast: Cast }) {
  const actions = [
    { icon: MessageCircle, value: cast.stats.comments, hoverColor: 'hover:text-sky-400' },
    { icon: Repeat, value: cast.stats.recasts, hoverColor: 'hover:text-emerald-400' },
    { icon: Heart, value: cast.stats.likes, hoverColor: 'hover:text-rose-500' },
    { icon: Coins, value: "Tip OPN", hoverColor: 'hover:text-primary' },
  ];

  return (
    <article className="p-4 hover:bg-white/5 transition-colors duration-300 relative group">
       <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10" />
       <div className="absolute -inset-px bg-gradient-to-r from-primary/50 to-purple-600/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg -z-20" />

      <div className="flex gap-4">
        <div className="shrink-0">
            <Avatar className="w-11 h-11 transition-all group-hover:scale-105">
              {cast.user.avatar &&
                <AvatarImage className="rounded-full" src={cast.user.avatar.imageUrl} alt={cast.user.avatar.description} data-ai-hint={cast.user.avatar.imageHint} />
              }
              <AvatarFallback>{cast.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
        </div>
        <div className="flex-1">
          <div className="flex gap-2 items-center text-sm">
            <Link href="#" className="font-bold hover:underline text-gray-100">{cast.user.name}</Link>
            <span className="text-muted-foreground">{cast.user.handle} · {cast.timestamp}</span>
          </div>
          <p className="mt-2 text-gray-300 leading-relaxed whitespace-pre-wrap">
            {cast.content}
          </p>
          <div className="flex justify-between items-center mt-4 text-muted-foreground max-w-sm text-sm -ml-2">
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button key={index} variant="ghost" size="sm" className={cn("flex items-center gap-2 rounded-full", action.hoverColor, "transition-colors")}>
                  <Icon className="h-4 w-4" />
                  {action.value !== null && <span className="text-xs">{action.value}</span>}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </article>
  );
}
