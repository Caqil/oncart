import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DatabaseUtils } from '@/lib/db';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes that don't need setup check
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/setup') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  try {
    // Check if setup is completed
    const isSetupComplete = await DatabaseUtils.isSetupComplete();

    // If setup is not complete and user is not on setup page
    if (!isSetupComplete && !pathname.startsWith('/setup')) {
      return NextResponse.redirect(new URL('/setup', request.url));
    }

    // If setup is complete and user is on setup page
    if (isSetupComplete && pathname.startsWith('/setup')) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    // If database connection fails, redirect to setup
    if (!pathname.startsWith('/setup')) {
      return NextResponse.redirect(new URL('/setup', request.url));
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/setup (setup API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/setup|_next/static|_next/image|favicon.ico).*)',
  ],
};