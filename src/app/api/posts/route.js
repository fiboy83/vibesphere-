import { NextResponse } from 'next/server';
import { getFeed, savePost } from '@/services/neon-bridge';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const pharos_address = searchParams.get('pharos_address');
  try {
    // Pass address to get user-specific interaction data
    const feed = await getFeed(pharos_address);
    return NextResponse.json(feed);
  } catch (error) {
    console.error('[API /api/posts GET ERROR]: Failed to fetch feed from Neon.', {
        errorMessage: error.message,
        errorStack: error.stack,
        fullError: error,
    });
    return NextResponse.json({ error: 'Failed to fetch feed', details: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { pharos_address, content, tx_hash } = await request.json();

    if (!pharos_address || !content) {
      return NextResponse.json({ error: 'pharos_address and content are required' }, { status: 400 });
    }

    await savePost(pharos_address, content, tx_hash);
    return NextResponse.json({ message: 'Post saved successfully' });
  } catch (error) {
    console.error('[API /api/posts ERROR]: Failed to save post to Neon.', {
        errorMessage: error.message,
        errorStack: error.stack,
        fullError: error,
    });
    return NextResponse.json({ error: 'Failed to save post to Neon', details: error.message }, { status: 500 });
  }
}
