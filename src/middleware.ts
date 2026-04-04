import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;

  const isPublicPath = pathname.startsWith('/login');

  if (!token && !isPublicPath) {
    if (pathname.startsWith('/dashboard/teacher')) {
        return NextResponse.redirect(new URL('/login/teacher', request.url));
    } else if (pathname.startsWith('/dashboard/student')) {
        return NextResponse.redirect(new URL('/login/student', request.url));
    }
    return NextResponse.redirect(new URL('/login/admin', request.url));
  }

  if (token && isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login/:path*',
    '/teachers/:path*',
    '/students/:path*',
    '/groups/:path*',
    '/courses/:path*',
    '/rooms/:path*',
    '/profile/:path*',
  ],
};
