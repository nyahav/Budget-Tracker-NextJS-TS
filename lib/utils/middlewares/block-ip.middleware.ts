// middleware/block-ip.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const blockedIps = process.env.IPS_TO_BLOCK ? process.env.IPS_TO_BLOCK.split(',') : [];

export function blockIpMiddleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for');

  if (ip && blockedIps.includes(ip)) {
    return NextResponse.json(
      { message: 'Access denied' },
      { status: 403 }
    );
  }

  return NextResponse.next();
}