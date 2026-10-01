# Running Khel Drishti outside Lovable: Docker, locally and on AWS

This folder runs the whole portal on your own infrastructure: the frontend, login, the database API, file storage and the server functions. The same files run on a laptop and on an EC2 VM, with Postgres either on RDS or in a container, and attachments on S3.

## Architecture

```
                 Browser
                    │ https://kd.example.gov.in   (one origin, one certificate)
                    ▼
        ┌──────────────────────────┐
        │ web  (Caddy + React SPA) │  /             → SPA (index.html fallback)
        │                          │  /auth/v1/*    → auth
        │  :80 / :443 public       │  /rest/v1/*    → rest
        │  :8000 internal only     │  /storage/v1/* → storage
        └───┬───────┬───────┬──────┘  /functions/v1/* → functions
            │       │       │
   ┌────────▼┐ ┌────▼────┐ ┌▼────────┐ ┌──────────────┐
   │ auth    │ │ rest    │ │ storage │ │ functions    │──► web:8000 (internal)
   │ GoTrue  │ │PostgREST│ │ Storage │ │ Edge Runtime │
   └────┬────┘ └────┬────┘ └──┬───┬──┘ └──────────────┘
        │           │         │   └──► S3 bucket (AWS)  /  Docker volume (laptop)
        └───────────┴─────────┴──► Postgres: RDS  /  db container
   one-shot jobs: db-init (roles/schemas) → migrate (supabase/migrations)
```

**Design choices**

- **Same origin for the app and the APIs.** The browser never makes a cross-origin call, so there is no CORS to configure and only one TLS certificate.
- **Kong, Studio, Realtime, Logflare and imgproxy are left out.** The app doesn't use them (no Realtime subscriptions, no image transforms). Fewer services means less to patch.
- **The stock `postgres` image is used locally instead of `supabase/postgres`.** It behaves like RDS: `docker/db/bootstrap.sql` runs as a non-superuser in both, so a stack that works on your laptop also works on RDS.
- **Pinned versions** in `docker/.env`. Upgrade GoTrue and Storage together, on staging first, because they own schema migrations.

## 1. Local (laptop)

You need Docker Desktop (or Docker Engine with Compose v2.20+) and Node 18+.

```bash
./docker/kd.sh env-local      # writes docker/.env with fresh secrets (chmod 600, git-ignored)
./docker/kd.sh local up       # builds the web image and starts everything
```

| What | Where |
|---|---|
| Portal | http://localhost:8080 |
| Emails (sign-up, password reset) | http://localhost:8025 (Mailpit) |
| Postgres | `127.0.0.1:54322`, user `postgres`, password in `docker/.env` |

**First run:**

1. Open `/setup` to create the first admin.
2. Load reference data from `/import`. It reads `public/data/*.csv` through the `import-data` function.
3. Run `./docker/kd.sh local test-db`, which runs the 34 access-rule tests against the local database.

`./docker/kd.sh local logs auth`, `local migrate`, `local psql` and `local down` work as expected. Data volumes survive `down`; `docker compose ... down -v` wipes them.

> **Until the live-schema baseline exists** (`scripts/db/README.md` step 2), two legacy migrations are skipped via `MIGRATE_SKIP`. Olympic analytics pages (`oly_*` tables and views) will be empty locally. Everything else works.

## 2. AWS: EC2 + RDS + S3 (recommended)

### Resources to create (region `ap-south-1` Mumbai or `ap-south-2` Hyderabad)

| Resource | Setting |
|---|---|
| **VPC** | EC2 in a public subnet. RDS in private subnets with no public access. |
| **EC2** | Ubuntu 24.04, `t3.medium` (2 vCPU, 4 GB) minimum. 30 GB gp3, **encrypted**. Elastic IP. |
| **EC2 metadata** | IMDSv2 *required*, **hop limit = 2**. Containers need the extra hop to get the instance role credentials, otherwise S3 calls fail with "credentials not found". |
| **Security groups** | `sg-web`: 80 and 443 from `0.0.0.0/0`, no SSH (use SSM Session Manager). `sg-db`: 5432 **only from `sg-web`**. |
| **RDS PostgreSQL 15** | `db.t4g.small` or larger. Master user **`postgres`**. Encryption on. Backups 7–35 days (point-in-time recovery). Multi-AZ for production. Parameter `rds.force_ssl = 1`. |
| **S3** | Private bucket, Block Public Access on, SSE-S3 or SSE-KMS, versioning on, lifecycle rule for non-current versions. |
| **IAM instance role** | Policy below, plus `AmazonSSMManagedInstanceCore`. |
| **SES** | Verify the sending domain (SPF/DKIM). Create SMTP credentials. Request production access (out of the sandbox). |
| **DNS** | A record `kd.example.gov.in` pointing at the Elastic IP, **before** the first start, so Let's Encrypt can issue the certificate. |

S3 policy for the instance role (replace the bucket name):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    { "Effect": "Allow", "Action": ["s3:ListBucket"], "Resource": "arn:aws:s3:::kd-attachments-prod" },
    { "Effect": "Allow", "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject", "s3:AbortMultipartUpload", "s3:ListMultipartUploadParts"],
      "Resource": "arn:aws:s3:::kd-attachments-prod/*" }
  ]
}
```

### Deploy

```bash
# on the EC2 instance (via SSM)
sudo apt-get update && sudo apt-get install -y docker.io docker-compose-v2 nodejs git
sudo usermod -aG docker $USER && newgrp docker
git clone <repo-url> kheldrishti && cd kheldrishti

node docker/generate-env.mjs ec2 \
  --domain kd.example.gov.in --bucket kd-attachments-prod \
  --db-host <rds-endpoint>.ap-south-1.rds.amazonaws.com --acme-email ops@example.gov.in
# then edit docker/.env: DB_ADMIN_PASSWORD (RDS master), SMTP_USER / SMTP_PASS (SES)

./docker/kd.sh ec2 up        # or: ./docker/kd.sh ec2-selfdb up  (Postgres container on the VM)
./docker/kd.sh ec2 ps        # all services Up; db-init and migrate "Exited (0)"
```

On RDS, `db-init` may log *"service_role could not be given BYPASSRLS"*. This is expected if the master user can't grant that attribute. `post-migrate.sql` then adds explicit `service_role` policies, so the server functions still work. The startup log line `post-migrate: service_role bypassrls=…` shows which mode you are in.

### Without RDS (`./docker/kd.sh ec2-selfdb up`)

Postgres runs in a container on the instance's EBS volume. Then **you** own the backups:

- Nightly `pg_dump -Fc` to S3, plus EBS snapshots through AWS Backup.
- Test a restore before go-live.

RDS is the better default for ministry data because of point-in-time recovery, Multi-AZ and managed patching.

## 3. Moving data off Lovable Cloud

1. **Schema:** run `scripts/db/dump_live_schema.sql` (see `scripts/db/README.md`). Save the output as `supabase/migrations/20260930000000_baseline_live_schema.sql` and **clear `MIGRATE_SKIP`**. The runner records the 21 older migrations as superseded and builds the database from the baseline.
2. **Data**, in order of preference:
   - **Database access available** (connection string from Lovable/Supabase): `pg_dump --data-only` for `public`, `auth.users` and `auth.identities`, then restore into the new database after `./docker/kd.sh ec2 migrate`. Users keep their passwords because the hashes copy across.
   - **No database access:** `/admin/export` → "Download all data" (CSVs) and load those into the new database. Accounts must be recreated: bulk-create STC and regional users in User Management, and other users sign up again.
3. **Attachments:** copy the `stc-attachments` objects from Lovable storage into S3. The Storage API keys objects as `<TENANT_ID>/<bucket>/<path>` (here `kheldrishti/stc-attachments/...`); verify this with one uploaded test file before copying everything.
4. **Cut-over:** freeze writes on the old site, take a final data export, switch DNS, then verify login, an STC save, an attachment upload and an admin import.

## Operations

| Task | How |
|---|---|
| Logs | `./docker/kd.sh ec2 logs <service>`. JSON logs rotate at 5 × 20 MB per service. Ship them to CloudWatch with the agent. |
| New migration | Add the file to `supabase/migrations/`, `git pull` on the VM, then `./docker/kd.sh ec2 migrate`. Each file runs in one transaction. |
| Upgrade images | Bump the versions in `docker/.env` on staging, run `./docker/kd.sh local test-db`, then production. |
| Rotate secrets | `node docker/generate-env.mjs ec2 ... --force`, then `./docker/kd.sh ec2 up`. This rotates the JWT secret, so every user is signed out. |
| Health | `curl -fsS https://<domain>/auth/v1/health`. The web container also has a Docker healthcheck. |

## Security notes

- **`SERVICE_ROLE_KEY`** bypasses RLS. It only goes to `storage` and `functions`, never into the web image (the Dockerfile only takes the anon key).
- **Database ports:** Postgres is never published publicly. The `db` container binds to `127.0.0.1` only.
- **Function workers** receive only `SUPABASE_URL`, the two keys and `ALLOWED_ORIGINS`, not the whole container environment.
- **Secrets in production:** for hardening, move `docker/.env` secrets to SSM Parameter Store and render the file at boot.

## Known limits

- **Not tested end to end in the authoring sandbox.** Image registries were blocked there. What was tested:
  - the gateway config, run against stub upstreams;
  - the bootstrap and migrations on Postgres as a **non-superuser** (RDS-like), including the baseline path;
  - the 34 RLS tests;
  - the env generator;
  - `docker compose config` for all three stacks.

  Before production: pull the images, run `./docker/kd.sh local up`, run `./docker/kd.sh local test-db`, then do a staging deploy.
- **Internet access for functions:** functions import `supabase-js` from `esm.sh` at first run, so the VM needs outbound HTTPS.
