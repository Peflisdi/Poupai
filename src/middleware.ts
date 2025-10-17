import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/login",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/transactions/:path*",
    "/cards/:path*",
    "/goals/:path*",
    "/categories/:path*",
    "/reports/:path*",
    "/settings/:path*",
  ],
};
