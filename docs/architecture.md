# E-Commerce Web Application — Architecture Document

## Overview
- **Project:** Full-Featured MERN E-Commerce Web Application (NovaMart)
- **Internship:** QSkill — 1 Month Internship
- **Current Phase:** Phase 2 (Backend + Database + Authentication) — Completed

---

## 5-Phase Development Roadmap

| Phase | Title | Focus Area | Status |
|---|---|---|---|
| **Phase 1** | **Project Foundation + Complete Frontend UI** | UI/UX, Component Architecture, Mock State, Routing | **Completed** |
| **Phase 2** | **Backend + Database + Authentication** | Express.js, MongoDB, Mongoose, JWT & Bcrypt Auth, RBAC | **Completed (Current)** |
| **Phase 3** | **Product System + Search/Filtering + Admin Products** | Real Product CRUD, Cloudinary, Advanced Filter APIs | Upcoming |
| **Phase 4** | **Cart + Checkout + Order Processing** | Persistent Cart, Order Checkout, Inventory Management | Upcoming |
| **Phase 5** | **Admin Orders + Polish + Deployment** | Full Admin Controls, Testing, Vercel & Render Deployment | Upcoming |

---

## Phase 2 Layered Backend Architecture

```
Client (React Frontend)
        │
        ▼ (HttpOnly Cookie with JWT)
Express REST API Server (src/app.js)
        │
        ├─ Security Middleware (Helmet, CORS with Credentials, JSON limits)
        │
        ▼
Route Layer (src/routes/auth.routes.js)
        │
        ├─ Validation Middleware (Zod schema validation)
        ├─ Authentication Middleware (JWT extraction & signature verification)
        └─ Authorization Middleware (RBAC: CUSTOMER vs ADMIN)
        │
        ▼
Controller Layer (src/controllers/auth.controller.js)
        │
        ▼
Service Layer (src/services/auth.service.js)
        │ (Business rules: password comparison, token issuance, CUSTOMER enforcement)
        │
        ▼
Repository Layer (src/repositories/user.repository.js)
        │
        ▼
Mongoose Model Layer (src/models/User.js)
        │ (Bcrypt pre-save hashing, schema validations, index constraints)
        │
        ▼
Database (MongoDB: novamart)
```

---

## Authentication & Security Specifications

1. **Password Hashing:**
   - Evaluated and hashed using `bcryptjs` with salt factor 10.
   - Plaintext passwords never stored in the database.
   - Schema excludes password from standard queries (`select: false`) and removes it in `toJSON`.

2. **JWT & Session Transport:**
   - Token payload: `{ userId, role }`.
   - Transported via standard HttpOnly cookies (`novamart_token`).
   - Cookie flags: `httpOnly: true`, `sameSite: 'lax'`, `secure: process.env.NODE_ENV === 'production'`.
   - Protected from cross-site script reading (XSS token theft prevention).

3. **Role-Based Access Control (RBAC):**
   - Available roles: `CUSTOMER` (default), `ADMIN`.
   - Public registration strictly forces `role: 'CUSTOMER'`. Any client-supplied role values are ignored to prevent privilege escalation.
   - Administrative users created through safe, idempotent CLI seed: `npm run seed:admin`.

4. **Phase Boundaries:**
   - **Authentication:** Real MERN stack implementation backed by MongoDB.
   - **Products:** Mock data in React frontend (Phase 3 transition).
   - **Cart & Orders:** Mock data in React frontend (Phase 4 transition).
