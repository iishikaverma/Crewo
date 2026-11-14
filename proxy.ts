import { auth } from "@/auth";

// ponytail: Next 16 renamed middleware -> proxy (Node.js runtime by default).
// Protect everything except sign-in, auth API, and static assets.
export default auth((req) => {
  const { pathname } = req.nextUrl;
  // /api/* handle their own auth (so fetches get JSON, not a redirect)
  const isPublic = pathname === "/signin" || pathname.startsWith("/api");
  if (!req.auth && !isPublic) {
    return Response.redirect(new URL("/signin", req.nextUrl));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
