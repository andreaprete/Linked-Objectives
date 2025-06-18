import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req });
  const isLoggedIn = !!token;
  const pathname = req.nextUrl.pathname;

  const publicPaths = ["/", "/login", "/register", "/landingpage"];

  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|api).*)"], // Match all pages except API/static
};
