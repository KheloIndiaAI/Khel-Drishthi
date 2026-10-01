// Bulk-creates login accounts for STC in-charges and regional officers.
//
// Admin only. For each item it creates an auth user, promotes the default
// `viewer` role to `editor`, and records the centre/region assignment. If any
// step after user creation fails, the user is deleted again so no half-provisioned
// account (login without assignment, or assignment without editor role) is left
// behind.
//
// Passwords are random per user, returned exactly once in this response, and
// never stored. Lost passwords go through the normal reset flow.
import { json, preflight } from "../_shared/http.ts";
import { requireAdmin } from "../_shared/auth.ts";
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

type UserType = "stc" | "region";

interface Item {
  id: string;
  name: string;
  state?: string;
}

interface CreatedCredential {
  username: string;
  email: string;
  password: string | null;
  name: string;
  state?: string;
  type: UserType;
  centreId?: string;
  regionId?: string;
  success: boolean;
  error?: string;
}

const DOMAIN = "@kheldrishti.local";
const MAX_ITEMS = 200;          // keeps one call well inside the edge-function time limit
const MAX_FIELD_LENGTH = 200;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function generatePassword(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("") + "!Aa1";
}

function generateUsername(name: string, type: UserType): string {
  const clean = name.toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 30);
  return `${type === "stc" ? "stc" : "rc"}${clean}`;
}

function isEmailTaken(err: { code?: string; status?: number; message?: string }): boolean {
  return err.code === "email_exists" || err.code === "user_already_exists" ||
    /already (been )?registered|already exists/i.test(err.message ?? "");
}

function parseBody(body: unknown): { type: UserType; items: Item[] } | string {
  if (!body || typeof body !== "object") return "Invalid request body";
  const { type, items } = body as { type?: unknown; items?: unknown };
  if (type !== "stc" && type !== "region") return "type must be 'stc' or 'region'";
  if (!Array.isArray(items) || items.length === 0) return "items must be a non-empty array";
  if (items.length > MAX_ITEMS) return `Too many items (max ${MAX_ITEMS} per request)`;

  const clean: Item[] = [];
  for (const raw of items) {
    const it = raw as Partial<Item>;
    if (typeof it?.id !== "string" || !it.id.trim() || it.id.length > MAX_FIELD_LENGTH) return "Each item needs a valid id";
    if (typeof it.name !== "string" || !it.name.trim() || it.name.length > MAX_FIELD_LENGTH) return "Each item needs a valid name";
    if (type === "region" && !UUID_RE.test(it.id)) return `Invalid region id: ${it.id}`;
    clean.push({
      id: it.id.trim(),
      name: it.name.trim(),
      state: typeof it.state === "string" ? it.state.slice(0, MAX_FIELD_LENGTH) : undefined,
    });
  }
  return { type, items: clean };
}

/** Ids that do not exist in the reference tables, so we never create orphan assignments. */
async function unknownIds(admin: SupabaseClient, type: UserType, ids: string[]): Promise<Set<string>> {
  const { data, error } = type === "stc"
    ? await admin.from("centres").select("centre_id").eq("centre_type", "STC").in("centre_id", ids)
    : await admin.from("regional_centres").select("id").in("id", ids);
  if (error) throw new Error(`Reference lookup failed: ${error.message}`);
  const found = new Set((data ?? []).map((r: Record<string, string>) => r.centre_id ?? r.id));
  return new Set(ids.filter((id) => !found.has(id)));
}

async function provision(
  admin: SupabaseClient, type: UserType, item: Item, assignedBy: string,
): Promise<CreatedCredential> {
  const username = generateUsername(item.name, type);
  const email = `${username}${DOMAIN}`;
  const base = {
    username, email, name: item.name, state: item.state, type,
    centreId: type === "stc" ? item.id : undefined,
    regionId: type === "region" ? item.id : undefined,
  };
  const fail = (error: string): CreatedCredential => ({ ...base, password: null, success: false, error });

  const password = generatePassword();
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name: item.name,
      assignment_type: type === "stc" ? "centre_incharge" : "regional_officer",
      requested_centre_id: type === "stc" ? item.id : undefined,
      requested_region_id: type === "region" ? item.id : undefined,
    },
  });

  if (createError || !created?.user) {
    if (createError && isEmailTaken(createError)) return fail("User already exists");
    return fail(createError?.message ?? "Unknown error creating user");
  }

  const userId = created.user.id;
  try {
    // The auth trigger inserts a 'viewer' row; promote it and confirm exactly one row changed.
    const { data: roleRows, error: roleError } = await admin
      .from("user_roles").update({ role: "editor" }).eq("user_id", userId).select("user_id");
    if (roleError) throw new Error(`Role update failed: ${roleError.message}`);
    if (!roleRows?.length) {
      const { error: insertRoleError } = await admin.from("user_roles").insert({ user_id: userId, role: "editor" });
      if (insertRoleError) throw new Error(`Role insert failed: ${insertRoleError.message}`);
    }

    const { error: assignError } = type === "stc"
      ? await admin.from("user_centre_assignments").insert({
          user_id: userId, centre_id: item.id, assigned_by: assignedBy, is_active: true,
        })
      : await admin.from("user_region_assignments").insert({
          user_id: userId, region_id: item.id, access_level: "view_edit", assigned_by: assignedBy, is_active: true,
        });
    if (assignError) throw new Error(`Assignment failed: ${assignError.message}`);

    return { ...base, password, success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const { error: rollbackError } = await admin.auth.admin.deleteUser(userId);
    if (rollbackError) {
      console.error(`Rollback failed for ${email}:`, rollbackError.message);
      return fail(`${message}. Rollback also failed — delete ${email} manually.`);
    }
    return fail(`${message} (account rolled back)`);
  }
}

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;

  const ctx = await requireAdmin(req);
  if (ctx instanceof Response) return ctx;
  const { admin, user } = ctx;

  try {
    const parsed = parseBody(await req.json().catch(() => null));
    if (typeof parsed === "string") return json(req, { success: false, error: parsed }, 400);
    const { type, items } = parsed;

    const missing = await unknownIds(admin, type, [...new Set(items.map((i) => i.id))]);
    console.log(`bulk-create-users: admin ${user.id} creating ${items.length} ${type} users`);

    const results: CreatedCredential[] = [];
    const seenEmails = new Set<string>();
    for (const item of items) {
      const username = generateUsername(item.name, type);
      const email = `${username}${DOMAIN}`;
      if (missing.has(item.id)) {
        results.push({ username, email, password: null, name: item.name, state: item.state, type,
          centreId: type === "stc" ? item.id : undefined, regionId: type === "region" ? item.id : undefined,
          success: false, error: `Unknown ${type === "stc" ? "centre" : "region"} id` });
        continue;
      }
      if (seenEmails.has(email)) {
        results.push({ username, email, password: null, name: item.name, state: item.state, type,
          centreId: type === "stc" ? item.id : undefined, regionId: type === "region" ? item.id : undefined,
          success: false, error: "Duplicate username in this batch (two items share the same name)" });
        continue;
      }
      seenEmails.add(email);
      results.push(await provision(admin, type, item, user.id));
    }

    const created = results.filter((r) => r.success).length;
    console.log(`bulk-create-users: ${created} created, ${results.length - created} failed`);
    return json(req, { success: true, created, failed: results.length - created, credentials: results });
  } catch (e) {
    console.error("bulk-create-users error:", e);
    return json(req, { success: false, error: e instanceof Error ? e.message : "Internal server error" }, 500);
  }
});
