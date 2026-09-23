# E-Commerce Web Application — Architecture Document

## Overview
- **Project:** Full-Featured MERN E-Commerce Web Application (NovaMart)
- **Internship:** QSkill — 1 Month Internship
- **Current Phase:** Phase 3 (Product System + Search/Filtering + Admin Product Management) — Completed

---

## 5-Phase Development Roadmap

| Phase | Title | Focus Area | Status |
|---|---|---|---|
| **Phase 1** | **Project Foundation + Complete Frontend UI** | UI/UX, Component Architecture, Mock State, Routing | **Completed** |
| **Phase 2** | **Backend + Database + Authentication** | Express.js, MongoDB, Mongoose, JWT & Bcrypt Auth, RBAC | **Completed** |
| **Phase 3** | **Product System + Search/Filtering + Admin Products** | Real Product CRUD, MongoDB Catalog, Filtering, Seeding | **Completed (Current)** |
| **Phase 4** | **Cart + Checkout + Order Processing** | Persistent Cart, Order Checkout, Inventory Management | Upcoming |
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
        └─ Product API Client (api/productApi.js)
                │
                ▼
            /api/products ──► ProductService ──► ProductRepository ──► Product Model ──► MongoDB
```

### Data Boundary Matrix (Phase 3 Status)
- **Authentication:** **REAL** MongoDB-backed (Mongoose `User` model, HttpOnly cookie JWT, bcrypt)
- **Products:** **REAL** MongoDB-backed (Mongoose `Product` model, server search, filter, sort, pagination)
- **Cart:** **LOCAL / MOCK** (React `CartContext` with localStorage, zero database models/APIs)
- **Orders:** **LOCAL / MOCK** (React `OrderContext` with mock orders, zero database models/APIs)

---

## Product System Architecture

### 1. Product Model & Schema
- `name`: String, required, trimmed, min 2, max 120
- `description`: String, required, trimmed, max 2000
- `price`: Number, required, min 0
- `category`: String, required, trimmed
- `brand`: String, required, trimmed
- `image`: String, required, valid URL
- `stock`: Number, integer, min 0
- `isActive`: Boolean, default true (used for soft-delete/archival)
- Timestamps: `createdAt`, `updatedAt`
- Serialization: transforms `_id` to string `id`, hides `__v`

### 2. Indexes
- `{ isActive: 1, category: 1 }`
- `{ isActive: 1, brand: 1 }`
- `{ isActive: 1, price: 1 }`
- `{ isActive: 1, createdAt: -1 }`
- Text search: `{ name: 'text', brand: 'text', category: 'text' }`

### 3. Query Engine
- **Search:** Safe sanitized regex escaping special characters; searches `name`, `brand`, and `category` case-insensitively.
- **Filters:** `category`, `brand`, `minPrice`, `maxPrice`, `inStock`.
- **Sort:** Controlled mapping (`newest`, `price_asc`, `price_desc`, `name_asc`, `name_desc`).
- **Pagination:** Server-side `page`, `limit` (max 50, default 12), returns `totalProducts`, `totalPages`, `hasNextPage`, `hasPreviousPage`.
- **Filter Metadata:** `GET /api/products/filters` returns distinct categories, brands, and price bounds via aggregation.

### 4. Admin CRUD & Lifecycle Strategy
- **Create:** `POST /api/products` (Requires `authenticate` + `authorize('ADMIN')`, Zod validated)
- **Update:** `PUT /api/products/:id` (Requires `authenticate` + `authorize('ADMIN')`, blocks immutable fields)
- **Soft-Delete / Archive:** `DELETE /api/products/:id` sets `isActive: false`. Hides product from customer catalog while preserving historical references.
