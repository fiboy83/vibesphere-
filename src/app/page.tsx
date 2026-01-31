import { Sidebar } from '@/components/app/sidebar';
import { Header } from '@/components/app/header';
import { CastComposer } from '@/components/app/cast-composer';
import { CastFeed } from '@/components/app/cast-feed';

export default function Home() {
  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <main className="flex-1 max-w-2xl">
        <Header />
        <CastComposer />
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent my-0" />
        <CastFeed />
      </main>
      <div className="hidden xl:block w-96"></div>
    </div>
  );
}
