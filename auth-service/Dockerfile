# =============================================================================
# Stage 1: Dependency Installation
# =============================================================================
FROM node:20-alpine AS deps

WORKDIR /app

# Copy lockfiles first to leverage Docker layer caching
COPY package.json package-lock.json ./

# Install production dependencies only using lockfile (reproducible builds)
RUN npm ci --omit=dev && npm cache clean --force

# =============================================================================
# Stage 2: Production Runtime
# =============================================================================
FROM node:20-alpine AS runtime

# Create a non-root system user and group (principle of least privilege)
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --ingroup nodejs --no-create-home nodeuser

WORKDIR /app

# Copy production node_modules from deps stage with correct ownership
COPY --from=deps --chown=nodeuser:nodejs /app/node_modules ./node_modules

# Copy application source with correct ownership
COPY --chown=nodeuser:nodejs src/ ./src/
COPY --chown=nodeuser:nodejs package.json ./

# Drop to non-root user
USER nodeuser

# Expose service port
EXPOSE 8001

# Health metadata
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:8001/health || exit 1

CMD ["node", "src/index.js"]
