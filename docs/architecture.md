# E-Commerce Web Application — Architecture Document

## Overview
- **Project:** Full-Featured MERN E-Commerce Web Application (NovaMart)
- **Internship:** QSkill — 1 Month Internship
- **Current Phase:** Phase 4 (Cart + Checkout + Order Processing) — Completed

---

## 5-Phase Development Roadmap

| Phase | Title | Focus Area | Status |
|---|---|---|---|
| **Phase 1** | **Project Foundation + Complete Frontend UI** | UI/UX, Component Architecture, Mock State, Routing | **Completed** |
| **Phase 2** | **Backend + Database + Authentication** | Express.js, MongoDB, Mongoose, JWT & Bcrypt Auth, RBAC | **Completed** |
| **Phase 3** | **Product System + Search/Filtering + Admin Products** | Real Product CRUD, MongoDB Catalog, Filtering, Seeding | **Completed** |
| **Phase 4** | **Cart + Checkout + Order Processing** | Persistent Cart, Order Checkout, Inventory Management | **Completed (Current)** |
| **Phase 5** | **Admin Orders + Polish + Deployment** | Full Admin Controls, Testing, Vercel & Render Deployment | Upcoming |

---

## Current Architecture Specification

```
React Storefront & Admin UI
        │
        ├─ Authentication API Client (api/authApi.js)
        │       │
        │       ▼
        │   /api/auth ──► AuthService ──► UserRepository ──► User Model ──► MongoDB
        │
        ├─ Product API Client (api/productApi.js)
        │       │
        │       ▼
        │   /api/products ──► ProductService ──► ProductRepository ──► Product Model ──► MongoDB
        │
        ├─ Cart API Client (api/cartApi.js)
        │       │
        │       ▼
        │   /api/cart ──► CartService ──► CartRepository ──► Cart Model ──► MongoDB
        │
        └─ Order API Client (api/orderApi.js)
                │
                ▼
            /api/orders ──► OrderService ──► OrderRepository ──► Order Model ──► MongoDB
                                  │
                                  ▼ (atomic conditional stock update / rollback)
                              Product Model
```

### Data Boundary Matrix (Phase 4 Status)
- **Authentication:** **REAL** MongoDB-backed (`User` model, HttpOnly cookie JWT, bcrypt, RBAC)
- **Products:** **REAL** MongoDB-backed (`Product` model, server search, filter, sort, pagination)
- **Cart:** **REAL** MongoDB-backed (`Cart` model, 1 persistent cart per customer, live product resolution)
- **Checkout & Customer Orders:** **REAL** MongoDB-backed (`Order` model, COD, stock validation/decrement, immutable snapshots)
- **Admin Order Management Workflow:** **PHASE 5** (Full status lifecycle, shipment management, advanced metrics)

---

## Commerce & Order System Architecture

### 1. Cart Model & Rules
- One persistent cart per customer (`user` unique index).
- Items stored as `{ product, quantity }`.
- Live prices and availability resolved dynamically against current `Product` documents in MongoDB.
- Price changes in catalog reflect immediately in cart calculations.

### 2. Order Model & Snapshots
- `orderNumber`: Human-readable identifier format `NVM-YYYYMMDD-[RANDOM6]`, unique index.
- `items`: Immutable snapshots storing `productName`, `price`, `image`, `quantity`, `lineTotal` at the exact moment of order placement.
- `shippingAddress`: Full validated address.
- `paymentMethod`: `COD` (Cash on Delivery).
- `paymentStatus`: `PENDING`.
- `orderStatus`: `PLACED`.

### 3. Financial Calculation & Authoritative Checkout
- Server owns all financial computations:
  - Subtotal: calculated from current active Product records.
  - Shipping: Free for subtotal >= $100, else $15.
  - Client-submitted prices and totals are strictly ignored.

### 4. Stock Safety & Concurrency
- Atomic conditional stock decrement (`findOneAndUpdate` where `_id = productId` and `stock >= quantity`, using `$inc: { stock: -quantity }`).
- If MongoDB replica set is present, executes multi-document transaction (`session.withTransaction`).
- If standalone MongoDB is detected, employs conditional atomic execution with automatic compensating rollback (`$inc: { stock: quantity }`) upon document insertion failure.
- Stock is never allowed to go below zero.
