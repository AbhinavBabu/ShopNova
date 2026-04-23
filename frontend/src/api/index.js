import axios from "axios";

// All API calls use relative URLs so they are proxied by Nginx to the
// appropriate backend services. No IP addresses or hostnames are baked
// into the Vite build output — the frontend image is fully reusable
// across environments without rebuilding.

// ─────────────────────────────────────────
// Auth API  →  Nginx proxies /api/auth/* → auth-service
// ─────────────────────────────────────────
export const authApi = axios.create({ baseURL: "/api/auth" });

export const registerUser = (data) => authApi.post("/register", data);
export const loginUser = (data) => authApi.post("/login", data);
export const getMe = (token) =>
  authApi.get("/me", { headers: { Authorization: `Bearer ${token}` } });

// ─────────────────────────────────────────
// Product API  →  Nginx proxies /api/products/* → product-service
// ─────────────────────────────────────────
export const productApi = axios.create({ baseURL: "/api/products" });

export const getProducts = (params) => productApi.get("/", { params });
export const getProduct = (id) => productApi.get(`/${id}`);

// ─────────────────────────────────────────
// Order API  →  Nginx proxies /api/orders/* → order-service
// ─────────────────────────────────────────
export const orderApi = axios.create({ baseURL: "/api/orders" });

const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const createOrder = (data, token) => orderApi.post("/", data, authHeader(token));
export const getMyOrders = (token) => orderApi.get("/my", authHeader(token));
