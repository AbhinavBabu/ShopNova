# =============================================================================
# Stage 1: Dependency Installation
# =============================================================================
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev && npm cache clean --force

# =============================================================================
# Stage 2: Production Runtime
# =============================================================================
FROM node:20-alpine AS runtime

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --ingroup nodejs --no-create-home nodeuser

WORKDIR /app

COPY --from=deps --chown=nodeuser:nodejs /app/node_modules ./node_modules
COPY --chown=nodeuser:nodejs src/ ./src/
COPY --chown=nodeuser:nodejs package.json ./

USER nodeuser

EXPOSE 8002

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:8002/health || exit 1

CMD ["node", "src/index.js"]
