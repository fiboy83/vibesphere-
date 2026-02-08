import { NextResponse } from 'next/server';
import { getFeed, savePost } from '@/services/neon-bridge';

export async function GET(request) {
  try {
    const feed = await getFeed();
    return NextResponse.json(feed);
  } catch (error) {
    console.error('Failed to fetch feed from Neon:', error);
    return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 });
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
    console.error('Failed to save post to Neon:', error);
    return NextResponse.json({ error: 'Failed to save post' }, { status: 500 });
  }
}
