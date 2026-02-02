import { NextRequest, NextResponse } from 'next/server';

const requestCounts = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 30 * 1000; // 30 seconds
const RATE_LIMIT_COUNT = 10;

export function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  
  const now = Date.now();
  const timestamps = requestCounts.get(ip) ?? [];
  
  const recentTimestamps = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW);

  if (recentTimestamps.length >= RATE_LIMIT_COUNT) {
    return new Response('too many vibrations. slow down.', { status: 429 });
  }

  recentTimestamps.push(now);
  requestCounts.set(ip, recentTimestamps);

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
