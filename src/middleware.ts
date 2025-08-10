// import { getToken } from "next-auth/jwt";
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// // This function can be marked `async` if using `await` inside
// export async function middleware(request: NextRequest) {
//   //   return NextResponse.redirect(new URL("/home", request.url));
//   const token = await getToken({ req: request });
//   const url = request.nextUrl;

//   if (
//     (token && url.pathname.startsWith("signin")) ||
//     url.pathname.startsWith("signup")
//   ) {
//     return NextResponse.redirect(new URL("/dashboard", request.url));
//   }

//   // If not authenticated, redirect to /home
//   if (!token && url.pathname === "/") {
//     return NextResponse.redirect(new URL("/", request.url));
//   }
// }

// // See "Matching Paths" below to learn more
// export const config = {
//   matcher: ["/", "/signin", "/signup", "/dashboard/:path*", "/verify/:path*"],
// };

// New code injected

import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;
  const { pathname } = url;

  // Redirect signed-in users away from signin/signup
  if (
    token &&
    (pathname.startsWith("/signin") || pathname.startsWith("/signup"))
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protect routes that require authentication
  const protectedPaths = ["/dashboard", "/verify"];
  const isProtectedRoute = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return NextResponse.next(); // Allow the request if nothing above matched
}

// Apply middleware to these routes
export const config = {
  matcher: ["/", "/signin", "/signup", "/dashboard/:path*", "/verify/:path*"],
};
