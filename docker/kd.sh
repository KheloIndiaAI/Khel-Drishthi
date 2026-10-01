#!/bin/sh
# =============================================================================
# Khel Drishti — self-hosted stack helper
# =============================================================================
#   ./docker/kd.sh env-local             create docker/.env for a laptop
#   ./docker/kd.sh local up              Postgres container + local disk storage + Mailpit
#   ./docker/kd.sh ec2 up                EC2 + RDS + S3
#   ./docker/kd.sh ec2-selfdb up         EC2 + Postgres container on the VM + S3
#   ./docker/kd.sh <stack> ps | logs [service] | migrate | psql | config | down
#   ./docker/kd.sh local test-db         RLS regression tests (never on production)
# =============================================================================
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$ROOT"
ENV_FILE="${ENV_FILE:-docker/.env}"

usage() { sed -n '5,10p' "$0" | sed 's/^# \{0,1\}//'; exit 1; }

compose_for() {
  base="docker compose --env-file $ENV_FILE -f docker-compose.yml"
  case "$1" in
    local)      echo "$base -f docker/compose.db.yml -f docker/compose.local.yml" ;;
    ec2)        echo "$base" ;;
    ec2-selfdb) echo "$base -f docker/compose.db.yml" ;;
    *) echo "unknown stack '$1' (local | ec2 | ec2-selfdb)" >&2; exit 1 ;;
  esac
}

check_env() {
  [ -f "$ENV_FILE" ] || { echo "Missing $ENV_FILE. Run './docker/kd.sh env-local' or 'node docker/generate-env.mjs ec2 --domain ... --bucket ...'" >&2; exit 1; }
  if grep -qE '^[A-Z0-9_]+=__(SET_TO_[A-Z_]+|GENERATED)__' "$ENV_FILE"; then
    echo "$ENV_FILE still has placeholder values:" >&2
    grep -E '^[A-Z0-9_]+=__' "$ENV_FILE" | cut -d= -f1 >&2
    exit 1
  fi
}

# RDS enforces TLS (rds.force_ssl=1). Node-based services verify the server
# certificate, so they need Amazon's CA bundle for the database's region.
ensure_rds_ca() {
  mode=$(grep -E '^DB_SSLMODE=' "$ENV_FILE" | cut -d= -f2- || true)
  case "$mode" in require|verify-ca|verify-full) ;; *) return 0 ;; esac
  [ -s docker/certs/rds-ca.pem ] && return 0
  region=$(grep -E '^AWS_REGION=' "$ENV_FILE" | cut -d= -f2- || true)
  region=${region:-ap-south-1}
  url="https://truststore.pki.rds.amazonaws.com/${region}/${region}-bundle.pem"
  echo "Fetching RDS CA bundle for ${region}"
  mkdir -p docker/certs
  if ! curl -fsS --max-time 30 -o docker/certs/rds-ca.pem.tmp "$url" \
     || ! grep -q "BEGIN CERTIFICATE" docker/certs/rds-ca.pem.tmp; then
    rm -f docker/certs/rds-ca.pem.tmp
    echo "Could not download $url; storage cannot verify the RDS certificate." >&2
    exit 1
  fi
  mv docker/certs/rds-ca.pem.tmp docker/certs/rds-ca.pem
}

[ $# -ge 1 ] || usage

[ "$1" = env-local ] && exec node docker/generate-env.mjs local

stack="$1"; cmd="${2:-}"; [ -n "$cmd" ] || usage
C=$(compose_for "$stack")
case "$cmd" in
  up)
    check_env
    ensure_rds_ca
    $C up -d --build
    if [ "$stack" = local ]; then
      echo "Portal: http://localhost:8080   Mail: http://localhost:8025   DB: 127.0.0.1:54322"
    fi ;;
  ps)      $C ps ;;
  logs)    $C logs -f --tail=200 ${3:-} ;;
  config)  check_env; $C config ;;
  migrate) check_env; $C run --rm migrate ;;
  psql)    check_env; $C run --rm --entrypoint psql migrate ;;
  down)    $C down ;;
  test-db)
    [ "$stack" = local ] || { echo "test-db inserts fixtures; run it only on a local/staging stack" >&2; exit 1; }
    check_env
    $C run --rm -v "$ROOT/scripts/db/tests:/tests:ro" --entrypoint psql migrate \
      -v ON_ERROR_STOP=1 -f /tests/security_hardening_test.sql ;;
  *) usage ;;
esac
