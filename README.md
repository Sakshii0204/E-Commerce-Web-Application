# NovaMart — Full-Stack E-Commerce Web Application

> **QSkill — 1 Month Full-Stack MERN Internship (Task 1: E-Commerce Web Application)**  
> **Final Phase (Phase 5) Completed — Production Ready**  
> **Repository:** [https://github.com/Sakshii0204/E-Commerce-Web-Application](https://github.com/Sakshii0204/E-Commerce-Web-Application)

---

## 1. Project Overview

NovaMart is an enterprise-grade full-stack e-commerce web application built on the MERN stack (MongoDB, Express.js, React, Node.js) with Vite and Tailwind CSS. The application implements complete customer storefront and merchant back-office workflows, including HttpOnly JWT session management, server-side catalog search and multi-facet filtering, dynamic persistent carts, authoritative Cash on Delivery (COD) checkout, and a controlled order status finite-state machine with atomic inventory restoration upon order cancellation.

---

## 2. 5-Phase Development Roadmap

| Phase | Title | Focus Area | Status |
|---|---|---|---|
| **Phase 1** | **Project Foundation + Complete Frontend UI** | Design System, Component Library, Responsive Navigation, Routing | **Completed** ✅ |
| **Phase 2** | **Backend + Database + Authentication** | Express REST API, MongoDB/Mongoose, JWT HttpOnly Cookies, RBAC | **Completed** ✅ |
| **Phase 3** | **Product System + Search/Filtering + Admin Products** | Real Catalog CRUD, Server-Side Filtering/Search/Pagination, Soft-Deletes | **Completed** ✅ |
| **Phase 4** | **Cart + Checkout + Customer Orders** | Persistent Cart, Authoritative Pricing, Stock Safety, Customer Orders | **Completed** ✅ |
| **Phase 5** | **Admin Orders + Polish + Final QA + Deployment** | Admin Order Lifecycle, Inventory Restoration, Dashboard Analytics, Hardening | **Completed** ✅ |

---

## 3. Key Features

### Customer Storefront
- **Authentication & Security:** Register and login with bcrypt password hashing; session maintained via secure HttpOnly cookie JWT.
- **Product Catalog:** Real-time search, category and brand filters, price slider, in-stock toggle, sorting (newest, price asc/desc), and server-side pagination.
- **Product Details:** Live stock indicators (Sold Out, Low Stock, In Stock), image preview, and detailed descriptions.
- **Persistent Shopping Cart:** 1-to-1 customer database cart that survives page reloads and logins; recalculates against live catalog prices.
- **Authoritative Checkout:** Server-validated order creation with server-computed shipping (Free for orders >= $100, else $15).
- **Cash on Delivery (COD):** Secure non-credit card payment method with server-side settlement upon delivery.
- **Customer Order Tracking:** Protected order history and detailed order pages with immutable purchase snapshots.

### Admin Operations Portal
- **Operations Dashboard:** Live MongoDB aggregation of catalog counts, low-stock warnings, order status breakdown, and verified delivered sales revenue.
- **Product Management:** Full CRUD capabilities for adding, updating, and soft-deleting products with inventory stock management.
- **Order Management:** Paginated, status-filtered, and searchable list of all store orders.
- **Controlled Status Lifecycle:** Strict server-enforced state machine:
  - `PLACED` ➔ `PROCESSING` or `CANCELLED`
  - `PROCESSING` ➔ `SHIPPED` or `CANCELLED`
  - `SHIPPED` ➔ `DELIVERED` (marks COD payment as `PAID`)
  - `DELIVERED` & `CANCELLED` are terminal states.
- **Inventory Restoration on Cancellation:** Cancelling an order restores all purchased item quantities to catalog inventory exactly once (`stockRestored` idempotency guard).

---

## 4. Technology Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Lucide React, Context API
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT) in HttpOnly, SameSite cookies, BcryptJS
- **Validation:** Zod schemas on all endpoints
- **Security:** Helmet, CORS with credentialed origin whitelist, in-memory auth rate limiting
- **Testing:** Vitest v3.2.7, Supertest

---

## 5. System Architecture

```
React / Vite Storefront & Admin Portal
        │
        ├── Centralized API Client (api/client.js)
        │       │ (credentials: 'include' for HttpOnly JWT Cookie)
        │       ▼
        ├── Express.js REST API Layer (PORT 5000 / Process Environment)
        │       │
        │       ├── Global Security Middlewares:
        │       │   ├── Helmet (HTTP Security Headers)
        │       │   ├── CORS (Whitelisted CLIENT_URL)
        │       │   ├── Auth Rate Limiter
        │       │   ├── Cookie Parser & JSON Parser (10kb body limit)
        │       │
        │       ├── Route Guards:
        │       │   ├── authenticate (JWT verification & User existence check)
        │       │   └── authorize('ADMIN') (Role-Based Access Control)
        │       │
        │       ├── Business Controllers:
        │       │   ├── /api/auth     ──► AuthController    ──► AuthService    ──► UserRepository
        │       │   ├── /api/products ──► ProductController ──► ProductService ──► ProductRepository
        │       │   ├── /api/cart     ──► CartController    ──► CartService    ──► CartRepository
        │       │   └── /api/orders   ──► OrderController   ──► OrderService   ──► OrderRepository
        │       │
        │       └── Centralized Error & 404 Handler
        │
        ▼
   MongoDB Database (novamart / novamart_test)
        ├── users (Bcrypt hashes, CUSTOMER / ADMIN roles)
        ├── products (Catalog items, categories, stock, soft-delete)
        ├── carts (Customer-isolated persistent carts)
        └── orders (Snapshots, audit timestamps, status lifecycle)
```

---

## 6. Project Structure

```
E-Commerce-Web-Application/
├── backend/
│   ├── scripts/
│   │   ├── seedAdmin.js          # Admin user seed script
│   │   └── seedProducts.js       # Product catalog seed script
│   ├── src/
│   │   ├── config/               # Environment & database configuration
│   │   ├── controllers/          # Request handlers
│   │   ├── middleware/           # Auth, RBAC, error, notFound, rateLimiter, validate
│   │   ├── models/               # User, Product, Cart, Order Mongoose models
│   │   ├── repositories/         # Database access layer
│   │   ├── routes/               # Modular API routes
│   │   ├── services/             # Core business & transactional logic
│   │   ├── utils/                # AppError, JWT, pricing, orderNumber
│   │   ├── validators/           # Zod validation schemas
│   │   ├── app.js                # Express application configuration
│   │   └── server.js             # Server entry point
│   ├── tests/                    # Automated backend test suites
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/                  # API client functions
│   │   ├── components/           # Reusable UI & layout components
│   │   ├── context/              # Auth, Product, Cart, Order Contexts
│   │   ├── layouts/              # MainLayout, AdminLayout
│   │   ├── pages/                # Storefront & Admin pages
│   │   ├── routes/               # AppRoutes & protected route guards
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── docs/
│   ├── architecture.md           # System architecture specification
│   ├── api.md                    # REST API endpoint reference
│   └── testing.md                # QA & test suite report
└── README.md
```

---

## 7. Environment Variables

### Backend (`backend/.env`)
```ini
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/novamart
JWT_SECRET=your_secure_random_jwt_secret_min32chars
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
ADMIN_NAME=Admin Manager
ADMIN_EMAIL=admin@novamart.com
ADMIN_PASSWORD=YourAdminPassword123!
```

### Frontend (`frontend/.env`)
```ini
VITE_APP_NAME=NovaMart
VITE_API_URL=http://localhost:5000/api
```

---

## 8. Local Setup & Seeding

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB instance running locally or via MongoDB Atlas

### 1. Backend Installation & Seeding
```bash
cd backend
npm install

# Seed default administrator account
npm run seed:admin

# Seed 24 categorized catalog products
npm run seed:products

# Run all 86 automated regression & admin tests
npm test

# Start backend development server
npm run dev
```

### 2. Frontend Installation & Build
```bash
cd frontend
npm install

# Lint verification
npm run lint

# Production build
npm run build

# Start frontend development server
npm run dev
```

---

## 9. Automated Testing Summary

NovaMart maintains an automated backend test suite with **86 passed tests** and **0 failures**:

```
Test Files  5 passed (5)
     Tests  86 passed (86)
- tests/auth.test.js:        17 passed (Registration, Login, RBAC, Cookies)
- tests/product.test.js:     25 passed (Catalog, Search, Filters, Admin CRUD)
- tests/cart.test.js:        14 passed (Cart isolation, Live pricing, Stock guards)
- tests/order.test.js:       11 passed (Authoritative pricing, Stock decrement, Security)
- tests/adminOrder.test.js:  19 passed (Lifecycle state machine, Cancellation restore, Dashboard)
```

Run test suite:
```bash
cd backend
npm test -- --run
```

---

## 10. Production Deployment Guide

NovaMart is structured for streamlined deployment on modern cloud platforms:

### Backend Deployment (e.g. Render / Railway)
1. Set the root directory to `backend`.
2. Build Command: `npm install`
3. Start Command: `npm start`
4. Configure Environment Variables:
   - `NODE_ENV=production`
   - `PORT=5000` (or host-assigned port)
   - `MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/novamart?retryWrites=true&w=majority`
   - `JWT_SECRET=<strong-random-key>`
   - `CLIENT_URL=https://<your-frontend-domain>`

### Frontend Deployment (e.g. Vercel / Netlify)
1. Set the root directory to `frontend`.
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Configure Environment Variable:
   - `VITE_API_URL=https://<your-backend-domain>/api`
5. Configure SPA rewrite rules (`vercel.json` or `_redirects`) to redirect all routes to `index.html`.

---

## 11. Final Status

- **Project Status:** **COMPLETED**
- **Internship Milestone:** QSkill 1-Month Internship — Task 1 Final Submission Ready.
