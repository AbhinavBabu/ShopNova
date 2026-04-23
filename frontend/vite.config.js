import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load .env.local / .env so proxy targets can be configured without
  // touching this file. Falls back to localhost ports when not set.
  const env = loadEnv(mode, process.cwd(), "VITE_");

  const authUrl     = env.VITE_AUTH_SERVICE_URL    || "http://localhost:8001";
  const productUrl  = env.VITE_PRODUCT_SERVICE_URL || "http://localhost:8002";
  const orderUrl    = env.VITE_ORDER_SERVICE_URL   || "http://localhost:8003";

  return {
    plugins: [react()],

    server: {
      host: "0.0.0.0",
      port: 3000,

      // Dev-server proxy mirrors the Nginx reverse-proxy rules so that
      // `npm run dev` works identically to the production Docker setup
      // without requiring any code changes between environments.
      proxy: {
        "/api/auth": {
          target:      authUrl,
          changeOrigin: true,
        },
        "/api/products": {
          target:      productUrl,
          changeOrigin: true,
        },
        "/api/orders": {
          target:      orderUrl,
          changeOrigin: true,
        },
      },
    },
  };
});
