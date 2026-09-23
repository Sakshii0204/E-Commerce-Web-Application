# E-Commerce Web Application (NovaMart)

> **QSkill — 1 Month MERN Stack Internship Project**

A modern, responsive, and full-featured e-commerce web application developed as part of the QSkill internship program. Built following a strict 5-phase engineering roadmap.

---

## 5-Phase Development Roadmap

| Phase | Title | Focus Area | Status |
|---|---|---|---|
| **Phase 1** | **Project Foundation + Complete Frontend UI** | UI/UX, Component Architecture, Mock State, Routing | **Completed** |
| **Phase 2** | **Backend + Database + Authentication** | Express.js, MongoDB, Mongoose, JWT & Bcrypt Auth, RBAC | **Completed (Phase 2 Passed)** |
| **Phase 3** | **Product System + Search & Filtering** | Real Product CRUD, Cloudinary, Advanced Filter APIs | Upcoming |
| **Phase 4** | **Cart + Checkout + Order Processing** | Persistent Cart, Order Checkout, Inventory Management | Upcoming |
| **Phase 5** | **Admin Orders + Polish + Deployment** | Full Admin Controls, Testing, Vercel & Render Deployment | Upcoming |

---

## Phase 2 Features & Backend Architecture

### 1. Layered REST API
- **Routes → Validation → Middleware → Controllers → Services → Repositories → Mongoose Model → MongoDB**
- Clean separation of concerns with isolated business rules.

### 2. Authentication & Authorization (RBAC)
- **Real Registration (`POST /api/auth/register`):** Input validated via Zod. Automatically enforces `CUSTOMER` role to prevent privilege escalation.
- **Secure Login (`POST /api/auth/login`):** Compares password hash via `bcryptjs`. Emits generic error on non-existent accounts or bad credentials to prevent email enumeration.
- **JWT via HttpOnly Cookies:** JWT tokens issued in `novamart_token` cookie with `httpOnly: true`, `sameSite: 'lax'`, and `secure: true` in production.
- **Session Restoration (`GET /api/auth/me`):** Authenticates active session on application startup and browser refresh.
- **Safe Logout (`POST /api/auth/logout`):** Clears authentication cookie and resets client session.
- **Role-Based Access Control:** Reusable `authorize('ADMIN')` middleware. Blocks customers with `403 Forbidden` from administrative endpoints.

### 3. Database & Security
- **MongoDB Connection:** Native Mongoose connection (`novamart` database) with lifecycle event logging.
- **Security Middleware:** `helmet` for HTTP headers, `cors` configured with `credentials: true` for `CLIENT_URL`, request body size limitations (`10kb`).
- **Centralized Error Handling:** Global middleware handling operational `AppError`, Mongoose duplicate key (`409`), validation issues (`400`), and internal errors (`500`).

---

## Available Phase 2 API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Backend health check and operational status |
| `POST` | `/api/auth/register` | Public | Register new customer account and set session cookie |
| `POST` | `/api/auth/login` | Public | Authenticate user credentials and set session cookie |
| `POST` | `/api/auth/logout` | Public | Clear authentication session cookie |
| `GET` | `/api/auth/me` | Protected | Fetch authenticated user identity |
| `GET` | `/api/auth/admin-check` | Admin Only | Test endpoint verifying administrative RBAC access |

> [!NOTE]
> Products (`/api/products`), Cart (`/api/cart`), and Orders (`/api/orders`) remain simulated via local React state and mock datasets until Phase 3 and Phase 4.

---

## Local Development & Setup

### Prerequisites
- Node.js (v18 or newer, recommended v20+)
- npm (v9 or newer)
- MongoDB Server running locally (`mongodb://127.0.0.1:27017`) or MongoDB Atlas connection URI

### Step-by-Step Execution

#### 1. Backend Setup (Terminal 1)
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Configure environment (copy template)
cp .env.example .env

# Seed initial Administrator account
npm run seed:admin

# Start backend dev server (port 5000)
npm run dev
```

#### 2. Frontend Setup (Terminal 2)
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start frontend dev server (port 5173)
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Administrator Account Creation

Public registration automatically restricts accounts to `CUSTOMER` access. To generate an administrator:
```bash
cd backend
npm run seed:admin
```
Default credentials configured in `.env.example`:
- **Email:** `admin@novamart.com`
- **Password:** `AdminPassword123!`

---

## Automated Testing & Quality Checks

### Backend Automated Test Suite (17 Tests)
```bash
cd backend
npm test
```
Tests cover:
- Health check verification
- Registration validations (valid customer, duplicate email, malformed email, short password, missing fields, client privilege escalation prevention)
- Login validations (correct credentials, bad password, non-existent email)
- Authentication checks (`/me` with and without session cookie, invalid token rejection)
- RBAC verification (Customer blocked with 403, Admin allowed with 200)
- Logout cookie clearance
- Password hashing verification in MongoDB

### Frontend Linting & Production Build
```bash
cd frontend
npm run lint
npm run build
```
