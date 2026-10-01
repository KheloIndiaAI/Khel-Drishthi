#!/bin/sh
# Applies supabase/migrations/*.sql in version order, once each, recording them
# in supabase_migrations.schema_migrations (the Supabase CLI's table).
#
# Runs as the one-shot `migrate` service AFTER GoTrue and Storage have created
# the auth/storage schemas, because the app's migrations reference auth.users,
# auth.uid() and storage.objects.
#
# Environment:
#   MIGRATIONS_DIR  default /migrations
#   MIGRATE_SKIP    comma-separated versions to skip (not recorded; they run
#                   once removed from the list). Use only for known-broken files.
#
# Baseline support: if a file named <version>_baseline_*.sql exists, every
# older migration is recorded as superseded instead of executed, and the
# baseline runs first on a fresh database. See scripts/db/README.md.
set -eu

: "${PGHOST:?}" "${PGUSER:?}" "${PGPASSWORD:?}" "${PGDATABASE:?}"
DIR="${MIGRATIONS_DIR:-/migrations}"
SKIP=",${MIGRATE_SKIP:-},"
PSQL="psql -X -q -v ON_ERROR_STOP=1"

q() { psql -X -A -t -v ON_ERROR_STOP=1 -c "$1"; }

[ -d "$DIR" ] || { echo "migrate: $DIR not found" >&2; exit 1; }

baseline_file=$(ls "$DIR" 2>/dev/null | grep -E '^[0-9]+_baseline_.*\.sql$' | sort | tail -n 1 || true)
baseline_ver=""
[ -n "$baseline_file" ] && baseline_ver="${baseline_file%%_*}"

applied=0; skipped=0; superseded=0
for path in $(ls "$DIR"/*.sql | sort); do
  file=$(basename "$path")
  ver="${file%%_*}"
  name="${file#*_}"; name="${name%.sql}"

  case "$ver" in *[!0-9]*|"") echo "migrate: ignoring $file (no numeric version)"; continue ;; esac

  if [ "$(q "SELECT count(*) FROM supabase_migrations.schema_migrations WHERE version = '$ver'")" != "0" ]; then
    continue
  fi

  case "$SKIP" in *",$ver,"*)
    echo "migrate: SKIP $file (listed in MIGRATE_SKIP)"; skipped=$((skipped + 1)); continue ;;
  esac

  # String comparison (versions are fixed-width timestamps); avoids 64-bit
  # integer limits in some /bin/sh implementations.
  if [ -n "$baseline_ver" ] && [ "$ver" != "$baseline_ver" ] \
     && [ "$(printf '%s\n%s\n' "$ver" "$baseline_ver" | sort | head -n 1)" = "$ver" ]; then
    q "INSERT INTO supabase_migrations.schema_migrations (version, name) VALUES ('$ver', 'superseded-by-baseline:$name')" >/dev/null
    superseded=$((superseded + 1))
    continue
  fi

  echo "migrate: applying $file"
  # One transaction per file: the migration and its bookkeeping row commit together.
  if ! $PSQL --single-transaction -f "$path" \
        -c "INSERT INTO supabase_migrations.schema_migrations (version, name) VALUES ('$ver', '$name')"; then
    echo "migrate: FAILED on $file — nothing from this file was committed." >&2
    echo "migrate: fix the file, or (only for known-broken legacy files) add $ver to MIGRATE_SKIP." >&2
    exit 1
  fi
  applied=$((applied + 1))
done

echo "migrate: running post-migrate checks"
$PSQL -f /db/post-migrate.sql

# Tell PostgREST to pick up new tables/functions without a restart.
q "NOTIFY pgrst, 'reload schema'" >/dev/null

echo "migrate: done (applied=$applied skipped=$skipped superseded=$superseded)"
