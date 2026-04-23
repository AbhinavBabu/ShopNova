# ShopNova — Complete Project Documentation

> **Session Date:** April 22–23, 2026  
> **Project Path:** `c:\Users\Abhinav\OneDrive\Desktop\final_project`  
> **Stack:** React + Vite + Tailwind (Frontend) · Node.js + Express (Backend) · MongoDB (Database) · Docker Compose (Infrastructure)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Final Architecture](#2-final-architecture)
3. [Complete Folder Structure](#3-complete-folder-structure)
4. [Implementation — Phase by Phase](#4-implementation--phase-by-phase)
   - [Phase 1: Core Microservices](#phase-1-core-microservices-e-commerce-app)
   - [Phase 2: Notification Service](#phase-2-notification-service--inter-service-communication)
   - [Phase 3: Light Theme UI Refactor](#phase-3-light-theme-ui-refactor)
   - [Phase 4: Database-per-Service Architecture](#phase-4-database-per-service-architecture)
   - [Phase 5: Dockerfile Security Hardening (User)](#phase-5-dockerfile-security-hardening-user-changes)
5. [Service Deep Dives](#5-service-deep-dives)
   - [Auth Service](#auth-service)
   - [Product Service](#product-service)
   - [Order Service](#order-service)
   - [Notification Service](#notification-service)
   - [Frontend](#frontend)
6. [API Reference](#6-api-reference)
7. [Data Models (MongoDB Schemas)](#7-data-models-mongodb-schemas)
8. [Frontend Architecture](#8-frontend-architecture)
9. [Docker & Infrastructure](#9-docker--infrastructure)
10. [Environment Variables Reference](#10-environment-variables-reference)
11. [Design Decisions & Rationale](#11-design-decisions--rationale)
12. [Challenges Faced & How They Were Solved](#12-challenges-faced--how-they-were-solved)
13. [How to Run](#13-how-to-run)

---

## 1. Project Overview

**ShopNova** is a production-structured, container-ready e-commerce platform built entirely on the microservices pattern. Every concern — authentication, products, orders, and notifications — is an independent service with its own codebase, its own database, and its own container.

### Goals
- Demonstrate microservices design from scratch
- Each service independently deployable
- No shared state between services except the JWT secret
- Docker Compose brings the whole system up with a single command
- Production-ready patterns: non-root containers, multi-stage builds, health checks, fire-and-forget notifications

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS 3, React Router v6, Axios |
| Backend (×3) | Node.js 20, Express 4, Mongoose 8 |
| Authentication | JWT (jsonwebtoken), bcryptjs |
| Email | Nodemailer (Gmail SMTP) |
| Database | MongoDB 7 (3 isolated instances) |
| Infrastructure | Docker, Docker Compose, Nginx |
| Font | Inter (Google Fonts) |

---

## 2. Final Architecture

```
Browser
  │
  └─► Frontend (Nginx :3000)
        │   React SPA — served as static files by Nginx
        │   Talks directly to backend services from the browser
        │
        ├─► auth-service (:8001) ──► auth-db (MongoDB :27017)
        │     Register / Login / JWT validation
        │
        ├─► product-service (:8002) ──► product-db (MongoDB :27017)
        │     Product CRUD + auto-seed 8 products on startup
        │
        └─► order-service (:8003) ──► order-db (MongoDB :27017)
              Create order / Fetch user orders
              │
              └─► notification-service (:8004)  [fire-and-forget]
                    Sends order confirmation email via Gmail SMTP
```

### Docker Network
All containers share the bridge network `ecommerce-net`. Services communicate using Docker service DNS names (e.g., `http://notification-service:8004`).

---

## 3. Complete Folder Structure

```
final_project/
├── docker-compose.yml              ← Orchestrates all 8 containers
├── README.md                       ← Quick-start guide
│
├── auth-service/
│   ├── Dockerfile                  ← Multi-stage, non-root user
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── index.js                ← Express server entry point
│       ├── config/db.js            ← Mongoose connect (AUTH_MONGO_URI)
│       ├── models/User.js          ← User schema + bcrypt hooks
│       ├── controllers/authController.js  ← register, login, getMe
│       ├── routes/authRoutes.js
│       └── middleware/authMiddleware.js   ← JWT protect middleware
│
├── product-service/
│   ├── Dockerfile                  ← Multi-stage, non-root user
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── index.js
│       ├── config/db.js            ← (PRODUCT_MONGO_URI)
│       ├── models/Product.js       ← Product schema
│       ├── controllers/productController.js  ← Full CRUD
│       ├── routes/productRoutes.js
│       └── seed/products.js        ← 8 sample products, auto-seeded
│
├── order-service/
│   ├── Dockerfile                  ← Multi-stage, non-root user
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── index.js
│       ├── config/db.js            ← (ORDER_MONGO_URI)
│       ├── models/Order.js         ← Order schema with embedded items
│       ├── controllers/orderController.js  ← create, getMyOrders, getById
│       │                                     + notifyUser() fire-and-forget
│       ├── routes/orderRoutes.js
│       └── middleware/authMiddleware.js   ← Shared JWT_SECRET validation
│
├── notification-service/
│   ├── Dockerfile                  ← Multi-stage, non-root user
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── index.js
│       ├── config/mailer.js        ← Nodemailer transporter factory
│       ├── controllers/notificationController.js  ← sendNotification
│       └── routes/notificationRoutes.js
│
└── frontend/
    ├── Dockerfile                  ← Multi-stage: Vite build → Nginx
    ├── nginx.conf                  ← SPA fallback + gzip
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js          ← Custom light theme (teal + green)
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.jsx                ← Providers: Auth, Cart, Toaster
        ├── App.jsx                 ← Routes + ProtectedRoute wrapper
        ├── index.css               ← Global CSS + Tailwind layers
        ├── api/index.js            ← Axios instances per service
        ├── context/
        │   ├── AuthContext.jsx     ← JWT + user state (localStorage)
        │   └── CartContext.jsx     ← Cart: add/remove/update/clear
        ├── components/
        │   ├── Navbar.jsx          ← Scroll-aware, mobile-responsive
        │   └── ProductCard.jsx     ← Rating, category badge, CTA
        └── pages/
            ├── Home.jsx            ← Hero, features, featured products, CTA
            ├── Login.jsx           ← JWT login form
            ├── Register.jsx        ← Registration + password strength
            ├── Products.jsx        ← Search, filter, sort, grid
            ├── Cart.jsx            ← Line items, quantity, order summary
            └── Orders.jsx          ← Collapsible order history
```

---

## 4. Implementation — Phase by Phase

---

### Phase 1: Core Microservices E-Commerce App

**What was built:**
The entire foundation of the project — all three backend services, the frontend, Docker infrastructure, and MongoDB schemas.

#### Auth Service
- Express server on port `8001`
- **`POST /api/auth/register`** — validates input, checks for duplicate email, hashes password with bcrypt (salt rounds: 10), creates user, signs a 7-day JWT, returns `{ token, user }`
- **`POST /api/auth/login`** — finds user by email, compares bcrypt hash, returns JWT on success
- **`GET /api/auth/me`** — protected route, returns logged-in user data
- JWT signed with `JWT_SECRET` env variable (never hardcoded)
- `User` schema uses a Mongoose `pre-save` hook to hash passwords automatically — the controller never touches raw bcrypt

#### Product Service
- Express server on port `8002`
- Full CRUD: `GET /api/products`, `GET /api/products/:id`, `POST`, `PUT`, `DELETE`
- `GET /api/products` supports query params: `category` (filter) and `sort` (`price_asc`, `price_desc`, `rating`)
- **Auto-seeding**: on startup, `connectDB().then(seedProducts)` runs. `seedProducts` checks `Product.countDocuments()` — if 0, inserts 8 sample products with real Unsplash image URLs. Idempotent: will never double-seed.
- 8 seeded products across 4 categories: Electronics, Furniture, Lifestyle, Accessories

#### Order Service
- Express server on port `8003`
- **`POST /api/orders`** — protected, creates order tied to `req.userId` (extracted from JWT)
- **`GET /api/orders/my`** — protected, returns all orders for the logged-in user, sorted newest first
- **`GET /api/orders/:id`** — protected, returns single order (ownership check: `order.userId !== req.userId` → 403)
- JWT validation duplicated in `order-service/src/middleware/authMiddleware.js` — uses the same `JWT_SECRET`, no network call to auth-service needed (stateless JWTs)

#### Frontend
- React 18 + Vite 5 development server
- React Router v6 with 6 routes: `/`, `/login`, `/register`, `/products`, `/cart`, `/orders`
- `ProtectedRoute` wrapper — redirects unauthenticated users to `/login`
- **`AuthContext`** — stores `{ token, user }` in `localStorage`, provides `login()` and `logout()`
- **`CartContext`** — in-memory cart with `addToCart`, `removeFromCart`, `updateQuantity`, `clearCart`, derived `totalItems` and `totalAmount`
- **`src/api/index.js`** — centralized Axios instances, one per service, URLs read from `VITE_*` env vars with localhost fallbacks for local dev
- Toast notifications via `react-hot-toast`

#### Docker Compose (initial)
- Single `mongodb` container (shared, with root auth)
- All 4 service containers + frontend
- `ecommerce-net` bridge network
- Health checks on MongoDB (`mongosh --eval "db.adminCommand('ping')"`)
- Services `depends_on: mongodb: condition: service_healthy`

---

### Phase 2: Notification Service & Inter-Service Communication

**What was built:**
A 4th microservice (`notification-service`) and the wiring from `order-service` to call it.

#### notification-service
- Express server on port `8004`
- **`POST /notify`** — accepts `{ userEmail, orderId }`, sends email via Nodemailer
- Nodemailer configured for Gmail SMTP (`service: "gmail"`), credentials from env vars only
- Email content: plain-text + HTML with ShopNova branding
- **Resilient by design**: if `transporter.sendMail()` throws (bad credentials, network issue, Gmail rate limit), the error is `console.error`-logged and a `200` response is still returned — the notification service never crashes or blocks its callers
- `GET /health` endpoint for liveness checks

#### order-service changes
- Added `notifyUser(userEmail, orderId)` function using Node's **built-in `http` module** (zero new dependencies)
- `POST /api/orders` now also accepts `userEmail` in the request body
- After `res.status(201).json(order)` is sent, `notifyUser()` is called — **fire-and-forget**: the HTTP response is already delivered, so email latency never reaches the client
- If `userEmail` is missing from the body, a warning is logged but the order still succeeds
- `NOTIFICATION_SERVICE_HOST` and `NOTIFICATION_SERVICE_PORT` env vars allow the hostname to be overridden (useful for local dev without Docker)

#### Frontend changes (Cart.jsx)
- Added `userEmail: user?.email` to the `orderData` object sent to order-service
- No other frontend files changed

#### Why Node's built-in `http` instead of Axios?
Adding Axios to `order-service` solely to call one internal endpoint would increase image size and introduce an unnecessary dependency. The built-in `http` module is sufficient and keeps the footprint minimal.

---

### Phase 3: Light Theme UI Refactor

**What was built:**
A complete visual overhaul of the React frontend from a dark purple/blue theme to a professional light teal/green theme. Zero backend changes.

#### `tailwind.config.js`
Defined a new custom palette:
- **`primary`** — teal scale (`primary-600 = #0d9488`) — used for buttons, links, focus rings, active states, brand colour
- **`secondary`** — green scale (`secondary-600 = #16a34a`) — used for prices, "free shipping" labels, item subtotals
- **`surface`** — white/light-gray shades (white, `#f8fafc`, `#f1f5f9`, `#e2e8f0`) — page backgrounds, card backgrounds, borders
- Custom box shadows: `shadow-card`, `shadow-card-hover` (teal tint), `shadow-btn` (teal glow), `shadow-nav`, `shadow-input` (teal focus ring)

#### `index.css`
- `body` background changed from `bg-dark-900` to `bg-surface-50`
- `.btn-primary` → teal background, white text, teal shadow glow on hover
- `.btn-secondary` → white/teal-50 background, teal border
- `.card` → white background, `shadow-card`, hover lifts with `shadow-card-hover`
- `.input-field` → white background, gray border, teal `focus:border-primary-500` + teal `shadow-input` glow
- `.gradient-text` → teal-to-green gradient

#### Component & Page Changes

| File | Key Visual Changes |
|------|--------------------|
| `Navbar.jsx` | `bg-white` + `shadow-nav` on scroll; teal brand logo; active link `bg-primary-50 text-primary-700` |
| `ProductCard.jsx` | White card; `object-cover` image; green prices; amber stars; coloured category pills; teal CTA |
| `Home.jsx` | Soft teal-50 → white → secondary-50 gradient hero; white feature strip; teal CTA banner with dot-pattern overlay |
| `Login.jsx` | White card on teal-50 gradient; teal icon; teal focus rings |
| `Register.jsx` | Green icon; teal→green password strength bar |
| `Products.jsx` | surface-50 background; white category pills (teal when active) |
| `Cart.jsx` | White line-item cards; green "Free" shipping; teal order total; teal "Ordering as" info box |
| `Orders.jsx` | White collapsible cards; coloured status badges with dot; green item subtotals |
| `main.jsx` | Toast colors: white background, dark text, teal success icon |

---

### Phase 4: Database-per-Service Architecture

**What was built:**
Migrated from a single shared MongoDB container to three dedicated, isolated MongoDB instances — one per backend service.

#### docker-compose.yml changes
- **Removed**: `mongodb` service, `MONGO_INITDB_ROOT_*` env vars, `mongo-data` volume
- **Added**: `auth-db`, `product-db`, `order-db` — each with:
  - `image: mongo:7`
  - Its own named volume (`auth-db-data`, `product-db-data`, `order-db-data`)
  - A healthcheck
  - No authentication (each DB is private to its service — no need for root credentials)
- Each service's `depends_on` updated to point at its own DB only
- Environment variables renamed: `MONGO_URI` → `AUTH_MONGO_URI` / `PRODUCT_MONGO_URI` / `ORDER_MONGO_URI`
- Connection strings simplified: `mongodb://auth-db:27017/authdb` (no `?authSource=admin`)

#### `src/config/db.js` changes (3 services)
Single line change in each — `process.env.MONGO_URI` → the service-specific variable:
```js
// auth-service
await mongoose.connect(process.env.AUTH_MONGO_URI);

// product-service
await mongoose.connect(process.env.PRODUCT_MONGO_URI);

// order-service
await mongoose.connect(process.env.ORDER_MONGO_URI);
```

#### `.env.example` files updated
Each service's example env updated to show the new variable name and a localhost URI for local development.

#### Why database-per-service?
- **Isolation**: A schema migration in product-db cannot affect auth-db
- **Independent scaling**: product-db can be scaled with a replica set without touching auth
- **Security**: auth-db credentials (user passwords) are completely inaccessible to other services at the database level
- **Failure isolation**: if product-db crashes, auth still works

---

### Phase 5: Dockerfile Security Hardening (User Changes)

The user applied multi-stage Dockerfile patterns to all 4 service Dockerfiles and the frontend Dockerfile:

#### Backend services (auth, product, order, notification)
```dockerfile
# Stage 1: Install dependencies
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev   # ci for reproducible installs; omit=dev skips devDeps
COPY . .

# Stage 2: Minimal runtime image
FROM node:20-alpine
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=builder /app /app
RUN chown -R appuser:appgroup /app
USER appuser             # Never run as root
EXPOSE 800x
CMD ["node", "src/index.js"]
```

#### Frontend
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci               # Reproducible install
COPY . .
RUN npm run build        # Outputs to /app/dist

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
USER nginx               # Non-root
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
```

**Benefits:**
- `npm ci` vs `npm install`: `ci` respects `package-lock.json` exactly, giving deterministic, reproducible builds
- Multi-stage: the final image contains no build tools, no npm, no devDependencies — smaller attack surface and smaller image size
- Non-root user: even if an attacker gets RCE in the app, they cannot write to the filesystem or escalate within the container

---

## 5. Service Deep Dives

---

### Auth Service

**Port:** `8001` | **Database:** `auth-db` (MongoDB) | **DB variable:** `AUTH_MONGO_URI`

#### User Model (`src/models/User.js`)
```
User {
  name:      String  (required, trimmed)
  email:     String  (required, unique, lowercased)
  password:  String  (required, min 6 chars — stored as bcrypt hash)
  createdAt: Date    (auto, via timestamps: true)
  updatedAt: Date    (auto)
}
```
A Mongoose `pre('save')` hook runs `bcrypt.genSalt(10)` + `bcrypt.hash()` before every save where `password` is modified. An instance method `comparePassword(candidate)` wraps `bcrypt.compare()`.

#### Auth Flow
```
Register:
  Client → POST /api/auth/register {name, email, password}
         → Validation → Duplicate check → User.create() [pre-save bcrypt hook]
         → jwt.sign({id: user._id}, JWT_SECRET, {expiresIn: "7d"})
         ← 201 {token, user: {id, name, email}}

Login:
  Client → POST /api/auth/login {email, password}
         → User.findOne({email}) → user.comparePassword(password)
         → jwt.sign(...)
         ← 200 {token, user: {id, name, email}}
```

---

### Product Service

**Port:** `8002` | **Database:** `product-db` (MongoDB) | **DB variable:** `PRODUCT_MONGO_URI`

#### Product Model (`src/models/Product.js`)
```
Product {
  name:        String  (required)
  description: String  (required)
  price:       Number  (required, min: 0)
  category:    String  (required)
  image:       String  (URL, default placeholder)
  stock:       Number  (default: 100)
  rating:      Number  (0–5, default: 4.0)
  createdAt:   Date
  updatedAt:   Date
}
```

#### Seeded Products (8 total)
| # | Name | Category | Price | Rating |
|---|------|----------|-------|--------|
| 1 | Wireless Noise-Cancelling Headphones | Electronics | $299.99 | 4.8 |
| 2 | Mechanical Gaming Keyboard | Electronics | $149.99 | 4.6 |
| 3 | Ultra-Wide Curved Monitor | Electronics | $699.99 | 4.7 |
| 4 | Ergonomic Office Chair | Furniture | $449.99 | 4.5 |
| 5 | Stainless Steel Water Bottle | Lifestyle | $34.99 | 4.4 |
| 6 | Smart Fitness Tracker | Electronics | $89.99 | 4.3 |
| 7 | Minimalist Leather Wallet | Accessories | $49.99 | 4.6 |
| 8 | Portable Bluetooth Speaker | Electronics | $79.99 | 4.5 |

Seed is idempotent — runs on startup, inserts only if `Product.countDocuments() === 0`.

---

### Order Service

**Port:** `8003` | **Database:** `order-db` (MongoDB) | **DB variable:** `ORDER_MONGO_URI`

#### Order Model (`src/models/Order.js`)
```
Order {
  userId:          String  (required — JWT sub claim)
  userName:        String
  items: [{                    ← Embedded sub-documents
    productId:  String (required)
    name:       String (required)
    price:      Number (required)
    quantity:   Number (required, min: 1)
    image:      String
  }]
  totalAmount:     Number   (required)
  status:          String   (enum: pending|processing|shipped|delivered|cancelled, default: pending)
  shippingAddress: String   (default: "123 Main St, City, Country")
  createdAt:       Date
  updatedAt:       Date
}
```

> **Note:** The user updated the status enum during the session to include `"success"` and changed the default to `"success"`. The `Orders.jsx` page has a status badge config that covers all states.

#### JWT Validation
Order-service validates JWTs independently of auth-service. It holds the same `JWT_SECRET` and calls `jwt.verify()` locally — no HTTP call needed for auth. This is the standard stateless JWT pattern and means auth-service can be down without affecting order reads/writes.

#### Notification Flow
```
POST /api/orders
  → JWT validated (middleware)
  → Order.create({userId, userName, items, totalAmount, shippingAddress})
  → res.status(201).json(order)       ← Client gets response immediately
  → if (userEmail) notifyUser(userEmail, order._id)   ← Async, fire-and-forget
      → Node http.request to notification-service:8004/notify
      → On error: console.error only, never throws
```

---

### Notification Service

**Port:** `8004` | **Database:** None

#### Email Flow
```
POST /notify {userEmail, orderId}
  → Input validation (400 if missing fields)
  → createTransporter() — nodemailer.createTransport({service: "gmail", auth: {EMAIL_USER, EMAIL_PASS}})
  → transporter.sendMail({from, to: userEmail, subject: "Order Confirmation", text, html})
  → On success: 200 {message: "Notification sent successfully"}
  → On failure: console.error + 200 {message: "Notification logged (email delivery failed)"}
```

The service always returns `200` even on delivery failure. This is intentional:
- The order is already committed to the database
- Email is a "nice to have" — a temporary Gmail outage should not surface as an error on the Orders page
- All failures are logged for observability

#### Gmail Setup (required for actual email delivery)
1. Enable 2-Factor Authentication on your Google account
2. Generate an **App Password**: Google Account → Security → App Passwords
3. Set `EMAIL_USER=your@gmail.com` and `EMAIL_PASS=<16-char app password>` in docker-compose or a `.env` file

---

### Frontend

**Port:** `3000` (Nginx) | **Framework:** React 18 + Vite 5 + Tailwind CSS 3

#### Routing
```
/            → Home.jsx         (public)
/login       → Login.jsx        (public, redirects if logged in)
/register    → Register.jsx     (public, redirects if logged in)
/products    → Products.jsx     (public)
/cart        → Cart.jsx         (ProtectedRoute → /login if no token)
/orders      → Orders.jsx       (ProtectedRoute → /login if no token)
```

#### State Management
No Redux or Zustand — React Context is sufficient for this scale:

**AuthContext** (`src/context/AuthContext.jsx`)
```js
{ user, token, login(token, user), logout(), isLoggedIn }
// Persisted in localStorage across page refreshes
```

**CartContext** (`src/context/CartContext.jsx`)
```js
{ items, addToCart(product), removeFromCart(id), updateQuantity(id, qty), clearCart(), totalItems, totalAmount }
// In-memory: clears on page refresh (by design for this scope)
```

#### API Layer (`src/api/index.js`)
Three Axios instances, one per service. URLs injected via Vite's `import.meta.env` at build time:
```js
VITE_AUTH_SERVICE_URL    → authApi    (base: /api/auth)
VITE_PRODUCT_SERVICE_URL → productApi (base: /api/products)
VITE_ORDER_SERVICE_URL   → orderApi   (base: /api/orders)
```
Fallback to `http://localhost:800x` for local development without Docker.

#### Nginx Config (`nginx.conf`)
```nginx
location / {
    try_files $uri $uri/ /index.html;  # SPA fallback for React Router
}
```
Without this, refreshing on `/products` would return a 404 from Nginx.

---

## 6. API Reference

### Auth Service — `http://localhost:8001`

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| POST | `/api/auth/register` | ✗ | `{name, email, password}` | `{token, user}` |
| POST | `/api/auth/login` | ✗ | `{email, password}` | `{token, user}` |
| GET | `/api/auth/me` | Bearer | — | `{_id, name, email, ...}` |
| GET | `/health` | ✗ | — | `{status: "ok"}` |

### Product Service — `http://localhost:8002`

| Method | Path | Auth | Query / Body | Response |
|--------|------|------|--------------|----------|
| GET | `/api/products` | ✗ | `?category=&sort=` | `[Product]` |
| GET | `/api/products/:id` | ✗ | — | `Product` |
| POST | `/api/products` | ✗ | `{name, description, price, category, ...}` | `Product` |
| PUT | `/api/products/:id` | ✗ | Partial product fields | `Product` |
| DELETE | `/api/products/:id` | ✗ | — | `{message}` |
| GET | `/health` | ✗ | — | `{status: "ok"}` |

### Order Service — `http://localhost:8003`

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| POST | `/api/orders` | Bearer | `{items[], totalAmount, userEmail?, shippingAddress?}` | `Order` |
| GET | `/api/orders/my` | Bearer | — | `[Order]` |
| GET | `/api/orders/:id` | Bearer | — | `Order` |
| GET | `/health` | ✗ | — | `{status: "ok"}` |

### Notification Service — `http://localhost:8004`

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| POST | `/notify` | ✗ | `{userEmail, orderId}` | `{message}` |
| GET | `/health` | ✗ | — | `{status: "ok"}` |

---

## 7. Data Models (MongoDB Schemas)

### User (auth-db)
```js
{
  _id:       ObjectId,
  name:      String,
  email:     String,   // unique index
  password:  String,   // bcrypt hash, never returned in API responses
  createdAt: Date,
  updatedAt: Date
}
```

### Product (product-db)
```js
{
  _id:         ObjectId,
  name:        String,
  description: String,
  price:       Number,
  category:    String,
  image:       String,  // URL
  stock:       Number,
  rating:      Number,  // 0.0–5.0
  createdAt:   Date,
  updatedAt:   Date
}
```

### Order (order-db)
```js
{
  _id:    ObjectId,
  userId: String,     // JWT sub — references auth-db User._id (soft reference)
  userName: String,
  items: [{
    productId: String,    // soft reference to product-db Product._id
    name:      String,
    price:     Number,
    quantity:  Number,
    image:     String
  }],
  totalAmount:     Number,
  status:          "pending" | "processing" | "shipped" | "delivered" | "cancelled",
  shippingAddress: String,
  createdAt:       Date,
  updatedAt:       Date
}
```

> **Soft references:** In microservices, services don't share a database, so there are no Mongoose `populate()` calls across service boundaries. Instead, snapshot data (name, price at time of order) is embedded directly in the Order document. This is the correct pattern — it also means historical orders remain accurate even if a product's price changes later.

---

## 8. Frontend Architecture

### Component Tree
```
App.jsx
├── Navbar.jsx           (always rendered — outside Routes)
└── Routes
    ├── Home.jsx
    │   └── ProductCard.jsx (×4, top-rated)
    ├── Login.jsx
    ├── Register.jsx
    ├── Products.jsx
    │   └── ProductCard.jsx (×N, filtered/sorted)
    ├── Cart.jsx            (Protected)
    └── Orders.jsx          (Protected)
```

### Design System (Tailwind)

**Colour palette:**
| Token | Hex | Usage |
|-------|-----|-------|
| `primary-600` | `#0d9488` | Buttons, links, active states, focus rings, brand |
| `primary-50` | `#f0fdfa` | Active link backgrounds, info boxes, hero tint |
| `secondary-600` | `#16a34a` | Prices, "Free" labels, item subtotals |
| `surface-50` | `#f8fafc` | Page background |
| `surface-0` | `#ffffff` | Card backgrounds |
| `surface-200` | `#e2e8f0` | Borders, dividers |

**Reusable CSS classes:**
- `.btn-primary` — teal button with shadow + hover lift
- `.btn-secondary` — white/teal outline button
- `.btn-ghost` — transparent text button
- `.btn-danger` — red text button (remove, clear cart)
- `.card` — white card with hover elevation
- `.card-flat` — white card without hover effect
- `.input-field` — white input with teal focus ring
- `.gradient-text` — teal-to-green text gradient
- `.section-title` — responsive bold heading

---

## 9. Docker & Infrastructure

### docker-compose.yml — Final State

```
Containers (8 total):
┌─────────────────┬──────────┬──────────────────────────────────┐
│ Container       │ Port     │ Depends On                       │
├─────────────────┼──────────┼──────────────────────────────────┤
│ auth-db         │ internal │ —                                │
│ product-db      │ internal │ —                                │
│ order-db        │ internal │ —                                │
│ auth-service    │ 8001     │ auth-db (healthy)                │
│ product-service │ 8002     │ product-db (healthy)             │
│ notification-sv │ 8004     │ —                                │
│ order-service   │ 8003     │ order-db (healthy) + notif-svc   │
│ frontend        │ 3000     │ auth, product, order services    │
└─────────────────┴──────────┴──────────────────────────────────┘

Volumes (3):
  auth-db-data     → auth-db:/data/db
  product-db-data  → product-db:/data/db
  order-db-data    → order-db:/data/db

Network:
  ecommerce-net (bridge) — all containers share this network
```

### Health Checks
Each MongoDB container has:
```yaml
healthcheck:
  test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
  interval: 10s
  timeout: 5s
  retries: 5
```
Application services use `condition: service_healthy` so they never start before their database is ready, preventing connection-refused startup crashes.

### Nginx (Frontend)
The frontend is not a Vite dev server in Docker — it's a proper production build served by Nginx:
1. `npm run build` in the builder stage produces static files in `/app/dist`
2. Nginx serves them on port 3000
3. The `try_files` directive handles React Router's client-side navigation
4. Gzip compression enabled for JS/CSS assets

---

## 10. Environment Variables Reference

### auth-service
| Variable | Example (Docker) | Description |
|----------|-----------------|-------------|
| `PORT` | `8001` | Listening port |
| `AUTH_MONGO_URI` | `mongodb://auth-db:27017/authdb` | MongoDB connection string |
| `JWT_SECRET` | `supersecretjwtkey...` | JWT signing key (must match order-service) |
| `NODE_ENV` | `development` | Node environment |

### product-service
| Variable | Example (Docker) | Description |
|----------|-----------------|-------------|
| `PORT` | `8002` | Listening port |
| `PRODUCT_MONGO_URI` | `mongodb://product-db:27017/productdb` | MongoDB connection string |
| `NODE_ENV` | `development` | Node environment |

### order-service
| Variable | Example (Docker) | Description |
|----------|-----------------|-------------|
| `PORT` | `8003` | Listening port |
| `ORDER_MONGO_URI` | `mongodb://order-db:27017/orderdb` | MongoDB connection string |
| `JWT_SECRET` | `supersecretjwtkey...` | Must match auth-service |
| `NOTIFICATION_SERVICE_HOST` | `notification-service` | Docker DNS name |
| `NOTIFICATION_SERVICE_PORT` | `8004` | Notification service port |
| `NODE_ENV` | `development` | Node environment |

### notification-service
| Variable | Example | Description |
|----------|---------|-------------|
| `PORT` | `8004` | Listening port |
| `EMAIL_USER` | `you@gmail.com` | Gmail address |
| `EMAIL_PASS` | `abcd efgh ijkl mnop` | Gmail App Password (not account password) |

### frontend
| Variable | Example | Description |
|----------|---------|-------------|
| `VITE_AUTH_SERVICE_URL` | `http://localhost:8001` | Accessed **from the browser** |
| `VITE_PRODUCT_SERVICE_URL` | `http://localhost:8002` | Accessed **from the browser** |
| `VITE_ORDER_SERVICE_URL` | `http://localhost:8003` | Accessed **from the browser** |

> **Important:** Frontend env vars are baked into the JavaScript bundle at build time by Vite. They must use `localhost` (or a public hostname) — not Docker service names — because the browser makes these requests, not the container.

---

## 11. Design Decisions & Rationale

### 1. No API Gateway
A gateway (e.g., Nginx reverse proxy, Kong) was deliberately omitted. At this stage the browser talks directly to each service. The project is scoped for local Docker Compose testing, not production Kubernetes deployment. An API gateway will be added in the Kubernetes phase.

### 2. Stateless JWT — No Token Revocation
JWTs are signed-and-forgotten. There is no Redis blacklist or token refresh mechanism. The 7-day expiry is acceptable for the current scope. In production, a refresh token system would be added.

### 3. Order-Service Validates JWT Locally
Rather than calling `auth-service/api/auth/me` on every request, `order-service` validates the token using the same `JWT_SECRET`. This avoids inter-service latency and a cascading failure if auth-service is down. This is the standard microservices JWT pattern.

### 4. Notification Failure Does Not Fail the Order
The notification is strictly best-effort. An email delivery failure (wrong credentials, Gmail quota) must never surface as a 500 on the order creation endpoint. The fire-and-forget pattern achieves this — `res.status(201)` is sent before the HTTP call to notification-service even begins.

### 5. Snapshot Data in Order Items
Order documents embed `name`, `price`, and `image` at the time of purchase rather than storing only `productId`. This means historical orders remain accurate even if a product is renamed, repriced, or deleted later. This is a deliberate denormalization common in e-commerce.

### 6. No Cross-Service Mongoose References
Each service only has Mongoose models for its own data. `order-service` stores `userId` as a plain `String` (not a Mongoose `ObjectId` reference) because it cannot reach `auth-db`. This is correct microservices design — services are autonomous.

### 7. Database-per-Service (No Shared MongoDB)
The final architecture gives each service complete ownership of its data store. No other service can issue a query against another service's database. This enables:
- Independent schema evolution
- Independent scaling and backup policies
- True service isolation

### 8. Light Theme Over Dark Theme
The UI was refactored to use a teal/green light theme to deliberately differentiate the project from the majority of developer portfolios that default to dark themes. A light theme also tends to be more readable in well-lit presentation environments.

---

## 12. Challenges Faced & How They Were Solved

### Challenge 1: JWT Shared Between Two Services
**Problem:** order-service needs to validate JWTs that were signed by auth-service. How should it get the secret?

**Solution:** Both services read from the same `JWT_SECRET` environment variable. In Docker Compose both are set to the same value. No network call needed. In a production Kubernetes deployment, a Kubernetes Secret would be mounted into both pods.

**Lesson:** Stateless JWTs are designed for this — the signing key is the shared contract, not a shared database or service endpoint.

---

### Challenge 2: Notification Should Never Block Order Creation
**Problem:** If the email takes 3 seconds or times out, the user would be waiting 3+ seconds after clicking "Place Order".

**Solution:** The Node.js `http.request` call is made **after** `res.status(201).json(order)`. By the time `notifyUser()` is called, the HTTP response is already flushing to the client. Node's event loop handles the outbound HTTP request asynchronously without blocking anything.

**Lesson:** In Node.js, you can invoke async work after sending a response — the process stays alive until the event loop is empty.

---

### Challenge 3: Frontend Env Vars vs Docker DNS
**Problem:** Inside Docker, services communicate via `http://notification-service:8004`. But the frontend runs in the **user's browser**, not inside a container — so `http://product-service:8002` would fail (that hostname doesn't resolve on the user's machine).

**Solution:** `VITE_*` env vars are set to `http://localhost:8002` etc. These resolve correctly from any browser on the host machine because Docker exposes those ports via port bindings.

**Lesson:** Always distinguish between server-to-server URLs (Docker DNS, internal) and browser-to-server URLs (must be publicly reachable).

---

### Challenge 4: React Router + Nginx 404 on Refresh
**Problem:** Refreshing on `http://localhost:3000/products` returns a 404 because Nginx looks for a file at `/products` and finds nothing.

**Solution:** `nginx.conf` uses `try_files $uri $uri/ /index.html` — Nginx serves `index.html` for any path that isn't a real file, and React Router handles the rest client-side.

**Lesson:** Every SPA deployed to a web server needs a fallback route rule.

---

### Challenge 5: MongoDB Startup Race Condition
**Problem:** If Node.js services start before MongoDB is ready, `mongoose.connect()` fails immediately and the container exits.

**Solution:** Docker Compose health checks on each MongoDB container (`mongosh --eval "db.adminCommand('ping')"`) combined with `condition: service_healthy` in `depends_on`. Application containers don't start until their database passes the health check.

**Lesson:** `depends_on` without a `condition` only waits for the container to start, not for the service inside to be ready. Always use `condition: service_healthy` for databases.

---

### Challenge 6: Product Seed Running Multiple Times
**Problem:** Every time the product-service container restarts, the seed function runs and would duplicate the 8 products.

**Solution:** Seed function checks `Product.countDocuments()` first — if greater than 0, it skips insertion entirely and logs a message. The seed is idempotent.

**Lesson:** Any initialization script that creates data must be idempotent — checking for existing data before inserting.

---

### Challenge 7: Removing Root Auth from MongoDB
**Problem:** When the shared MongoDB had `MONGO_INITDB_ROOT_USERNAME/PASSWORD`, all connection strings needed `?authSource=admin`. After splitting to separate databases (one per service), the connection strings were simplified — but only because the new containers have no authentication configured.

**Solution:** The three new MongoDB containers (`auth-db`, `product-db`, `order-db`) have no `MONGO_INITDB_ROOT_*` env vars. Since they're only accessible inside the Docker network, no external auth is needed. Connection strings become simpler: `mongodb://auth-db:27017/authdb`.

**Lesson:** Internal service databases don't need network-level authentication if they're not exposed on a host port. (In production with Kubernetes, network policies would restrict access further.)

---

## 13. How to Run

### Prerequisites
- Docker Desktop installed and running
- Ports available: `3000, 8001, 8002, 8003, 8004`

### First-Time Setup

```bash
# 1. Navigate to the project
cd final_project

# 2. (Optional) Set email credentials for notifications
#    Create a .env file in the root:
echo "EMAIL_USER=your@gmail.com" > .env
echo "EMAIL_PASS=your_app_password" >> .env

# 3. Build and start all services
docker-compose up --build

# First run takes ~3-5 minutes (downloading images, building)
# Subsequent runs are much faster (layers cached)
```

### Access Points

| URL | What you see |
|-----|-------------|
| `http://localhost:3000` | ShopNova frontend |
| `http://localhost:8001/health` | Auth service health |
| `http://localhost:8002/health` | Product service health |
| `http://localhost:8003/health` | Order service health |
| `http://localhost:8004/health` | Notification service health |

### Quick Functional Test (curl)

```bash
# Register a user
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","password":"pass1234"}'

# Login and grab token
TOKEN=$(curl -s -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"pass1234"}' | \
  python -c "import sys,json; print(json.load(sys.stdin)['token'])")

# Browse products
curl http://localhost:8002/api/products

# Place an order
curl -X POST http://localhost:8003/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "items":[{"productId":"abc","name":"Headphones","price":299.99,"quantity":1}],
    "totalAmount":299.99,
    "userEmail":"jane@example.com"
  }'

# View your orders
curl -H "Authorization: Bearer $TOKEN" http://localhost:8003/api/orders/my
```

### Stopping & Cleanup

```bash
# Stop (keeps volumes/data)
docker-compose down

# Stop and wipe all databases (fresh start)
docker-compose down -v

# Rebuild a single service after code change
docker-compose up --build auth-service
```

---

*Documentation generated April 23, 2026 — covers the complete ShopNova session from initial scaffold through database-per-service refactor.*
