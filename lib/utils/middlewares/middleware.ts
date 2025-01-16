// middleware.ts

import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { method, url, headers } = req;
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
  const userAgent = headers.get('user-agent') || '';

  const log = `
    Method: ${method}
    URL: ${url}
    IP Address: ${ip}
    User Agent: ${userAgent}
  `;

  console.log(log); // Log the request details

  // Proceed with the request
  const res = NextResponse.next();
  return res;
}

export const config = {
  matcher: ['/api/*', '/pages/*'],  // Match any API or page routes to apply the middleware
};
