import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register');
  const isAppPage = request.nextUrl.pathname === '/' || request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/contacts') || request.nextUrl.pathname.startsWith('/lists') || request.nextUrl.pathname.startsWith('/templates') || request.nextUrl.pathname.startsWith('/campaigns') || request.nextUrl.pathname.startsWith('/monitoring');

  if (!token && isAppPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
