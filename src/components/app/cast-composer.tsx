import { Image as ImageIcon, BarChart3, Coins } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { currentUser } from '@/lib/data';

export function CastComposer() {
  return (
    <div className="p-4 flex gap-4">
      <Avatar className="w-12 h-12">
        {currentUser.avatar &&
            <AvatarImage src={currentUser.avatar.imageUrl} alt={currentUser.avatar.description} data-ai-hint={currentUser.avatar.imageHint} />
        }
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
      <div className="w-full">
        <Textarea
          placeholder="What's happening in the Nexus?"
          className="w-full resize-none border-none focus:ring-0 text-lg py-2 bg-transparent -mx-2"
          rows={2}
        />
        <div className="flex justify-between items-center mt-2">
          <div className="flex gap-1 text-primary">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
                <ImageIcon className="h-5 w-5" />
                <span className="sr-only">Add image</span>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
                <BarChart3 className="h-5 w-5" />
                <span className="sr-only">Add poll</span>
            </Button>
             <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
                <Coins className="h-5 w-5" />
                <span className="sr-only">Tip OPN</span>
            </Button>
          </div>
          <Button className="rounded-full text-sm font-bold px-5 py-2 h-auto bg-primary/90 hover:bg-primary text-primary-foreground shadow-[0_0_15px_0px_rgba(var(--primary-glow),0.5)] hover:shadow-[0_0_25px_0px_rgba(var(--primary-glow),0.8)] transition-all">Cast</Button>
        </div>
      </div>
    </div>
  );
}
