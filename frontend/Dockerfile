# ── Stage 1: Build ────────────────────────────────────────────────────────────
# Vite bakes env vars into the JS bundle at build time, so VITE_* variables
# are NOT used here. All backend communication is handled by Nginx proxying
# (see nginx.conf), which means the frontend bundle contains zero hardcoded
# IP addresses and is fully reusable across environments without rebuilding.
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

RUN npm run build

# ── Stage 2: Serve ────────────────────────────────────────────────────────────
# We use `envsubst` to substitute ${AUTH_SERVICE_HOST} and friends in
# nginx.conf.template at container startup. This makes backend hostnames
# runtime-configurable: change an env var → restart container → done.
# No image rebuild required.
FROM nginx:alpine

# Install gettext for envsubst
RUN apk add --no-cache gettext

# Copy the built static files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the nginx template (contains ${VAR} placeholders)
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Copy the entrypoint that runs envsubst then launches nginx
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# nginx:alpine default user is 'nginx'; ensure it can read what it needs
RUN chown -R nginx:nginx /usr/share/nginx/html \
 && chown nginx:nginx /docker-entrypoint.sh

USER nginx

EXPOSE 3000

# envsubst renders the template → /etc/nginx/conf.d/default.conf, then
# nginx starts in the foreground.
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
