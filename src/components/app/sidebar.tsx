import Link from 'next/link';
import { Home, Wallet, CandlestickChart, Feather, Bot } from 'lucide-react';
import { Logo } from '@/components/app/logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { currentUser } from '@/lib/data';

const navItems = [
  { href: '/', icon: Home, label: 'Social', active: true },
  { href: '#', icon: Wallet, label: 'Wallet', active: false },
  { href: '#', icon: CandlestickChart, label: 'Market', active: false },
];

export function Sidebar() {
  return (
    <aside className="w-20 lg:w-64 p-4 sticky top-0 h-screen flex flex-col items-center lg:items-start bg-white/5 backdrop-blur-3xl">
      <div className="mb-10 ml-0 lg:ml-2">
        <Logo />
      </div>
      <nav className="space-y-3 w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex items-center gap-4 p-3 rounded-lg hover:bg-primary/10 hover:text-white transition-all duration-300',
                'lg:justify-start justify-center',
                item.active ? 'text-white font-bold bg-primary/10 shadow-[0_0_20px_-5px_rgba(var(--primary-glow),0.5)]' : 'text-muted-foreground'
              )}
            >
              <Icon className="h-6 w-6 shrink-0" />
              <span className="hidden lg:block font-medium text-lg">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-auto flex flex-col items-center lg:items-stretch w-full">
        <Button className="mt-auto w-full hidden lg:flex rounded-full font-bold gap-2" size="lg">
            <Feather size={20}/>
            Cast
        </Button>
        <Button className="mt-auto w-12 h-12 lg:hidden rounded-full font-bold" size="icon">
            <Feather />
            <span className="sr-only">Cast</span>
        </Button>

        <div className="mt-6 flex flex-col items-center lg:flex-row gap-3 p-2 rounded-lg hover:bg-white/5">
            <Avatar className="w-10 h-10">
                {currentUser.avatar &&
                    <AvatarImage src={currentUser.avatar.imageUrl} alt={currentUser.avatar.description} data-ai-hint={currentUser.avatar.imageHint} />
                }
                <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="hidden lg:block">
                <p className="font-semibold text-sm text-white">VibeCoder.eth</p>
                <p className="text-xs text-muted-foreground">@vibecoder</p>
            </div>
        </div>
      </div>
    </aside>
  );
}
