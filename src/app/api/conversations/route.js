import { NextResponse } from 'next/server';
import { getConversations } from '@/services/neon-bridge';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const pharos_address = searchParams.get('pharos_address');

  if (!pharos_address) {
    return NextResponse.json({ error: 'pharos_address is required' }, { status: 400 });
  }

  try {
    const conversations = await getConversations(pharos_address);
    return NextResponse.json(conversations);
  } catch (error) {
    console.error('[API /api/conversations GET ERROR]:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations', details: error.message }, { status: 500 });
  }
}
