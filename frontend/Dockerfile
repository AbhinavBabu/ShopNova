FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# Build-time env vars must be passed via --build-arg / ARG for Vite
ARG VITE_AUTH_SERVICE_URL
ARG VITE_PRODUCT_SERVICE_URL
ARG VITE_ORDER_SERVICE_URL

ENV VITE_AUTH_SERVICE_URL=$VITE_AUTH_SERVICE_URL
ENV VITE_PRODUCT_SERVICE_URL=$VITE_PRODUCT_SERVICE_URL
ENV VITE_ORDER_SERVICE_URL=$VITE_ORDER_SERVICE_URL

RUN npm run build

# Production: serve with nginx (unprivileged variant runs as non-root on port 8080)
FROM nginxinc/nginx-unprivileged:alpine

# Copy built assets and config
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
