# NovaMart Full-Stack E-Commerce — Final Architecture Document

## Overview
- **Project:** NovaMart Full-Stack E-Commerce Web Application
- **Internship:** QSkill — 1 Month Internship (Final Phase Completed)
- **Stack:** MERN (MongoDB, Express.js, React, Node.js) + Vite + Tailwind CSS
- **Status:** **PHASE 5 COMPLETED — PRODUCTION READY**

---

## 5-Phase Development Roadmap

| Phase | Title | Focus Area | Status |
|---|---|---|---|
| **Phase 1** | **Project Foundation + Complete Frontend UI** | UI/UX Design System, Component Library, Routing, Mock State | **Completed** |
| **Phase 2** | **Backend + Database + Authentication** | Express REST API, MongoDB/Mongoose, JWT HttpOnly Cookie, RBAC | **Completed** |
| **Phase 3** | **Product System + Search/Filtering + Admin Products** | Real Catalog CRUD, Server-Side Filtering/Search/Pagination, Soft-Deletes | **Completed** |
| **Phase 4** | **Cart + Checkout + Customer Orders** | Persistent Cart, Authoritative Pricing, Stock Safety, Customer Orders | **Completed** |
| **Phase 5** | **Admin Orders + Polish + Final QA + Deployment** | Admin Order Lifecycle, Inventory Restoration, Dashboard Analytics, Hardening | **Completed** |

---

## Complete System Architecture

```
React / Vite Storefront & Admin Portal
        │
        ├── Centralized API Client (api/client.js)
        │       │ (credentials: 'include' for HttpOnly JWT Cookie)
        │       ▼
        ├── Express.js REST API Layer (PORT 5000 / Environment Bind)
        │       │
        │       ├── Global Security Middlewares:
        │       │   ├── Helmet (HTTP Security Headers)
        │       │   ├── CORS (Strict CLIENT_URL Whitelist with credentials)
        │       │   ├── In-Memory Auth Rate Limiter
        │       │   ├── Cookie Parser & JSON Parser (10kb payload limit)
        │       │
        │       ├── Route Guards:
        │       │   ├── authenticate (JWT verification & User existence check)
        │       │   └── authorize('ADMIN') (Role-Based Access Control)
        │       │
        │       ├── Business Domains:
        │       │   ├── /api/auth     ──► AuthController    ──► AuthService    ──► UserRepository    ──► User Model
        │       │   ├── /api/products ──► ProductController ──► ProductService ──► ProductRepository ──► Product Model
        │       │   ├── /api/cart     ──► CartController    ──► CartService    ──► CartRepository    ──► Cart Model
        │       │   └── /api/orders   ──► OrderController   ──► OrderService   ──► OrderRepository   ──► Order Model
        │       │
        │       └── Centralized Error & 404 Handler (Standard JSON responses)
        │
        ▼
   MongoDB Database (novamart / novamart_test)
        ├── users (Bcrypt password hashes, roles: CUSTOMER, ADMIN)
        ├── products (Catalog items, categories, brands, stock counters, isActive soft-delete)
        ├── carts (1-to-1 customer persistent carts, dynamic item resolution)
        └── orders (Immutable item snapshots, order status lifecycle, payment status)
```

---

## Controlled Order Status Lifecycle

NovaMart enforces a strict server-side finite-state machine (FSM). Arbitrary backward or illegal transitions are blocked with 400 Bad Request:

```
[PLACED] ───────┬────────► [PROCESSING] ────────► [SHIPPED] ────────► [DELIVERED] (Terminal)
   │            │                 │                                         │
   │            │                 │                                  COD Payment Set to PAID
   │            │                 │                                  Delivered Timestamp Recorded
   ▼            ▼                 ▼
[CANCELLED] ◄───┴─────────────────┘
   │
   ├── Stock Restored to Inventory (+quantity for each item)
   ├── stockRestored Flag Marked True (Idempotency Guard)
   └── Terminal State (No further transitions allowed)
```

### Transition Matrix
- **`PLACED`** ➔ `PROCESSING` or `CANCELLED`
- **`PROCESSING`** ➔ `SHIPPED` or `CANCELLED`
- **`SHIPPED`** ➔ `DELIVERED`
- **`DELIVERED`** ➔ *Terminal* (No transitions allowed)
- **`CANCELLED`** ➔ *Terminal* (No transitions allowed)

---

## Inventory Consistency & Restoration Strategy

1. **Order Placement Stock Decrement:**
   - Atomic conditional update: `{ _id: productId, stock: { $gte: quantity } }` with `{ $inc: { stock: -quantity } }`.
   - Guaranteed against overselling and negative inventory.
   - If a replica set is active, executes within a MongoDB multi-document transaction (`session`).
   - If standalone MongoDB is active, uses automatic compensating rollback on failure.
2. **Order Cancellation Stock Restoration:**
   - When an order transitions to `CANCELLED` (from `PLACED` or `PROCESSING`), each purchased item quantity is incremented back into product stock (`$inc: { stock: quantity }`).
   - Guarded by the `stockRestored: Boolean` flag on the `Order` document, preventing duplicate restorations.
   - Repeated cancellation attempts from the terminal state return 400 Bad Request.

---

## Security Architecture

- **Authentication:** HttpOnly, SameSite, Secure JSON Web Tokens stored in browser cookies (no insecure localStorage tokens).
- **Authorization:** Backend role validation (`CUSTOMER` vs `ADMIN`). Admin routes reject non-admin users with 403 Forbidden.
- **Input Validation:** Zod schemas validate request bodies, query parameters, and URL parameters on all sensitive routes.
- **Rate Limiting:** Auth endpoints (`/api/auth/register`, `/api/auth/login`) are protected by an in-memory rate limiter against brute-force attacks.
- **CORS Protection:** Configured with `credentials: true` and strict `origin: env.CLIENT_URL`.
- **Environment Isolation:** Secrets (`JWT_SECRET`, database URIs) are loaded strictly from environment variables and never checked into source control.
