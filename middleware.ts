import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const protectedRoutes = [
      '/write',
      '/profile',
      /^\/category\/.+$/,  
      /^\/timeline\/.+$/,
    ];

    const isProtectedRoute = protectedRoutes.some(route => {
      if (typeof route === 'string') {
        return req.nextUrl.pathname === route;
      }
      return route.test(req.nextUrl.pathname);
    });

    if (!isProtectedRoute) {
      return NextResponse.next();
    }

    const res = NextResponse.next();
    res.headers.set('Cache-Control', 'no-store, max-age=0');
    res.headers.set('Pragma', 'no-cache');

    if ([307, 308].includes(res.status)) {
      const redirectRes = NextResponse.redirect(res.headers.get('Location')!);
      redirectRes.headers.set('Cache-Control', 'no-store, max-age=0');
      return redirectRes;
    }

    return res;
  },
  {
    pages: {
      signIn: '/login',
    },
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/write",
    "/category/:path*",
    "/profile",
    "/timeline/:path*",
  ],
};