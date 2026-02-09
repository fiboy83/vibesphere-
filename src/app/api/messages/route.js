import { NextResponse } from 'next/server';
import { getMessages, saveMessage } from '@/services/neon-bridge';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const address1 = searchParams.get('address1');
  const address2 = searchParams.get('address2');

  if (!address1 || !address2) {
    return NextResponse.json({ error: 'Both addresses are required' }, { status: 400 });
  }

  try {
    const messages = await getMessages(address1, address2);
    return NextResponse.json(messages);
  } catch (error) {
    console.error('[API /api/messages GET ERROR]:', error);
    return NextResponse.json({ error: 'Failed to fetch messages', details: error.message }, { status: 500 });
  }
}


export async function POST(request) {
  try {
    const { sender_address, receiver_address, content } = await request.json();
    if (!sender_address || !receiver_address || !content) {
      return NextResponse.json({ error: 'sender_address, receiver_address, and content are required' }, { status: 400 });
    }
    const newMessage = await saveMessage(sender_address, receiver_address, content);
    return NextResponse.json(newMessage);
  } catch (error) {
    console.error('[API /api/messages POST ERROR]:', error);
    return NextResponse.json({ error: 'Failed to save message', details: error.message }, { status: 500 });
  }
}
