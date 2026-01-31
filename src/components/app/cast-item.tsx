import Link from 'next/link';
import { MessageCircle, Repeat, Heart, Link2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { type Cast } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

export function CastItem({ cast }: { cast: Cast }) {
  const actions = [
    { icon: MessageCircle, value: cast.stats.comments, hoverColor: 'hover:text-blue-500' },
    { icon: Repeat, value: cast.stats.recasts, hoverColor: 'hover:text-green-500' },
    { icon: Heart, value: cast.stats.likes, hoverColor: 'hover:text-red-500' },
    { icon: Link2, value: null, hoverColor: 'hover:text-primary' },
  ];

  return (
    <article className="p-4 border-b border-border/50 hover:bg-secondary/50 cursor-pointer transition-colors bg-card">
      <div className="flex gap-3">
        <div className="shrink-0">
          {cast.id === 1 ? (
              <div className="w-11 h-11 bg-gradient-to-tr from-purple-400 to-blue-400 rounded-full"></div>
          ) : (
            <Avatar className="w-11 h-11">
              {cast.user.avatar &&
                <AvatarImage src={cast.user.avatar.imageUrl} alt={cast.user.avatar.description} data-ai-hint={cast.user.avatar.imageHint} />
              }
              <AvatarFallback>{cast.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          )}
        </div>
        <div className="flex-1">
          <div className="flex gap-2 items-center text-sm">
            <Link href="#" className="font-bold hover:underline">{cast.user.name}</Link>
            <span className="text-muted-foreground">{cast.user.handle} · {cast.timestamp}</span>
          </div>
          <p className="mt-1 text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {cast.content}
          </p>
          <div className="flex justify-between mt-4 text-muted-foreground max-w-xs text-sm -ml-2">
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button key={index} variant="ghost" size="sm" className={cn("flex items-center gap-1.5 rounded-full", action.hoverColor)}>
                  <Icon className="h-4 w-4" />
                  {action.value !== null && <span>{action.value}</span>}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </article>
  );
}
