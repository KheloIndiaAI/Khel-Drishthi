# syntax=docker/dockerfile:1.7
# =============================================================================
# Khel Drishti — web image (built SPA + Caddy gateway)
# =============================================================================
# One container serves the React build AND reverse-proxies the Supabase APIs on
# the same origin (/auth/v1, /rest/v1, /storage/v1, /functions/v1). Same origin
# means no CORS configuration, one TLS certificate, and one public port.
#
# VITE_* values are compiled into the JS bundle, so the image is built per
# environment (docker compose passes them from docker/.env).
# =============================================================================

ARG NODE_VERSION=22.12.0
ARG CADDY_VERSION=2.8.4

# ---------------------------------------------------------------- build ----
FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /app

# Dependencies first so they are cached across source changes.
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund --loglevel=error

COPY . .

# Public values only: the anon key is designed to be shipped to browsers.
# Never pass the service-role key here.
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_PROJECT_ID=self-hosted
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL} \
    VITE_SUPABASE_PUBLISHABLE_KEY=${VITE_SUPABASE_PUBLISHABLE_KEY} \
    VITE_SUPABASE_PROJECT_ID=${VITE_SUPABASE_PROJECT_ID}

# Fail the build instead of shipping a bundle that points at the wrong backend.
# (Variables already in the environment take precedence over any .env file.)
RUN test -n "$VITE_SUPABASE_URL" && test -n "$VITE_SUPABASE_PUBLISHABLE_KEY" \
 || { echo "VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY build args are required" >&2; exit 1; }

RUN npm run build

# -------------------------------------------------------------- runtime ----
FROM caddy:${CADDY_VERSION}-alpine AS runtime

LABEL org.opencontainers.image.title="khel-drishti-web" \
      org.opencontainers.image.description="Khel Drishti SPA + API gateway"

COPY docker/caddy/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv

# 80/443: public site (443 only when SITE_ADDRESS is a domain).
# 8000: internal API gateway for service-to-service calls (not published).
EXPOSE 80 443 8000

HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8000/_gateway/health || exit 1
