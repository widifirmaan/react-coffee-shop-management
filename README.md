# ☕ React - Coffee Shop Management Brutalist

**React - Coffee Shop Management Brutalist** is an enterprise-grade web-based Point of Sale (POS), Kitchen Display System (KDS), and Operational Management Suite designed for modern coffee shops and specialty cafés. Built as a high-performance **Cloudflare Worker** serverless application, it serves both the responsive React frontend and a full REST API backed by **Cloudflare D1** (Serverless SQLite) and **Cloudflare R2** for image storage. It features a distinctive, punchy **Neo-Brutalist** aesthetic.

[![Live Demo](https://img.shields.io/badge/Demo-Live_Production-FCD34D?style=for-the-badge&logo=cloudflare&logoColor=black)](https://siapnyafe.widifirmaan.web.id)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=for-the-badge&logo=cloudflare)](https://workers.cloudflare.com/)
[![React 18](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Cloudflare D1](https://img.shields.io/badge/Cloudflare-D1_SQL-1C1E24?style=for-the-badge&logo=sqlite)](https://developers.cloudflare.com/d1/)
[![Cloudflare R2](https://img.shields.io/badge/Cloudflare-R2_Storage-EA580C?style=for-the-badge&logo=cloudflare)](https://developers.cloudflare.com/r2/)

---

## 🌐 Live Production

- **URL:** [https://siapnyafe.widifirmaan.web.id](https://siapnyafe.widifirmaan.web.id)
- **Architecture:** Cloudflare Workers (Full-Stack Edge Deployment)
- **Database:** Cloudflare D1 Serverless Database (`siapnyafe`)
- **Object Storage:** Cloudflare R2 Storage (`siapnyafe-images`)

---

## 📸 Application Showcase

| Public & Ordering | Dashboard & Analytics |
| :---: | :---: |
| ![Desktop Page](screenshots/Desktop%20Page.png)<br>**Interactive Landing Page** | ![Dashboard Page](screenshots/Dashboard%20Page.png)<br>**Operations Dashboard** |
| ![Customer Order Page](screenshots/Customer%20Order%20Page.png)<br>**Customer Self-Ordering Portal** | ![Menu Grid Page](screenshots/Menu%20Grid%20Page.png)<br>**Product Catalog Grid** |
| ![Checkout Modal](screenshots/Checkout%20Modal.png)<br>**Self-Order Checkout** | ![Call Waiter Modal](screenshots/Call%20Waiter%20Modal.png)<br>**Table Waiter Calling Modal** |
| ![About Page](screenshots/About%20Page.png)<br>**Shop Story & Philosophy** | ![Footer with Feedback Page](screenshots/Footer%20with%20Feedback%20Page.png)<br>**Footer & Customer Feedback** |

| Operations & Kitchen | Inventory & POS Management |
| :---: | :---: |
| ![Kitchen Queue Page](screenshots/Kitchen%20Queue%20Page.png)<br>**Kitchen Display System (KDS)** | ![Order History Page](screenshots/Order%20History%20Page.png)<br>**Order History & Status Tracking** |
| ![Waiter Page](screenshots/Waiter%20Page.png)<br>**Waiter Request Dispatcher** | ![Inventory Page](screenshots/Inventory%20Page.png)<br>**Stock Tracking & Low-Stock Alerts** |
| ![Transaction Page](screenshots/Transaction%20Page.png)<br>**Financial Transaction Ledger** | ![Chart Modal](screenshots/Chart%20Modal.png)<br>**Sales Analytics & Reporting** |
| ![Shift Management Page](screenshots/Shift%20Management%20Page.png)<br>**Weekly Shift Schedule Matrix** | ![Staff Management Page](screenshots/Staff%20Management%20Page.png)<br>**Employee Roster & Attendance** |

| CMS, Blog & Settings | Modals & Dialogs |
| :---: | :---: |
| ![Blog CMS Page](screenshots/Blog%20CMS%20Page.png)<br>**News & Blog Editor** | ![Blog Post Page](screenshots/Blog%20Post%20Page.png)<br>**Published Article View** |
| ![Menu Management Page](screenshots/Menu%20Management%20Page.png)<br>**Menu Item & Pricing CRUD** | ![Site Settings Page](screenshots/Site%20Settings%20Page.png)<br>**Branding & Shop Identity** |
| ![Login Page](screenshots/Login%20Page.png)<br>**Staff Portal Gate** | ![Edit Employee Modal](screenshots/Edit%20Employee%20Modal.png)<br>**Employee Profile Modal** |
| ![Confirmation Modal](screenshots/Confirmation%20Modal.png)<br>**Neo-Brutalist Confirmation Dialog** | ![Alert Modal](screenshots/Alert%20Modal.png)<br>**Unified Portal Alert System** |
| ![Mobile Landing Page](screenshots/Mobile%20Landing%20Page.png)<br>**Mobile View: Landing Page** | ![Mobile About Page](screenshots/Mobile%20About%20Page.png)<br>**Mobile View: About Section** |

---

## 🚀 Key Features

### 🛒 Public & Customer Experience
- **Interactive Landing Page**: High-contrast Neo-Brutalist design with mouse-tracking and fluid background interactions.
- **Customer Self-Ordering**: Table-side digital menu, item filtering by category, cart management, takeaway/dine-in selection, and instant order ticket receipt modal (`#ORD-XXXX`).
- **Real-Time Waiter Calling**: Customers call staff for billing or assistance directly from the table, dispatching real-time notifications with synthesized sound alerts.
- **Feedback & Review System**: Interactive rating and feedback submission automatically tagging the active on-duty shift employees.

### ☕ Cashier & Point of Sale (POS)
- **Fast Cashier Checkout**: Instant category filtering, real-time search, one-click quick cash presets (`EXACT`, `50K`, `100K`, `200K`), and change calculator.
- **Discounts & Taxes**: Configurable tax rates (from shop configuration) and cashier discount inputs with non-negative validation safeguards.
- **Thermal Receipt Printing**: Styled 80mm thermal receipt generator ready for ESC/POS receipt printers (`window.print()`).
- **Concurrency & Anti-Spam Guards**: Immediate click locks preventing duplicate order submissions on slow connections.

### 🍳 Kitchen Display System (KDS) & Barista Queue
- **Live Order Board**: Real-time polling with distinct visual color badges for status transitions (`PENDING` → `PREPARING` → `READY_TO_SERVE` → `COMPLETED`).
- **Audio Chime Notifications**: Web Audio API two-tone bell chime on incoming orders with localStorage toggle memory.
- **Order Modification**: Edit items, adjust quantities, or add notes on the fly directly from the kitchen screen.
- **Completed Orders Archive**: Searchable order history by order number, customer name, or order ID.

### 📦 Inventory & Bill of Materials (BOM)
- **Recipe Linking (BOM)**: Menus link to raw ingredients with specified usage amounts per serving.
- **Automated Stock Deduction**: Deducts ingredient quantities automatically when orders transition to `PREPARING` or `COMPLETED`.
- **Automatic Reversal on Order Cancellation**: Cancelling an order restores the deducted inventory back to the warehouse and voids the corresponding financial revenue record.
- **Threshold Alerts**: Automatic `LOW INVENTORY ALERT` notifications when ingredient stocks drop below minimum thresholds.

### 🏢 Asset Management & Equipment Maintenance
- **Fixed Asset Tracking**: Cataloging coffee machines, grinders, blenders, POS terminals, and furniture with asset codes, purchase dates, and serial numbers.
- **Condition & Status Audits**: Track asset condition (`EXCELLENT`, `GOOD`, `FAIR`, `POOR`, `NEEDS_REPAIR`) and status (`ACTIVE`, `IN_MAINTENANCE`, `DECOMMISSIONED`).
- **Scheduled Maintenance Logging**: Track maintenance dates and log service notes.

### 👥 Staff, Shifts & Attendance Enforcement
- **Role-Based Access Control (RBAC)**: Support for `Manager`, `Cashier`, `Barista`, `Kitchen`, and `Waiter` roles.
- **Strict Shift Windows**: Clock-in and clock-out strictly follow the weekly schedule matrix (Morning 07:00-15:00, Afternoon 15:00-23:00, Evening 23:00-07:00).
- **Lateness & Expiration Tracking**: Automatic calculation of minutes late and strict auto-expiration (`TIDAK ABSEN KELUAR` / `TIDAK ABSEN MASUK`) after 2-hour limits.
- **Cross-Midnight Shift Handling**: Seamless night-shift clock-out handling spanning past 00:00 midnight into the next day.

### 📊 Financial Ledger & Reports
- **Automatic Sales Sync**: Completed POS and digital orders automatically record as income transactions.
- **Manual Expense / Revenue Entries**: Log raw material purchasing, operational bills, or staff payroll.
- **Export to CSV**: One-click sanitised CSV export for accountant auditing.

---

## 🛠 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend Runtime** | Cloudflare Workers (Edge Serverless V8 Engine) |
| **Database** | Cloudflare D1 (Distributed SQLite-compatible SQL database) |
| **Media Storage** | Cloudflare R2 (S3-compatible Object Storage for images) |
| **Authentication** | JSON Web Tokens (JWT) signed via Web Crypto API (HMAC-SHA256) + Bcryptjs |
| **Frontend Framework** | React 18 + Vite 5 + React Router 6 |
| **Styling & Icons** | Pure Neo-Brutalist CSS (border-contrast, box-shadows) + Lucide React |
| **HTTP Client** | Axios with centralized error response parsing |
| **UI Components** | Unified Neo-Brutalist Portal `<Alert>`, `<Modal>`, `<ConfirmDialog>`, `<Card>` |

---

## 🔑 Default Credentials & Role Matrix

The database seeder provisions initial accounts with role-specific privileges. Login is supported using either **Employee ID** or **Email**, authenticated via **Password** or **4-Digit PIN**:

| Role | Employee ID | Email | Password | PIN | Privileges |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Manager** | `EMP-MAN-001` | `andi@nyafe.com` | `manager123` | `1234` | Full access: Operations, Finance, Staff, Assets, Menu, CMS, Settings |
| **Cashier** | `EMP-CSH-001` | `budi@nyafe.com` | `cashier123` | `1111` | Cashier POS, Orders, Receipt printing, Attendance |
| **Barista** | `EMP-BAR-001` | `citra@nyafe.com` | `barista123` | `2222` | Kitchen queue, Order preparation, Attendance |
| **Kitchen** | `EMP-KIT-001` | `doni@nyafe.com` | `kitchen123` | `3333` | Kitchen queue, Recipe viewing, Attendance |
| **Waiter** | `EMP-WTR-001` | `eka@nyafe.com` | `waiter123` | `4444` | Waiter dashboard, Table requests resolution, Attendance |

---

## 📡 REST API Reference

All API routes run at `/api/*` on the Cloudflare Worker:

### Authentication
- `POST /api/auth/login` — Authenticate via `email`/`employeeId` and `password`/`pin`. Returns JWT token.
- `GET /api/auth/me` — Retrieve the currently authenticated user's profile.

### Orders & Kitchen
- `GET /api/orders` — List orders (supports optional `?limit=` query).
- `POST /api/orders` — Create new order with inventory validation and collision-resistant `#ORD-XXXX` ID.
- `PUT /api/orders/:id` — Update order items, customer details, or table number.
- `PATCH /api/orders/:id/status` — Update order status. Automatically triggers stock deduction on `PREPARING`/`COMPLETED` or stock & finance reversal on `CANCELLED`.
- `DELETE /api/orders/:id` — Delete order (Manager only).

### Menus & Categories
- `GET /api/menus` — Retrieve list of active menu items with gallery.
- `POST /api/menus` — Add new menu item with pricing and image URLs (Manager only).
- `PUT /api/menus/:id` — Update menu item (Manager only).
- `DELETE /api/menus/:id` — Delete menu item (Manager only).
- `GET /api/categories` — List menu categories.
- `POST /api/categories` — Create category (Manager only).
- `DELETE /api/categories/:id` — Delete category (Manager only).

### Inventory & Recipes (BOM)
- `GET /api/ingredients` — List raw materials with current stock, threshold, and unit costs.
- `POST /api/ingredients` — Create raw ingredient (Manager only).
- `PUT /api/ingredients/:id` — Update ingredient quantity or minimum threshold (Manager only).
- `DELETE /api/ingredients/:id` — Remove ingredient (Manager only).
- `GET /api/recipes` — List Bill of Materials (optional `?menuId=` filter).
- `POST /api/recipes` — Link ingredient and quantity required per menu item (Manager only).
- `DELETE /api/recipes/:id` — Delete recipe entry (Manager only).

### Assets & Maintenance
- `GET /api/assets` — List shop assets and machinery with condition and status.
- `POST /api/assets` — Register asset with code, category, purchase date, and cost.
- `PUT /api/assets/:id` — Update asset status, maintenance log, or location.
- `DELETE /api/assets/:id` — Remove asset record.

### Staff, Shifts & Attendance
- `GET /api/employees` — List employee profiles (Manager only).
- `POST /api/employees` — Register new employee with role, salary, and PIN (Manager only).
- `PUT /api/employees/:id` — Update employee profile (Manager only).
- `DELETE /api/employees/:id` — Deactivate/delete employee (Manager only).
- `GET /api/shifts` — List 7-day shift scheduling matrix.
- `PUT /api/shifts` — Batch save shift schedules (Manager only).
- `GET /api/attendance` — View attendance records and status history.
- `GET /api/attendance/today/:employeeId` — Get today's attendance record for an employee.
- `GET /api/attendance/history/:employeeId` — Get full attendance logs for an employee.
- `POST /api/attendance/clock-in` — Shift-validated clock-in with lateness detection.
- `POST /api/attendance/clock-out` — Shift-validated clock-out with expiration handling.

### Finance & Transactions
- `GET /api/transactions` — List financial revenue and expense records.
- `POST /api/transactions` — Add manual income or operational expense entry.
- `DELETE /api/transactions/:id` — Delete transaction (Manager only).

### Waiter & Notifications
- `GET /api/notifications` — Retrieve unread staff alerts and low-inventory warnings.
- `POST /api/notifications` — Dispatch customer assistance or billing alert.
- `PUT /api/notifications/:id/read` or `PATCH /api/notifications/:id/read` — Mark notification resolved.
- `DELETE /api/notifications/:id` — Delete notification.

### Feedbacks, CMS & Configuration
- `GET /api/feedbacks` — List customer reviews and ratings.
- `POST /api/feedbacks` — Submit feedback (auto-tags on-duty shift employees).
- `DELETE /api/feedbacks/:id` — Delete feedback (Manager only).
- `GET /api/posts` / `GET /api/posts/published` — List blog articles.
- `POST /api/posts` — Create blog post with backdating support and image links (Manager only).
- `PUT /api/posts/:id` / `DELETE /api/posts/:id` — Edit or delete blog post (Manager only).
- `GET /api/config` — Retrieve global shop settings, theme assets, and tax rates.
- `PUT /api/config` — Update website identity, hero images, and policies.
- `POST /api/uploads` — Upload image to R2 with MIME validation and 5MB size limit.
- `GET /api/images/:id` — Serve image asset from Cloudflare R2 bucket.

---

## 🧪 Automated Testing Suite

The repository includes comprehensive automated test suites run directly against the live environment:

### 1. Full E2E CRUD Suite (`scratch/test_full_e2e_crud.js`)
Tests **53 distinct test cases** covering `GET`, `POST`, `PUT`, `DELETE`, and `PATCH` operations across all 16 system entities:
```bash
node scratch/test_full_e2e_crud.js
```
*Output: `Total Tests: 53 | Passed: 53 | Failed: 0 (100% Success)`*

### 2. Worst-Case Failure Mode Suite (`scratch/test_worst_case_guards.js`)
Verifies security boundaries and edge-case recoveries:
```bash
node scratch/test_worst_case_guards.js
```
- 🛡️ Non-image file upload (.js, .exe) rejected (`400 Bad Request`)
- 🛡️ Empty items order payload rejected (`400 Bad Request`)
- 🛡️ Negative item quantity order rejected (`400 Bad Request`)
- 🛡️ Automatic inventory deduction and sales transaction sync on order completion
- 🛡️ Automatic inventory restoration and transaction voiding on order cancellation

---

## 🚀 Local Development & Deployment

### Local Development
```bash
# 1. Install dependencies
npm install

# 2. Run Vite dev server (frontend)
npm run dev

# 3. In another terminal, run Worker locally with D1/R2 emulation
npx wrangler dev
```

### Production Deployment
```bash
# 1. Build the production React bundle
npm run build

# 2. Deploy Worker and static assets to Cloudflare
npx wrangler deploy
```

---

## 👥 Authors & License

Developed with ❤️ by **Widi Firmansyah**.  
Open-source under the MIT License.
