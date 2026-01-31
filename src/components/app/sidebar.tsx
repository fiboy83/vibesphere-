import Link from 'next/link';
import { Home, Bell, User, Feather } from 'lucide-react';
import { Logo } from '@/components/app/logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Home, label: 'Home', active: true },
  { href: '#', icon: Bell, label: 'Notifications', active: false },
  { href: '#', icon: User, label: 'Profile', active: false },
];

export function Sidebar() {
  return (
    <aside className="w-20 lg:w-64 border-r border-border/50 flex flex-col items-center lg:items-start p-4 sticky top-0 h-screen bg-card">
      <div className="mb-8">
        <Logo />
      </div>
      <nav className="space-y-4 w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex items-center gap-4 p-3 rounded-xl hover:bg-secondary transition-colors',
                'lg:justify-start justify-center',
                item.active ? 'text-foreground font-bold' : 'text-muted-foreground'
              )}
            >
              <Icon className="h-6 w-6 shrink-0" />
              <span className="hidden lg:block font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <Button className="mt-auto w-full hidden lg:block rounded-full font-bold" size="lg">Cast</Button>
      <Button className="mt-auto w-12 h-12 lg:hidden rounded-full font-bold" size="icon">
        <Feather />
        <span className="sr-only">Cast</span>
      </Button>
    </aside>
  );
}
