import { NextResponse } from 'next/server';
import { getLayout, updateLayout } from '@/services/neon-bridge';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const pharos_address = searchParams.get('pharos_address');

  if (!pharos_address) {
    return NextResponse.json({ error: 'pharos_address is required' }, { status: 400 });
  }

  try {
    const layout = await getLayout(pharos_address);
    if (layout) {
      return NextResponse.json(layout);
    } else {
      return NextResponse.json({ error: 'Layout not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch layout' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { pharos_address, metadata } = await request.json();

    if (!pharos_address || !metadata) {
      return NextResponse.json({ error: 'pharos_address and metadata are required' }, { status: 400 });
    }

    await updateLayout(pharos_address, metadata);
    return NextResponse.json({ message: 'Layout updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update layout' }, { status: 500 });
  }
}
