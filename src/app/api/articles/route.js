import { NextResponse } from 'next/server';
import { getArticles, saveArticle } from '@/services/neon-bridge';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  console.log('[API /api/articles GET]: Received request.');
  const { searchParams } = new URL(request.url);
  const pharos_address = searchParams.get('pharos_address');
  try {
    const articles = await getArticles(pharos_address);
    console.log(`[API /api/articles GET]: Found ${articles.length} articles.`);
    return NextResponse.json(articles);
  } catch (error) {
    console.error('[API /api/articles GET ERROR]: Failed to fetch articles from Neon.', {
        errorMessage: error.message,
        errorStack: error.stack,
        fullError: error,
    });
    return NextResponse.json({ error: 'Failed to fetch articles', details: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { author_address, title, content_hash } = await request.json();

    if (!author_address || !title || !content_hash) {
      return NextResponse.json({ error: 'author_address, title, and content_hash are required' }, { status: 400 });
    }

    await saveArticle(author_address, title, content_hash);
    return NextResponse.json({ message: 'Article saved successfully' });
  } catch (error) {
    console.error('[API /api/articles ERROR]: Failed to save article to Neon.', {
        errorMessage: error.message,
        errorStack: error.stack,
        fullError: error,
    });
    return NextResponse.json({ error: 'Failed to save article to Neon', details: error.message }, { status: 500 });
  }
}
