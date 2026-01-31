import { Sidebar } from '@/components/app/sidebar';
import { Header } from '@/components/app/header';
import { CastComposer } from '@/components/app/cast-composer';
import { CastFeed } from '@/components/app/cast-feed';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 max-w-2xl border-x border-border/50">
        <Header />
        <CastComposer />
        <Separator className="bg-border/50" />
        <CastFeed />
      </main>
    </div>
  );
}
