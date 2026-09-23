# E-Commerce Web Application (NovaMart)

> **QSkill — 1 Month MERN Stack Internship Project**

A modern, responsive, and full-featured e-commerce web application developed as part of the QSkill internship program. Built following a strict 5-phase engineering roadmap.

---

## 5-Phase Development Roadmap

| Phase | Title | Focus Area | Status |
|---|---|---|---|
| **Phase 1** | **Project Foundation + Complete Frontend UI** | UI/UX, Component Architecture, Mock State, Routing | **Completed** |
| **Phase 2** | **Backend + Database + Authentication** | Express.js, MongoDB, Mongoose, JWT & Bcrypt Auth, RBAC | **Completed** |
| **Phase 3** | **Product System + Search/Filtering + Admin Products** | Real Product CRUD, MongoDB Catalog, Filtering, Seeding | **Completed** |
| **Phase 4** | **Cart + Checkout + Order Processing** | Persistent Cart, Order Checkout, Inventory Management | **Completed (Phase 4 Passed)** |
| **Phase 5** | **Admin Orders + Polish + Deployment** | Full Admin Controls, Testing, Vercel & Render Deployment | Upcoming |

---

## Phase 4 Features & Architecture

### 1. Persistent Customer Cart
- **MongoDB Collection:** `carts` via Mongoose `Cart` schema (1 unique active cart per customer).
- **Price Authority:** Dynamic resolution against current `Product` records in MongoDB. Stale client prices are never trusted.
- **Stock Guard:** Real-time stock checks prevent exceeding inventory when adding or updating items.
- **Session Persistence:** Cart persists across browser refreshes, survives logout/login, and resets on logout.

### 2. Authoritative Checkout & COD Orders
- **Payment Method:** Cash on Delivery (`COD`) exclusively.
- **Order Snapshots:** Durable `Order` schema captures immutable snapshots of product name, image, price, quantity, and line total at the exact moment of order creation.
- **Financial Calculation:** Server calculates subtotal, shipping charge (Free >= $100, else $15), and total amount. Client-submitted prices and totals are completely ignored.
- **Concurrency & Stock Safety:** Atomic conditional inventory updates (`stock >= quantity`, `$inc: { stock: -quantity }`). Multi-document transaction used where replica set is available, with safe conditional decrement and rollback fallback on standalone MongoDB.
- **Unique Order Numbers:** Human-readable order identifier format: `NVM-YYYYMMDD-[RANDOM6]`.
- **Customer Isolation:** Customers can view only their own order history (`/api/orders/my-orders`) and details (`/api/orders/:id`). Cross-customer order access is blocked with 404.

---

## Phase 4 API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/cart` | Authenticated | Fetch active customer cart with current product details |
| `POST` | `/api/cart/items` | Authenticated | Add item to persistent cart with stock validation |
| `PUT` | `/api/cart/items/:productId` | Authenticated | Update item quantity in cart |
| `DELETE` | `/api/cart/items/:productId` | Authenticated | Remove item from cart |
| `DELETE` | `/api/cart` | Authenticated | Clear customer cart |
| `POST` | `/api/orders` | Authenticated | Place real COD order with stock decrement & cart clear |
| `GET` | `/api/orders/my-orders` | Authenticated | List authenticated customer's order history |
| `GET` | `/api/orders/:id` | Authenticated | Fetch details of customer's specific order |

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
