import { Image as ImageIcon, BarChart3 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { currentUser } from '@/lib/data';

export function CastComposer() {
  return (
    <div className="p-4 flex gap-4 bg-card">
      <Avatar className="w-12 h-12">
        {currentUser.avatar &&
            <AvatarImage src={currentUser.avatar.imageUrl} alt={currentUser.avatar.description} data-ai-hint={currentUser.avatar.imageHint} />
        }
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
      <div className="w-full">
        <Textarea
          placeholder="What's happening?"
          className="w-full resize-none border-none focus:ring-0 text-lg py-2 bg-transparent -mx-2"
          rows={2}
        />
        <div className="flex justify-between items-center mt-2">
          <div className="flex gap-1 text-primary">
            <Button variant="ghost" size="icon" className="rounded-full">
                <ImageIcon className="h-5 w-5" />
                <span className="sr-only">Add image</span>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
                <BarChart3 className="h-5 w-5" />
                <span className="sr-only">Add poll</span>
            </Button>
          </div>
          <Button className="rounded-full text-sm font-bold px-4 py-1.5 h-auto">Cast</Button>
        </div>
      </div>
    </div>
  );
}
