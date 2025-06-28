import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const response = NextResponse.next();
    
    const protectedPaths = [
      "/write",
      "/category/.*",  
      "/profile",
      "/timeline/.*", 
    ];

    const isProtectedRoute = protectedPaths.some(path => {
      const pattern = new RegExp(`^${path.replace('*', '.*')}$`);
      return pattern.test(req.nextUrl.pathname);
    });

    if (isProtectedRoute) {
      response.headers.set('Cache-Control', 'no-store, max-age=0');
      response.headers.set('Pragma', 'no-cache');
    }

    return response;
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