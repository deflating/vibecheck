import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

/** Security headers applied to all responses */
const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "X-DNS-Prefetch-Control": "off",
};

/** Rate limit configs by route pattern */
const RATE_LIMITS: { pattern: RegExp; max: number; windowMs: number }[] = [
  // Auth endpoints — stricter
  { pattern: /^\/api\/auth/, max: 20, windowMs: 60_000 },
  // File uploads — moderate
  { pattern: /^\/api\/attachments$/, max: 10, windowMs: 60_000 },
  // Messages — moderate
  { pattern: /^\/api\/requests\/\d+\/messages$/, max: 30, windowMs: 60_000 },
  // General API — generous
  { pattern: /^\/api\//, max: 60, windowMs: 60_000 },
];

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rate limiting for API routes
  if (pathname.startsWith("/api/")) {
    const ip = getClientIp(req);

    for (const { pattern, max, windowMs } of RATE_LIMITS) {
      if (pattern.test(pathname)) {
        const result = checkRateLimit(`${ip}:${pathname}`, max, windowMs);
        if (result.limited) {
          return new NextResponse(
            JSON.stringify({ error: "Too many requests" }),
            {
              status: 429,
              headers: {
                "Content-Type": "application/json",
                "Retry-After": String(result.retryAfter || 60),
                ...SECURITY_HEADERS,
              },
            }
          );
        }
        break; // Only apply first matching rule
      }
    }
  }

  const response = NextResponse.next();

  // Apply security headers to all responses
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  // CSP — allow self, Google Fonts, GitHub avatars, inline styles (Tailwind needs this)
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' https://avatars.githubusercontent.com data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
  );

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
