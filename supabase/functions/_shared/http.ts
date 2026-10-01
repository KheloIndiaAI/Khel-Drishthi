// Shared HTTP helpers for Khel Drishti edge functions: CORS + JSON responses.
//
// CORS is restricted to the portal's own origins. Extra origins (e.g. a custom
// domain) can be added without a code change via the ALLOWED_ORIGINS secret
// (comma-separated, exact origins).
//
// Note: CORS is a browser-side guard only. Every function still authenticates
// the caller's JWT and checks the admin role in code (see ./auth.ts).

const LOVABLE_PROJECT_ID = "9524e9e4-8c68-445b-8614-88550a1898cf";

const STATIC_ORIGINS = new Set<string>([
  "https://kheldrishti2.lovable.app",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
]);

// Lovable preview hosts for THIS project only.
const PREVIEW_ORIGIN = new RegExp(
  `^https://(?:id-preview(?:-[a-z0-9]+)?--)?${LOVABLE_PROJECT_ID}(?:-dev)?\\.(?:lovable\\.app|lovableproject\\.com)$`,
  "i",
);

function extraOrigins(): Set<string> {
  const raw = Deno.env.get("ALLOWED_ORIGINS") ?? "";
  return new Set(raw.split(",").map((o) => o.trim()).filter(Boolean));
}

export function isAllowedOrigin(origin: string | null): origin is string {
  if (!origin) return false;
  return STATIC_ORIGINS.has(origin) || PREVIEW_ORIGIN.test(origin) || extraOrigins().has(origin);
}

export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin");
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
  if (isAllowedOrigin(origin)) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

/** Handles the preflight and rejects disallowed browser origins. Returns null to continue. */
export function preflight(req: Request): Response | null {
  const origin = req.headers.get("Origin");
  // Requests without an Origin header are server-to-server (curl, cron); auth still applies.
  if (origin && !isAllowedOrigin(origin)) {
    return new Response(JSON.stringify({ success: false, error: "Origin not allowed" }), {
      status: 403,
      headers: { "Content-Type": "application/json", "Vary": "Origin" },
    });
  }
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(req) });
  if (req.method !== "POST") return json(req, { success: false, error: "Method not allowed" }, 405);
  return null;
}

export function json(req: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json" },
  });
}
