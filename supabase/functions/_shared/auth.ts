// Shared authentication/authorisation for admin-only edge functions.
//
// Why this exists: the previous code called the `has_role` RPC through the
// service-role client. Under the service role `auth.uid()` is NULL, so
// `has_role` always returned false and every admin got 403. Here the role is
// read straight from `user_roles` with the service-role client (bypasses RLS),
// after the caller's JWT has been verified with `auth.getUser`.
//
// `verify_jwt = false` is kept in supabase/config.toml on purpose: gateway JWT
// verification is the legacy mechanism and is not compatible with Supabase's
// newer asymmetric signing keys. Verification happens here instead, on every
// request, before any work is done.
import { createClient, type SupabaseClient, type User } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { json } from "./http.ts";

export function serviceClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Server misconfigured: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export type AdminContext = { admin: SupabaseClient; user: User };

/** Resolves to the caller + a service client, or to an error Response (401/403/500). */
export async function requireAdmin(req: Request): Promise<AdminContext | Response> {
  const authHeader = req.headers.get("Authorization") ?? "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return json(req, { success: false, error: "Unauthorized: missing bearer token" }, 401);

  let admin: SupabaseClient;
  try {
    admin = serviceClient();
  } catch (e) {
    console.error(e);
    return json(req, { success: false, error: "Server misconfigured" }, 500);
  }

  const { data: { user }, error: authError } = await admin.auth.getUser(match[1]);
  if (authError || !user) return json(req, { success: false, error: "Unauthorized: invalid or expired token" }, 401);

  const { data: role, error: roleError } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (roleError) {
    console.error("Role lookup failed:", roleError.message);
    return json(req, { success: false, error: "Could not verify permissions" }, 500);
  }
  if (!role) return json(req, { success: false, error: "Forbidden: admin role required" }, 403);

  return { admin, user };
}
