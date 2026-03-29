import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Browser clients (Vite, etc.) call this API from another origin; without these headers the response is blocked. */
const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": process.env.AUTH_CORS_ORIGIN ?? "*",
  "Access-Control-Allow-Methods": "GET, POST, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

export function middleware(request: NextRequest) {
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  }

  const response = NextResponse.next();
  for (const [key, value] of Object.entries(corsHeaders)) {
    response.headers.set(key, value);
  }
  return response;
}

export const config = {
  matcher: "/api/auth/:path*",
};
