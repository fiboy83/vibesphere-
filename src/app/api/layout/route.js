import { NextResponse } from 'next/server';
import { getLayout, updateLayout } from '@/services/neon-bridge';

export const dynamic = 'force-dynamic';

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
    const { pharos_address, metadata, extendedBio, websiteString } = await request.json();

    if (!pharos_address) {
      return NextResponse.json({ error: 'pharos_address is required' }, { status: 400 });
    }

    await updateLayout(pharos_address, metadata, extendedBio, websiteString);
    return NextResponse.json({ message: 'Layout updated successfully' });
  } catch (error) {
    console.error("Failed to update layout:", error);
    return NextResponse.json({ error: 'Failed to update layout', details: error.message }, { status: 500 });
  }
}
