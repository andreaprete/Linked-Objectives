import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req });
  const isLoggedIn = !!token;
  const pathname = req.nextUrl.pathname;

  const publicPaths = ["/", "/login", "/register", "/landingpage"];

  // 🧠 Debug logs
  console.log("🧠 Middleware executing for:", pathname);
  console.log("🔐 Logged in:", isLoggedIn);

  if (publicPaths.includes(pathname)) {
    console.log("✅ Public path → allow access");
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    console.log("🚫 Not logged in → redirecting to /login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  console.log("✅ Authenticated user → allow access");
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|api).*)"], // Match all pages except API/static
};
