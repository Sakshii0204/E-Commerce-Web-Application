# E-Commerce Web Application — Architecture Document

## Overview
- **Project:** Full-Featured MERN E-Commerce Web Application
- **Internship:** QSkill — 1 Month Internship
- **Current Phase:** Phase 1 (Frontend Foundation & Complete UI)

## 5-Phase Development Plan
1. **Phase 1: Project Foundation + Complete Frontend UI (Current)**
   - Project directory structure setup
   - React + Vite + Tailwind CSS responsive frontend
   - Complete customer and admin page templates
   - Centralized mock data and React Context state
   - Full client-side routing and validation
2. **Phase 2: Backend + Database + Authentication**
   - Node.js & Express REST API server
   - MongoDB database models with Mongoose
   - User authentication with JWT & bcrypt
   - Authentication & Authorization middleware
3. **Phase 3: Product System + Search/Filtering + Admin Product Management**
   - Real backend product CRUD endpoints
   - Cloudinary image uploads
   - Advanced server-side search, filtering, and pagination
4. **Phase 4: Cart + Checkout + Order Processing**
   - Server-side persistent cart
   - Order creation and inventory deduction
   - Payment gateway integration / Cash on delivery processing
5. **Phase 5: Admin Orders + Polish + Deployment**
   - Real admin order management and status changes
   - End-to-end testing and performance tuning
   - Production deployment (e.g. Vercel for Frontend, Render/Railway for Backend, MongoDB Atlas)

## Frontend Architecture (Phase 1)
```
frontend/src/
├── assets/          # Static assets and icons
├── components/      # Modular, reusable UI components
│   ├── common/      # Navbar, Footer, Buttons, Inputs, Modals, Badges
│   ├── products/    # ProductCard, ProductGrid, FilterPanel, SearchBar
│   ├── cart/        # CartItem, CartSummary
│   └── admin/       # Sidebar, Header, StatCard, AdminRow
├── context/         # React Context (Cart, Product, Order, Auth)
├── data/            # Centralized realistic mock datasets
├── layouts/         # MainLayout (Storefront) & AdminLayout (Admin portal)
├── pages/           # Customer pages (Home, Products, Details, Cart, Checkout, etc.)
│   └── admin/       # Admin pages (Dashboard, Products, Add/Edit Product, Orders, etc.)
├── routes/          # Centralized React Router configuration
├── styles/          # Design system & Tailwind CSS entry point
├── App.jsx          # Root component wrapped with providers
└── main.jsx         # Application entry
```
