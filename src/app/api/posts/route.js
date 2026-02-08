import { NextResponse } from 'next/server';
import { getFeed, savePost } from '@/services/neon-bridge';

export async function GET(request) {
  try {
    const feed = await getFeed();
    return NextResponse.json(feed);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { pharos_address, content } = await request.json();

    if (!pharos_address || !content) {
      return NextResponse.json({ error: 'pharos_address and content are required' }, { status: 400 });
    }

    await savePost(pharos_address, content);
    return NextResponse.json({ message: 'Post saved successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save post' }, { status: 500 });
  }
}
