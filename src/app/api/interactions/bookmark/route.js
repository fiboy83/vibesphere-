import { NextResponse } from 'next/server';
import { addBookmark, removeBookmark } from '@/services/neon-bridge';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { postId, pharos_address } = await request.json();
    if (!postId || !pharos_address) {
      return NextResponse.json({ error: 'postId and pharos_address are required' }, { status: 400 });
    }
    await addBookmark(postId, pharos_address);
    return NextResponse.json({ message: 'Bookmark added' });
  } catch (error) {
    console.error('[API /api/interactions/bookmark ERROR]:', error);
    return NextResponse.json({ error: 'Failed to add bookmark', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
    try {
        const { postId, pharos_address } = await request.json();
        if (!postId || !pharos_address) {
          return NextResponse.json({ error: 'postId and pharos_address are required' }, { status: 400 });
        }
        await removeBookmark(postId, pharos_address);
        return NextResponse.json({ message: 'Bookmark removed' });
    } catch (error) {
        console.error('[API /api/interactions/bookmark DELETE ERROR]:', error);
        return NextResponse.json({ error: 'Failed to remove bookmark', details: error.message }, { status: 500 });
    }
}
