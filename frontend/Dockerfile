# =============================================================================
# Stage 1: Build React/Vite Application
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy lockfiles first for layer caching
COPY package.json package-lock.json ./

# Install ALL dependencies (including devDeps needed for build)
RUN npm ci && npm cache clean --force

# Copy source and build
COPY . .
RUN npm run build

# =============================================================================
# Stage 2: Production Nginx Runtime (non-root)
# =============================================================================
FROM nginx:1.27-alpine AS runtime

# Install wget for healthcheck only, then remove cache
RUN apk add --no-cache wget

# Remove default nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config (listens on port 8080 for non-root compatibility)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Fix ownership so nginx user (UID 101) can read files
RUN chown -R nginx:nginx /usr/share/nginx/html \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/log/nginx \
    && chown -R nginx:nginx /etc/nginx/conf.d \
    && touch /var/run/nginx.pid \
    && chown nginx:nginx /var/run/nginx.pid

# Drop to nginx non-root user (UID 101 in nginx:alpine)
USER nginx

# Expose non-privileged port
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD wget -qO- http://localhost:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
