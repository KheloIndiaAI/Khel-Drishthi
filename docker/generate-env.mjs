#!/usr/bin/env node
// =============================================================================
// Generates docker/.env from docker/env.example with fresh secrets.
// No dependencies; Node 18+.
//
//   node docker/generate-env.mjs local
//   node docker/generate-env.mjs ec2 --domain kd.example.gov.in --bucket kd-attachments-prod \
//        [--db-host xxx.rds.amazonaws.com] [--region ap-south-1] [--acme-email ops@example.gov.in]
//   add --force to overwrite an existing docker/.env (this ROTATES every secret:
//   all users are logged out and service passwords change).
// =============================================================================
import { createHmac, randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync, chmodSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const TEMPLATE = join(here, "env.example");
const OUT = join(here, ".env");

function die(msg) {
  console.error(`generate-env: ${msg}`);
  process.exit(1);
}

function parseArgs(argv) {
  const [mode, ...rest] = argv;
  const flags = {};
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (!a.startsWith("--")) die(`unexpected argument "${a}"`);
    const key = a.slice(2);
    if (key === "force") flags.force = true;
    else {
      const val = rest[++i];
      if (!val || val.startsWith("--")) die(`--${key} needs a value`);
      flags[key] = val;
    }
  }
  return { mode, flags };
}

const b64url = (buf) => Buffer.from(buf).toString("base64url");
const secret = (bytes = 32) => randomBytes(bytes).toString("hex"); // URL-safe for connection strings

function signJwt(payload, key) {
  const head = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64url(JSON.stringify(payload));
  const sig = createHmac("sha256", key).update(`${head}.${body}`).digest("base64url");
  return `${head}.${body}.${sig}`;
}

const { mode, flags } = parseArgs(process.argv.slice(2));
if (mode !== "local" && mode !== "ec2") {
  die("usage: node docker/generate-env.mjs <local|ec2> [--domain d --bucket b --db-host h --region r --acme-email e] [--force]");
}
if (existsSync(OUT) && !flags.force) {
  die(`${OUT} already exists. Re-run with --force to overwrite (rotates all secrets).`);
}

const jwtSecret = secret(32);
const iat = Math.floor(Date.now() / 1000);
const exp = iat + 10 * 365 * 24 * 3600; // API keys are long-lived; rotate by regenerating

const values = {
  DB_ADMIN_PASSWORD: secret(),
  AUTHENTICATOR_PASSWORD: secret(),
  AUTH_ADMIN_PASSWORD: secret(),
  STORAGE_ADMIN_PASSWORD: secret(),
  JWT_SECRET: jwtSecret,
  ANON_KEY: signJwt({ role: "anon", iss: "supabase", iat, exp }, jwtSecret),
  SERVICE_ROLE_KEY: signJwt({ role: "service_role", iss: "supabase", iat, exp }, jwtSecret),
};

if (mode === "ec2") {
  const domain = flags.domain ?? die("ec2 mode needs --domain (DNS must point at the instance)");
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) die(`invalid --domain "${domain}"`);
  const bucket = flags.bucket ?? die("ec2 mode needs --bucket (private S3 bucket for attachments)");
  const region = flags.region ?? "ap-south-1";
  const dbHost = flags["db-host"] ?? "db";
  Object.assign(values, {
    SITE_URL: `https://${domain}`,
    SITE_ADDRESS: domain,
    HTTP_PORT: "80",
    HTTPS_PORT: "443",
    ACME_EMAIL: flags["acme-email"] ?? `admin@${domain}`,
    DB_HOST: dbHost,
    DB_SSLMODE: dbHost === "db" ? "prefer" : "require",
    MAILER_AUTOCONFIRM: "false",
    SMTP_HOST: `email-smtp.${region}.amazonaws.com`,
    SMTP_PORT: "587",
    SMTP_ADMIN_EMAIL: `no-reply@${domain}`,
    STORAGE_BACKEND: "s3",
    AWS_REGION: region,
    S3_BUCKET: bucket,
  });
  // RDS master password is chosen when the instance is created; keep it in sync.
  if (dbHost !== "db") values.DB_ADMIN_PASSWORD = "__SET_TO_RDS_MASTER_PASSWORD__";
}

const lines = readFileSync(TEMPLATE, "utf8").split("\n").map((line) => {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (!m || !(m[1] in values)) return line;
  return `${m[1]}=${values[m[1]]}`;
});
const out = lines.join("\n");
if (lines.some((l) => /^[A-Z0-9_]+=__GENERATED__$/.test(l))) die("template still has unfilled __GENERATED__ values");

writeFileSync(OUT, out, { mode: 0o600 });
chmodSync(OUT, 0o600);

console.log(`generate-env: wrote ${OUT} (${mode}, mode 600)`);
if (mode === "ec2") {
  console.log("generate-env: still to fill in by hand: SMTP_USER / SMTP_PASS (SES SMTP credentials)" +
    (values.DB_ADMIN_PASSWORD.startsWith("__") ? ", DB_ADMIN_PASSWORD (RDS master password)" : ""));
}
