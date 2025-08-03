import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  //   return NextResponse.redirect(new URL("/home", request.url));
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  if (
    (token && url.pathname.startsWith("signin")) ||
    url.pathname.startsWith("signup")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If not authenticated, redirect to /home
  if (!token && url.pathname === "/") {
    return NextResponse.redirect(new URL("/", request.url));
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/", "/signin", "/signup", "/dashboard/:path*", "/verify/:path*"],
};
