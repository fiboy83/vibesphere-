import { NextResponse } from 'next/server';
import { addLike, removeLike } from '@/services/neon-bridge';

export async function POST(request) {
  try {
    const { postId, pharos_address } = await request.json();
    if (!postId || !pharos_address) {
      return NextResponse.json({ error: 'postId and pharos_address are required' }, { status: 400 });
    }
    await addLike(postId, pharos_address);
    return NextResponse.json({ message: 'Like added' });
  } catch (error) {
    console.error('[API /api/interactions/like ERROR]:', error);
    return NextResponse.json({ error: 'Failed to add like', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
    try {
        const { postId, pharos_address } = await request.json();
        if (!postId || !pharos_address) {
          return NextResponse.json({ error: 'postId and pharos_address are required' }, { status: 400 });
        }
        await removeLike(postId, pharos_address);
        return NextResponse.json({ message: 'Like removed' });
    } catch (error) {
        console.error('[API /api/interactions/like DELETE ERROR]:', error);
        return NextResponse.json({ error: 'Failed to remove like', details: error.message }, { status: 500 });
    }
}
