import { NextResponse } from 'next/server';
import { addComment } from '@/services/neon-bridge';

export async function POST(request) {
  try {
    const { postId, pharos_address, content } = await request.json();
    if (!postId || !pharos_address || !content) {
      return NextResponse.json({ error: 'postId, pharos_address, and content are required' }, { status: 400 });
    }
    const newComment = await addComment(postId, pharos_address, content);
    return NextResponse.json(newComment);
  } catch (error) {
    console.error('[API /api/interactions/comment ERROR]:', error);
    return NextResponse.json({ error: 'Failed to add comment', details: error.message }, { status: 500 });
  }
}
