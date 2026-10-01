#!/bin/sh
# Waits for Postgres (container or RDS), then applies docker/db/bootstrap.sql.
# Runs as the one-shot `db-init` service on every `docker compose up`.
set -eu

: "${PGHOST:?PGHOST is required}"
: "${PGUSER:?PGUSER is required}"
: "${PGPASSWORD:?PGPASSWORD is required}"
: "${PGDATABASE:?PGDATABASE is required}"
: "${AUTHENTICATOR_PASSWORD:?}"
: "${AUTH_ADMIN_PASSWORD:?}"
: "${STORAGE_ADMIN_PASSWORD:?}"

tries=0
until pg_isready -q -h "$PGHOST" -p "${PGPORT:-5432}" -d "$PGDATABASE" -U "$PGUSER"; do
  tries=$((tries + 1))
  if [ "$tries" -ge 60 ]; then
    echo "db-init: database at $PGHOST:${PGPORT:-5432} not reachable after 120s" >&2
    exit 1
  fi
  sleep 2
done

echo "db-init: bootstrapping roles and schemas on $PGHOST/$PGDATABASE as $PGUSER"
psql -X -q -v ON_ERROR_STOP=1 \
  -v authenticator_password="$AUTHENTICATOR_PASSWORD" \
  -v auth_admin_password="$AUTH_ADMIN_PASSWORD" \
  -v storage_admin_password="$STORAGE_ADMIN_PASSWORD" \
  -f /db/bootstrap.sql
echo "db-init: done"
