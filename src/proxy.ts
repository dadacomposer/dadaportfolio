import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  return NextResponse.rewrite(new URL('/maintenance', request.url));
}

export const config = {
  matcher: [
    // Intercept every frontend route while leaving API endpoints and assets available.
    '/((?!api|_next/static|_next/image|maintenance|.*\\..*).*)',
  ],
};
