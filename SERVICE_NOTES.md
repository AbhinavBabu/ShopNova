# ShopNova — Simple Service Notes

> Plain-English notes on what each service does and how it works.  
> Think of this as your quick-reference cheat sheet.

---

## The Big Picture (Read This First)

ShopNova is broken into **5 separate programs** (called microservices) that all run at the same time.
Each one does exactly one job and nothing else.

```
Your Browser
     │
     ▼
 Frontend  ──────► Auth Service     (handles login & accounts)
     │       ├───► Product Service  (handles products)
     │       └───► Order Service    (handles orders)
     │                   │
     │                   ▼
     │           Notification Service  (sends emails)
     │
     ▼
Everything talks over the internet using normal HTTP requests (like your browser does with any website)
```

Each service has its **own MongoDB database** so they never interfere with each other.

---

## 1. Frontend

**What it is:** The website the user actually sees and clicks around on.

**Tech:** React (JavaScript), Tailwind CSS (styling), Vite (build tool)

**What it does:**
- Shows 6 pages: Home, Login, Register, Products, Cart, Orders
- Lets users browse products, add them to a cart, checkout, and see their order history
- Handles login/logout and remembers who you are (saves your login token in the browser)
- Talks to the backend services by sending HTTP requests (using Axios)

**How it works — step by step:**

1. User opens `http://localhost:3000` in their browser
2. Nginx (a web server) serves the React app as HTML + JavaScript files
3. React loads in the browser and takes over — showing pages without full page reloads
4. When the user clicks "Login", React sends a request to `http://localhost:8001/api/auth/login`
5. When the user clicks "Add to Cart", the item is saved in memory (no server needed for cart)
6. When the user clicks "Place Order", React sends the cart items to `http://localhost:8003/api/orders`

**Key files:**
- `src/api/index.js` → where all the HTTP calls to backend services live
- `src/context/AuthContext.jsx` → stores who is logged in (saves token to `localStorage`)
- `src/context/CartContext.jsx` → stores what's in the cart (in memory only)
- `src/pages/` → one file per page (Home, Login, Register, Products, Cart, Orders)
- `src/components/Navbar.jsx` → the top navigation bar
- `src/components/ProductCard.jsx` → the individual product boxes in the grid

**Simple analogy:** The frontend is like the shop floor — what customers see and interact with. It has no business logic of its own; it just displays information and passes requests to the back.

---

## 2. Auth Service

**What it is:** The service that handles user accounts, registration, and login.

**Port:** `8001` | **Database:** `auth-db` (its own private MongoDB)

**What it does:**
- Lets a new user register with a name, email, and password
- Lets an existing user log in
- Returns a **JWT token** (a special string) when login/register succeeds
- The JWT token proves "I am this user" for future requests

**How it works — step by step:**

**Registration:**
1. User submits name, email, password via the frontend form
2. Auth service checks: is this email already registered? If yes → error
3. Password is **hashed** using bcrypt (turned into a scrambled string so we never store the real password)
4. User record saved to `auth-db`
5. A JWT token is created and sent back to the browser
6. Browser saves the token in `localStorage`

**Login:**
1. User submits email + password
2. Auth service finds the user in `auth-db` by email
3. The submitted password is compared against the stored hash using bcrypt
4. If it matches → a new JWT token is created and returned
5. If it doesn't match → "Invalid credentials" error

**What is a JWT token?**
- It's a long string like: `eyJhbGciOiJIUzI1NiJ9...`
- It contains encoded information: the user's ID and when it expires (7 days)
- It's signed with a secret key — so nobody can fake one
- It's sent with every future request so the server knows who is asking

**Key files:**
- `src/models/User.js` → defines what a user record looks like in MongoDB
- `src/controllers/authController.js` → the actual logic for register and login
- `src/middleware/authMiddleware.js` → checks if a JWT token is valid on protected routes

**Simple analogy:** Auth service is like a bouncer at a club. When you register, they put you on the list. When you login, they check your ID and give you a wristband (the JWT). The wristband proves you got in legitimately — show it at the door and no one needs to check the list again.

---

## 3. Product Service

**What it is:** The service that manages all the products in the store.

**Port:** `8002` | **Database:** `product-db` (its own private MongoDB)

**What it does:**
- Stores all product information (name, price, description, image, stock, rating, category)
- Lets anyone browse products (no login needed)
- Supports filtering by category and sorting by price or rating
- Automatically fills the database with 8 sample products when it first starts up

**How it works — step by step:**

**When the service starts:**
1. Connects to `product-db`
2. Immediately checks: are there any products in the database?
3. If 0 products → inserts 8 sample products (headphones, keyboard, chair, etc.)
4. If products already exist → skips the insert (so it never duplicates)

**When a user browses products:**
1. Frontend sends `GET http://localhost:8002/api/products`
2. Product service queries `product-db` and returns all products as JSON
3. Supports optional filters: `?category=Electronics` or `?sort=price_asc`
4. Frontend renders the products in a grid

**The 8 seeded products:**
| Product | Category | Price |
|---------|----------|-------|
| Wireless Headphones | Electronics | $299.99 |
| Gaming Keyboard | Electronics | $149.99 |
| Ultra-Wide Monitor | Electronics | $699.99 |
| Ergonomic Chair | Furniture | $449.99 |
| Water Bottle | Lifestyle | $34.99 |
| Fitness Tracker | Electronics | $89.99 |
| Leather Wallet | Accessories | $49.99 |
| Bluetooth Speaker | Electronics | $79.99 |

**Key files:**
- `src/models/Product.js` → defines what a product record looks like
- `src/controllers/productController.js` → logic for getting, creating, updating, deleting products
- `src/seed/products.js` → the 8 sample products + the logic to insert them on startup

**Simple analogy:** Product service is like the store's inventory system. It knows what's on the shelves, how much everything costs, and how many are in stock. Any cashier (other service or browser) can ask it "what do you have?" and it answers.

---

## 4. Order Service

**What it is:** The service that handles placing orders and viewing order history.

**Port:** `8003` | **Database:** `order-db` (its own private MongoDB)

**What it does:**
- Creates a new order when a user checks out their cart
- Saves the order with all the items, prices, and the user's ID
- Returns a user's past orders when they visit the Orders page
- After saving an order, automatically tells the Notification Service to send a confirmation email

**How it works — step by step:**

**Placing an order:**
1. User clicks "Place Order" on the Cart page
2. Frontend sends a `POST` request to `http://localhost:8003/api/orders`
3. The request includes:
   - A JWT token in the header (to prove who is placing the order)
   - The list of items in the cart
   - The total price
   - The user's email (needed for the confirmation email)
4. Order service checks the JWT token — is it valid? Who does it belong to?
5. Order is saved to `order-db`
6. **Response is sent back to the browser immediately** (the user sees "Order placed!")
7. *After* the response is sent, order service quietly contacts the Notification Service to send a confirmation email — the user doesn't wait for this

**Viewing past orders:**
1. User visits the Orders page
2. Frontend sends `GET http://localhost:8003/api/orders/my` with the JWT token
3. Order service extracts the user ID from the token
4. Finds all orders in `order-db` where `userId` matches → returns them newest first

**How it validates the JWT (without calling Auth Service):**
- Both auth-service and order-service have the **same secret key** (`JWT_SECRET`)
- Order service can verify the JWT by itself — it doesn't need to ask auth-service
- This means: even if auth-service is down, you can still place and view orders

**Key files:**
- `src/models/Order.js` → defines what an order looks like (includes embedded list of items)
- `src/controllers/orderController.js` → the logic for creating orders + calling notification service
- `src/middleware/authMiddleware.js` → validates the JWT token on every request

**Simple analogy:** Order service is like the cashier. They take your basket of items, total it up, write the receipt, and hand it to you. As you walk away, they quietly call the stockroom (notification service) to tell them an order went through.

---

## 5. Notification Service

**What it is:** The service that sends confirmation emails to customers after they place an order.

**Port:** `8004` | **Database:** None (no database needed)

**What it does:**
- Listens for a "Hey, send an email!" message from the Order Service
- Sends an email to the customer saying their order was placed
- If sending fails (wrong password, Gmail down, etc.) → it logs the error but does NOT crash or cause the order to fail

**How it works — step by step:**

1. Order Service sends a `POST http://notification-service:8004/notify` with:
   ```json
   { "userEmail": "jane@example.com", "orderId": "abc123" }
   ```
2. Notification service receives this
3. Creates a connection to Gmail's email server (SMTP) using the stored credentials
4. Sends an email:
   - **To:** the user's email
   - **Subject:** "Order Confirmation"
   - **Body:** "Your order abc123 has been successfully placed."
5. If email sends successfully → logs "Email sent" and returns `200 OK`
6. If email fails → logs the error and still returns `200 OK` (so the order isn't affected)

**Why does it still return 200 when it fails?**

Because the order is already saved in the database — it happened! The email is just a nice notification. If Gmail is having a bad day, the customer's order should NOT be cancelled or show an error. The failure is logged so a developer can investigate, but the user experience stays clean.

**Setting it up (to actually send emails):**
- You need a Gmail account
- You must create an **App Password** in Google settings (not your regular password)
- Set `EMAIL_USER` and `EMAIL_PASS` in your environment

**Key files:**
- `src/config/mailer.js` → creates the Gmail connection using Nodemailer
- `src/controllers/notificationController.js` → receives the request, sends the email, handles errors
- `.env.example` → shows what environment variables you need to set

**Simple analogy:** Notification service is like the post office. The cashier (order service) hands them a letter to deliver. If the post office successfully delivers it — great. If something goes wrong with delivery — it's logged, but the original sale at the shop already happened and isn't reversed.

---

## How the Services Talk to Each Other

Here's the complete journey of a user placing an order:

```
Step 1 — User clicks "Place Order" in the browser
         └─► Browser sends POST to order-service:8003/api/orders

Step 2 — Order service checks the JWT token
         └─► Uses the secret key to verify "yes, this is a real logged-in user"

Step 3 — Order saved to order-db
         └─► MongoDB stores the order permanently

Step 4 — Order service replies to the browser: "201 Created"
         └─► The user sees "Order placed successfully! 🎉"

Step 5 — (Quietly, after replying) Order service contacts notification-service
         └─► POST to notification-service:8004/notify {userEmail, orderId}

Step 6 — Notification service sends email via Gmail
         └─► User receives "Order Confirmation" in their inbox
```

Note: Steps 1–4 and Step 5–6 are **independent**. The user never waits for the email to send.

---

## The Databases (One Per Service)

Each service has its own MongoDB. They cannot see each other's data.

| Database | Used by | Stores |
|----------|---------|--------|
| `auth-db` | auth-service | User accounts and hashed passwords |
| `product-db` | product-service | Product catalog (the 8 items + any new ones) |
| `order-db` | order-service | All customer orders |

**Why separate databases?**
- If product-db crashes, login still works
- If one database needs to be backed up or scaled differently, you can do it independently
- No service can accidentally read or corrupt another service's data

---

## Security Highlights

| What | How |
|------|-----|
| Passwords | Never stored as plain text — always hashed with bcrypt before saving |
| Login tokens | JWT — digitally signed, expires in 7 days, can't be faked without the secret key |
| Email credentials | Stored in environment variables — never written in the code |
| Containers | Run as a non-root user inside Docker — limits damage if something goes wrong |
| MongoDB | No exposed host ports for the three service databases — only accessible inside Docker |

---

## Quick Reference — Ports

| Service | Port | What's there |
|---------|------|-------------|
| Frontend | `3000` | The website |
| Auth Service | `8001` | Login & Register API |
| Product Service | `8002` | Products API |
| Order Service | `8003` | Orders API |
| Notification Service | `8004` | Email trigger API |

---

## One-Line Summary of Each Service

| Service | One Line |
|---------|----------|
| **Frontend** | The website users interact with |
| **Auth Service** | Handles signup, login, and proves who you are with a token |
| **Product Service** | Stores and serves the product catalog; seeds sample data automatically |
| **Order Service** | Saves orders to the database and triggers confirmation emails |
| **Notification Service** | Sends order confirmation emails via Gmail |
