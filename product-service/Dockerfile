FROM node:20-alpine

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json ./
RUN npm install --omit=dev

# Copy source files and set ownership in one step to avoid permission issues
COPY --chown=node:node . .

# Switch to non-root user
USER node

EXPOSE 8002

CMD ["node", "src/index.js"]
