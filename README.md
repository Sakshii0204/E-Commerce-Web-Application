# E-Commerce Web Application (NovaMart)

> **QSkill — 1 Month MERN Stack Internship Project**

A modern, responsive, and full-featured e-commerce web application developed as part of the QSkill internship program. Built following a strict 5-phase engineering roadmap, starting with a clean frontend architecture and progressing toward a full MERN stack deployment.

---

## 5-Phase Development Roadmap

| Phase | Title | Focus Area | Status |
|---|---|---|---|
| **Phase 1** | **Project Foundation + Complete Frontend** | UI/UX, Component Architecture, Mock State, Routing | **In Progress (Current)** |
| **Phase 2** | **Backend + Database + Authentication** | Express.js, MongoDB, Mongoose, JWT & Bcrypt Auth | Upcoming |
| **Phase 3** | **Product System + Search & Filtering** | Real Product CRUD, Cloudinary, Advanced Filter APIs | Upcoming |
| **Phase 4** | **Cart + Checkout + Order Processing** | Persistent Cart, Order Checkout, Inventory Management | Upcoming |
| **Phase 5** | **Admin Orders + Polish + Deployment** | Full Admin Controls, Testing, Vercel & Render Deployment | Upcoming |

---

## Phase 1 Overview

Phase 1 focuses exclusively on establishing a production-grade frontend architecture:
- Complete customer storefront and administrative portal
- Reusable component system with clean styling via Tailwind CSS
- Fully working client-side routing via React Router DOM
- In-memory mock data layer and centralized React Context state
- Form validation on login, registration, checkout, and product management
- Zero backend dependencies or active databases (Phase 2 boundary respected)

---

## Tech Stack (Phase 1 Frontend)

- **Library / Framework:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language:** JavaScript (ESNext, Functional Components, Hooks)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Routing:** [React Router DOM v7](https://reactrouter.com/)

---

## Project Structure

```
E-Commerce-Web-Application/
├── frontend/                     # React + Vite Frontend Application
│   ├── public/                   # Static assets & favicon
│   ├── src/
│   │   ├── assets/               # Brand logos and images
│   │   ├── components/           # Reusable UI component library
│   │   │   ├── common/           # Navbar, Footer, Buttons, Inputs, Modals, Badges
│   │   │   ├── products/         # ProductCard, ProductGrid, SearchBar, FilterPanel
│   │   │   ├── cart/             # CartItem, CartSummary
│   │   │   └── admin/            # AdminSidebar, AdminHeader, AdminStatCard
│   │   ├── context/              # Cart, Product, Order, and Auth contexts
│   │   ├── data/                 # Mock products, categories, orders datasets
│   │   ├── layouts/              # MainLayout (Storefront) & AdminLayout
│   │   ├── pages/                # Customer pages (Home, Products, Details, Cart, Checkout, Profile, Orders)
│   │   │   └── admin/            # Admin pages (Dashboard, Products, Add/Edit Product, Orders)
│   │   ├── routes/               # Centralized React Router configuration
│   │   ├── styles/               # Global CSS & Tailwind configuration
│   │   ├── App.jsx               # Root application component with Context Providers
│   │   └── main.jsx              # React DOM entrypoint
│   ├── .env.example              # Environment variables template
│   ├── package.json              # Frontend dependencies and scripts
│   └── vite.config.js            # Vite configuration
├── backend/                      # Reserved for Phase 2 Express.js server
│   └── README.md                 # Phase 2 backend architecture specifications
├── docs/                         # Architectural documentation and phase plans
│   └── architecture.md
├── .gitignore                    # Git ignore file
└── README.md                     # Project documentation
```

---

## Installation & Running Locally

### Prerequisites
- Node.js (v18 or newer, recommended v20+)
- npm (v9 or newer)

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Sakshii0204/E-Commerce-Web-Application.git
   cd E-Commerce-Web-Application
   ```

2. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## Phase 1 Features Implemented

### Customer Storefront
- **Home Page:** Hero banner, interactive category cards, featured products carousel/grid, trust benefits, promotional spotlight, and comprehensive footer.
- **Products Catalog:** Multi-facet filtering (categories, brands, price range slider, in-stock toggle), search query matching, and sorting (price low-to-high, price high-to-low, newest).
- **Product Details:** High-res image display, stock availability indicators, interactive quantity selector, specifications, and instant Add to Cart.
- **Cart Management:** Dynamic item quantity adjustments, real-time subtotal/tax/shipping calculator, item removal, and empty state UI.
- **Checkout & Orders:** Shipping details collection with frontend validation, Cash on Delivery option, mock order placement, and dedicated Order Success screen.
- **Order History:** Customer order records with status badges, date, pricing breakdown, and detailed modal/page view.
- **Authentication Pages:** Customer Login and Register forms with field validation (format check, password confirmation, show/hide toggle).
- **Customer Profile:** View account details and mock profile settings.

### Administrative Management Portal
- **Admin Dashboard:** Real-time KPI statistics (Total Products, Total Orders, Pending Orders, Delivered Orders, Low Stock Alerts), recent order records, and quick shortcuts.
- **Product Management:** Searchable and filterable product catalog table with stock status indicators, Add Product form, Edit Product form, and safe Delete confirmation dialog.
- **Order Management:** Customer order lifecycle management with quick status updater (`Placed` -> `Processing` -> `Shipped` -> `Delivered` -> `Cancelled`).
- **Admin Layout:** Distinct responsive sidebar navigation with desktop and mobile drawer toggle, breadcrumb headers, and one-click store return.
