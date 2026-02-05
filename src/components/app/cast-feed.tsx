import { mockCasts } from '@/lib/data';
import { CastItem } from './cast-item';

export function CastFeed() {
  return (
    <div>
      {mockCasts.map((cast) => (
        <CastItem key={cast.id} cast={cast} />
      ))}
    </div>
  );
}
