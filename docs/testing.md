# NovaMart Test Report & Quality Assurance Document

## 1. Automated Test Suite Summary

- **Test Runner:** Vitest v3.2.7 (with Supertest integration testing)
- **Database:** Isolated MongoDB test database (`novamart_test`)
- **Execution Mode:** Serial execution (`--fileParallelism=false`)
- **Total Test Files:** 5
- **Total Tests Passed:** **86**
- **Total Tests Failed:** **0**

---

## 2. Test Suite Breakdown

| Suite File | Phase | Tests Passed | Focus Area |
|---|---|---|---|
| `tests/auth.test.js` | Phase 2 | **17** | User registration, password hashing, HttpOnly cookies, login validation, session persistence, RBAC guards |
| `tests/product.test.js` | Phase 3 | **25** | Catalog queries, pagination, search, category/brand filters, stock filters, admin CRUD mutations, soft-deletion |
| `tests/cart.test.js` | Phase 4 | **14** | Cart creation, add items, quantity increments, stock validation, user isolation, item deletion, clear cart |
| `tests/order.test.js` | Phase 4 | **11** | Authoritative checkout, subtotal & shipping fee calculation, COD processing, inventory decrement, cross-user security |
| `tests/adminOrder.test.js` | Phase 5 | **19** | Admin RBAC (401/403/200), pagination & search, controlled status transitions, cancellation stock restoration, dashboard stats |
| **TOTAL** | **Phases 1–5** | **86** | **100% Passing Backend Coverage** |

---

## 3. Phase 5 Admin Order Test Cases (`tests/adminOrder.test.js`)

1. **Admin Order RBAC & Route Access**
   - `401 Unauthorized` for unauthenticated requests.
   - `403 Forbidden` for `CUSTOMER` role attempting to access admin order endpoints.
   - `200 OK` for authenticated `ADMIN` users.
2. **Admin Order Listing, Pagination & Search**
   - Server-side pagination metadata (`page`, `limit`, `total`, `totalPages`).
   - Order status filtering (`PLACED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
   - Safe search by order number and customer name without regex injection vulnerabilities.
3. **Admin Order Details**
   - Full order document with customer snapshot and immutable item snapshots.
   - `404 Not Found` for nonexistent order identifiers.
4. **Controlled Status Lifecycle Transitions**
   - `PLACED` ➔ `PROCESSING` (200 OK, sets `processedAt`).
   - `PROCESSING` ➔ `SHIPPED` (200 OK, sets `shippedAt`).
   - `SHIPPED` ➔ `DELIVERED` (200 OK, sets `deliveredAt`, updates COD payment to `PAID`).
   - Backward transition `SHIPPED` ➔ `PROCESSING` rejected with `400 Bad Request`.
   - Transitions out of terminal state `DELIVERED` (e.g. `DELIVERED` ➔ `CANCELLED`) rejected with `400 Bad Request`.
   - `CUSTOMER` blocked from changing order status (`403 Forbidden`).
5. **Cancellation & Stock Restoration**
   - Cancellation from `PLACED` restores ordered quantities back to `Product.stock`.
   - `stockRestored` idempotency flag prevents repeated stock restorations.
   - Repeated cancellation from `CANCELLED` terminal state rejected with `400 Bad Request`.
6. **Admin Dashboard Real Aggregation API**
   - `401 Unauthorized` for unauthenticated requests.
   - `403 Forbidden` for `CUSTOMER` users.
   - `200 OK` with real aggregated product counts, status breakdown, and delivered revenue (cancelled orders excluded from revenue).

---

## 4. Frontend Static Verification

- **Linter:** `oxlint` (0 errors, 13 non-blocking compiler hints).
- **Production Build:** `vite build` completed cleanly, producing optimized client bundle.

---

## 5. Security & Manual QA Checks

- **Authentication Guard:** Non-logged-in users cannot access `/cart`, `/checkout`, `/orders`, or `/admin`.
- **RBAC Guard:** `CUSTOMER` users attempting to access `/admin` routes receive `403 Forbidden` and redirect to `/unauthorized`.
- **Cross-User Protection:** Customer A cannot view or manipulate Customer B's cart or orders.
- **Double-Submission Guard:** Checkout and status update buttons disable during flight to prevent duplicate submissions.
- **Currency Consistency:** 100% unified in USD (`$`) across storefront, checkout, admin tables, orders, and free shipping rule ($100).
