# ShopNova — Microservices E-Commerce Platform

A production-structured, Docker-ready e-commerce application built with a React frontend and three independent Node.js/Express microservices, backed by MongoDB.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Docker Network                       │
│                   (ecommerce-net)                        │
│                                                          │
│  ┌──────────┐   ┌──────────────┐   ┌───────────────┐   │
│  │ Frontend │   │ auth-service │   │product-service│   │
│  │  :3000   │   │    :8001     │   │    :8002      │   │
│  └────┬─────┘   └──────┬───────┘   └───────┬───────┘   │
│       │                │                   │            │
│       │         ┌──────────────┐   ┌───────────────┐   │
│       └────────►│ order-service│   │   MongoDB     │   │
│                 │    :8003     │   │    :27017     │   │
│                 └──────┬───────┘   └───────────────┘   │
│                        └───────────────────────────────►│
└─────────────────────────────────────────────────────────┘
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | React + Vite + Tailwind CSS |
| Auth Service | 8001 | Register, Login, JWT |
| Product Service | 8002 | CRUD + seeded products |
| Order Service | 8003 | Create & fetch user orders |
| MongoDB | 27017 | Shared database server |

---

## Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Ports 3000, 8001, 8002, 8003, 27017 available

### Run with Docker Compose

```bash
# Clone / navigate to the project
cd final_project

# Build and start all services (first run: ~3-4 minutes)
docker-compose up --build

# Run in detached mode
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (fresh start)
docker-compose down -v
```

### Access the Application

| URL | Description |
|-----|-------------|
| http://localhost:3000 | Frontend (React App) |
| http://localhost:8001/health | Auth Service health |
| http://localhost:8002/health | Product Service health |
| http://localhost:8003/health | Order Service health |

---

## API Reference

### Auth Service (port 8001)

```
POST /api/auth/register   Body: { name, email, password }
POST /api/auth/login      Body: { email, password }
GET  /api/auth/me         Header: Authorization: Bearer <token>
GET  /health
```

### Product Service (port 8002)

```
GET    /api/products          Query: category, sort (price_asc|price_desc|rating)
GET    /api/products/:id
POST   /api/products          Body: { name, description, price, category, image, stock, rating }
PUT    /api/products/:id
DELETE /api/products/:id
GET    /health
```

### Order Service (port 8003)

```
POST /api/orders        Body: { items[], totalAmount }   Header: Bearer token
GET  /api/orders/my                                      Header: Bearer token
GET  /api/orders/:id                                     Header: Bearer token
GET  /health
```

---

## Folder Structure

```
final_project/
├── docker-compose.yml
├── README.md
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── postcss.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── api/index.js
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── CartContext.jsx
│       ├── components/
│       │   ├── Navbar.jsx
│       │   └── ProductCard.jsx
│       └── pages/
│           ├── Home.jsx
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── Products.jsx
│           ├── Cart.jsx
│           └── Orders.jsx
├── auth-service/
│   ├── Dockerfile
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── index.js
│       ├── config/db.js
│       ├── models/User.js
│       ├── controllers/authController.js
│       ├── routes/authRoutes.js
│       └── middleware/authMiddleware.js
├── product-service/
│   ├── Dockerfile
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── index.js
│       ├── config/db.js
│       ├── models/Product.js
│       ├── controllers/productController.js
│       ├── routes/productRoutes.js
│       └── seed/products.js
└── order-service/
    ├── Dockerfile
    ├── package.json
    ├── .env.example
    └── src/
        ├── index.js
        ├── config/db.js
        ├── models/Order.js
        ├── controllers/orderController.js
        ├── routes/orderRoutes.js
        └── middleware/authMiddleware.js
```

---

## Manual API Testing (curl)

```bash
# Register
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get products
curl http://localhost:8002/api/products

# Create order (replace <TOKEN> with JWT from login)
curl -X POST http://localhost:8003/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"items":[{"productId":"abc","name":"Test","price":29.99,"quantity":1}],"totalAmount":29.99}'
```

---

## Environment Variables

All secrets are passed via docker-compose environment. In production, use Docker secrets or a vault.

| Variable | Service | Description |
|----------|---------|-------------|
| `MONGO_URI` | All backends | MongoDB connection string |
| `JWT_SECRET` | auth-service, order-service | JWT signing key |
| `PORT` | All backends | Listening port |
| `VITE_*_URL` | frontend | Backend service URLs |

---

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS 3, React Router v6, Axios
- **Backend**: Node.js 20, Express 4, Mongoose 8, JWT, bcryptjs
- **Database**: MongoDB 7
- **Infrastructure**: Docker, Docker Compose, Nginx (frontend serving)
