import axios from "axios";

const AUTH_URL = import.meta.env.VITE_AUTH_SERVICE_URL || "http://44.222.198.164:8001";
const PRODUCT_URL = import.meta.env.VITE_PRODUCT_SERVICE_URL || "http://44.222.198.164:8002";
const ORDER_URL = import.meta.env.VITE_ORDER_SERVICE_URL || "http://44.222.198.164:8003";

// ─────────────────────────────────────────
// Auth API
// ─────────────────────────────────────────
export const authApi = axios.create({ baseURL: `${AUTH_URL}/api/auth` });

export const registerUser = (data) => authApi.post("/register", data);
export const loginUser = (data) => authApi.post("/login", data);
export const getMe = (token) =>
  authApi.get("/me", { headers: { Authorization: `Bearer ${token}` } });

// ─────────────────────────────────────────
// Product API
// ─────────────────────────────────────────
export const productApi = axios.create({ baseURL: `${PRODUCT_URL}/api/products` });

export const getProducts = (params) => productApi.get("/", { params });
export const getProduct = (id) => productApi.get(`/${id}`);

// ─────────────────────────────────────────
// Order API
// ─────────────────────────────────────────
export const orderApi = axios.create({ baseURL: `${ORDER_URL}/api/orders` });

const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const createOrder = (data, token) => orderApi.post("/", data, authHeader(token));
export const getMyOrders = (token) => orderApi.get("/my", authHeader(token));
