# E-Commerce Web Application (NovaMart)

> **QSkill — 1 Month MERN Stack Internship Project**

A modern, responsive, and full-featured e-commerce web application developed as part of the QSkill internship program. Built following a strict 5-phase engineering roadmap.

---

## 5-Phase Development Roadmap

| Phase | Title | Focus Area | Status |
|---|---|---|---|
| **Phase 1** | **Project Foundation + Complete Frontend UI** | UI/UX, Component Architecture, Mock State, Routing | **Completed** |
| **Phase 2** | **Backend + Database + Authentication** | Express.js, MongoDB, Mongoose, JWT & Bcrypt Auth, RBAC | **Completed** |
| **Phase 3** | **Product System + Search/Filtering + Admin Products** | Real Product CRUD, MongoDB Catalog, Filtering, Seeding | **Completed (Phase 3 Passed)** |
| **Phase 4** | **Cart + Checkout + Order Processing** | Persistent Cart, Order Checkout, Inventory Management | Upcoming |
| **Phase 5** | **Admin Orders + Polish + Deployment** | Full Admin Controls, Testing, Vercel & Render Deployment | Upcoming |

---

## Phase 3 Features & Architecture

### 1. Database-Backed Product System
- **MongoDB Collection:** `products` via Mongoose `Product` schema.
- **Product Lifecycle:** Non-destructive soft-delete (`isActive = false`) preserves order historical integrity.
- **Product Fields:** `name`, `description`, `price`, `category`, `brand`, `image`, `stock`, `isActive`, `createdAt`, `updatedAt`.
- **Targeted Indexes:** Compound indexes for category, brand, price, timestamps, and active state.

### 2. Public Catalog & Query Engine
- **Search:** Case-insensitive search on name, brand, and category with sanitized regex.
- **Filters:** Dynamic category, brand, price range (`minPrice`, `maxPrice`), and availability (`inStock`).
- **Controlled Sorting:** `newest`, `price_asc`, `price_desc`, `name_asc`, `name_desc`.
- **Server Pagination:** `page` and `limit` with metadata (`totalProducts`, `totalPages`, `hasNextPage`, `hasPreviousPage`).
- **Filter Metadata Endpoint (`GET /api/products/filters`):** Supplies live distinct categories, brands, and price bounds to frontend filter components.

### 3. Admin Product Management
- **Role-Based Authorization:** All mutation endpoints (`POST /api/products`, `PUT /api/products/:id`, `DELETE /api/products/:id`) strictly require authentication and `ADMIN` role. Customers attempting mutations receive `403 Forbidden`.
- **Input Validation:** Strict Zod schema validation on all inputs (positive prices, integer stock, valid URLs).
- **Admin Pages:** Real inventory table with live stock badges, Add Product, Edit Product with pre-filled inputs, and soft-delete confirmation modal.

### 4. Seed Data Script
- Development seed command: `npm run seed:products`
- Idempotently populates MongoDB with 18 realistic items across 5 categories, varied brands, prices, and stock levels (in-stock, low-stock `<= 5`, out-of-stock `0`).

---

## Phase 3 API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Health check |
| `POST` | `/api/auth/register` | Public | Customer registration |
| `POST` | `/api/auth/login` | Public | User login |
| `POST` | `/api/auth/logout` | Public | Session logout |
| `GET` | `/api/auth/me` | Protected | Current user identity |
| `GET` | `/api/products` | Public | Product catalog list with search, filter, sort, pagination |
| `GET` | `/api/products/filters` | Public | Distinct categories, brands, and price bounds |
| `GET` | `/api/products/:id` | Public | Single product details |
| `POST` | `/api/products` | Admin Only | Create new product |
| `PUT` | `/api/products/:id` | Admin Only | Update existing product |
| `DELETE` | `/api/products/:id` | Admin Only | Soft-delete / archive product |

> [!NOTE]
> Cart persistence and Order persistence are strictly scheduled for Phase 4. During Phase 3, Cart and Orders remain locally managed in React state.

---

## Local Development & Setup

### 1. Backend Setup
```bash
cd backend
npm install
npm run seed:admin
npm run seed:products
npm test
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run lint
npm run build
npm run dev
```
