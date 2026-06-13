import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Only protect /admin routes, but allow the login page itself to be viewed
  if (request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/admin') {
    const session = request.cookies.get('admin_session');
    
    if (!session || session.value !== 'authenticated') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
