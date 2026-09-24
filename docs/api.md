# NovaMart REST API Documentation

This document describes all API endpoints implemented in the NovaMart Full-Stack E-Commerce platform.

Base URL: `http://localhost:5000/api` (or environment-configured `VITE_API_URL`)

---

## 1. System Health

### `GET /api/health`
- **Auth:** None (Public)
- **Description:** Returns server status, current timestamp, and deployed phase.
- **Response 200 OK:**
```json
{
  "status": "OK",
  "message": "NovaMart Backend API is operational",
  "timestamp": "2026-09-24T05:00:00.000Z",
  "phase": "Phase 5 (Final Phase: Admin Orders & Operations)"
}
```

---

## 2. Authentication (`/api/auth`)

### `POST /api/auth/register`
- **Auth:** None (Public, Rate Limited)
- **Description:** Registers a new customer account and sets HttpOnly session cookie.
- **Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password123!"
}
```
- **Response 201 Created:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": { "id": "...", "name": "Jane Doe", "email": "jane@example.com", "role": "CUSTOMER" }
}
```

### `POST /api/auth/login`
- **Auth:** None (Public, Rate Limited)
- **Description:** Authenticates user credentials and sets HttpOnly JWT cookie.
- **Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "Password123!"
}
```
- **Response 200 OK:** Returns user profile and sets `novamart_token` cookie.

### `POST /api/auth/logout`
- **Auth:** Public / Authenticated
- **Description:** Clears the HttpOnly authentication cookie.
- **Response 200 OK:** `{ "success": true, "message": "Logged out successfully" }`

### `GET /api/auth/me`
- **Auth:** Required (`authenticate`)
- **Description:** Retrieves the current authenticated user's profile.
- **Response 200 OK:** User profile object.

---

## 3. Product Catalog (`/api/products`)

### `GET /api/products`
- **Auth:** None (Public)
- **Query Params:** `search`, `category`, `brand`, `minPrice`, `maxPrice`, `inStock`, `page`, `limit`, `sort`
- **Description:** Paginated catalog query with multi-attribute filtering.
- **Response 200 OK:** `{ "success": true, "data": [...], "pagination": { "total": 24, "page": 1, "limit": 12, "totalPages": 2 } }`

### `GET /api/products/filters`
- **Auth:** None (Public)
- **Description:** Retrieves distinct categories, brands, and price range metadata.

### `GET /api/products/:id`
- **Auth:** None (Public)
- **Description:** Returns product details by ID or slug.

### `POST /api/products`
- **Auth:** Admin (`authenticate` + `authorize('ADMIN')`)
- **Description:** Creates a new catalog item.

### `PUT /api/products/:id`
- **Auth:** Admin (`authenticate` + `authorize('ADMIN')`)
- **Description:** Updates product attributes and stock levels.

### `DELETE /api/products/:id`
- **Auth:** Admin (`authenticate` + `authorize('ADMIN')`)
- **Description:** Soft-deletes a product (`isActive: false`).

---

## 4. Shopping Cart (`/api/cart`)

### `GET /api/cart`
- **Auth:** Required (`authenticate`)
- **Description:** Retrieves current user's cart with live prices and computed subtotal.

### `POST /api/cart/items`
- **Auth:** Required (`authenticate`)
- **Request Body:** `{ "productId": "...", "quantity": 1 }`
- **Description:** Adds item to cart or increments quantity.

### `PUT /api/cart/items/:productId`
- **Auth:** Required (`authenticate`)
- **Request Body:** `{ "quantity": 3 }`
- **Description:** Updates item quantity.

### `DELETE /api/cart/items/:productId`
- **Auth:** Required (`authenticate`)
- **Description:** Removes an item from the cart.

### `DELETE /api/cart`
- **Auth:** Required (`authenticate`)
- **Description:** Clears all items in the user's cart.

---

## 5. Customer Orders (`/api/orders`)

### `POST /api/orders`
- **Auth:** Required (`authenticate`)
- **Request Body:**
```json
{
  "shippingAddress": {
    "fullName": "Jane Doe",
    "phone": "9876543210",
    "address": "123 Elm Street",
    "city": "Springfield",
    "state": "Illinois",
    "postalCode": "62701"
  },
  "paymentMethod": "COD"
}
```
- **Description:** Validates stock, decrements inventory, creates immutable order snapshots, clears cart.
- **Response 201 Created:** Order document.

### `GET /api/orders/my-orders`
- **Auth:** Required (`authenticate`)
- **Query Params:** `page`, `limit`
- **Description:** Retrieves authenticated user's order history sorted newest first.

### `GET /api/orders/:id`
- **Auth:** Required (`authenticate`)
- **Description:** Retrieves single order for customer (enforces cross-user isolation).

---

## 6. Admin Orders & Dashboard (`/api/orders/admin`)

### `GET /api/orders/admin`
- **Auth:** Admin (`authenticate` + `authorize('ADMIN')`)
- **Query Params:** `page`, `limit` (max 50), `status` (`ALL`, `PLACED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`), `search`, `sort` (`newest`, `oldest`, `highest_amount`, `lowest_amount`)
- **Description:** Paginated, filtered, searchable list of all store orders.
- **Response 200 OK:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

### `GET /api/orders/admin/dashboard`
- **Auth:** Admin (`authenticate` + `authorize('ADMIN')`)
- **Description:** Aggregates real catalog counts, order status counts, and verified delivered revenue.
- **Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "products": {
      "total": 24,
      "lowStock": 3,
      "outOfStock": 1
    },
    "orders": {
      "total": 42,
      "byStatus": {
        "PLACED": 5,
        "PROCESSING": 3,
        "SHIPPED": 4,
        "DELIVERED": 28,
        "CANCELLED": 2
      },
      "deliveredRevenue": 4820.50
    }
  }
}
```

### `GET /api/orders/admin/:id`
- **Auth:** Admin (`authenticate` + `authorize('ADMIN')`)
- **Description:** Retrieves detailed order document with populated customer information and immutable product snapshots.

### `PATCH /api/orders/admin/:id/status`
- **Auth:** Admin (`authenticate` + `authorize('ADMIN')`)
- **Request Body:** `{ "status": "PROCESSING" }` (or `SHIPPED`, `DELIVERED`, `CANCELLED`)
- **Description:** Validates state transitions against lifecycle state machine.
  - On `CANCELLED`: restores purchased quantities to product inventory exactly once.
  - On `DELIVERED`: sets `paymentStatus` to `PAID` (COD settled).
- **Response 200 OK:** Updated order document.
