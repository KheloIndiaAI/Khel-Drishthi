// =============================================================================
// Edge Runtime main service (self-hosted only)
// =============================================================================
// Hosted Supabase routes /functions/v1/<name> to each function for you. When
// self-hosting, the edge-runtime container runs this "main" service, which
// starts an isolated worker for supabase/functions/<name>/index.ts per request.
//
// Lives outside supabase/functions on purpose, so Lovable/Supabase never
// deploys it as a public function.
//
// Authentication is NOT done here: every function verifies the caller's JWT
// itself (supabase/functions/_shared/auth.ts), matching verify_jwt = false in
// supabase/config.toml.
// =============================================================================

// deno-lint-ignore no-explicit-any
declare const EdgeRuntime: any;

const FUNCTIONS_DIR = "/home/deno/functions";
// Only plain function folders: blocks "_shared", path traversal and hidden dirs.
const NAME_RE = /^[a-z0-9][a-z0-9-]{0,62}$/;

const WORKER_MEMORY_MB = Number(Deno.env.get("FUNCTION_MEMORY_MB") ?? 256);
const WORKER_TIMEOUT_MS = Number(Deno.env.get("FUNCTION_TIMEOUT_MS") ?? 150_000);

// Only these variables are passed to function workers (least privilege).
const FORWARDED_ENV = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ALLOWED_ORIGINS",
];

function jsonError(status: number, error: string): Response {
  return new Response(JSON.stringify({ success: false, error }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function functionExists(name: string): Promise<boolean> {
  try {
    const info = await Deno.stat(`${FUNCTIONS_DIR}/${name}/index.ts`);
    return info.isFile;
  } catch {
    return false;
  }
}

Deno.serve(async (req: Request) => {
  const { pathname } = new URL(req.url);

  if (pathname === "/_health") return new Response("ok");

  const name = pathname.split("/")[1] ?? "";
  if (!NAME_RE.test(name) || !(await functionExists(name))) {
    return jsonError(404, "Function not found");
  }

  const envVars = FORWARDED_ENV
    .map((key) => [key, Deno.env.get(key)] as const)
    .filter((entry): entry is readonly [string, string] => typeof entry[1] === "string");

  try {
    const worker = await EdgeRuntime.userWorkers.create({
      servicePath: `${FUNCTIONS_DIR}/${name}`,
      memoryLimitMb: WORKER_MEMORY_MB,
      workerTimeoutMs: WORKER_TIMEOUT_MS,
      noModuleCache: false,
      importMapPath: null,
      envVars,
    });
    return await worker.fetch(req);
  } catch (e) {
    console.error(`function "${name}" failed:`, e);
    return jsonError(500, "Function failed to start");
  }
});
