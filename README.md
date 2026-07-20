# ☕ React - Coffee Shop Management Brutalist

**React - Coffee Shop Management Brutalist** is a web-based Point of Sale (POS) and Management System for coffee shops. Built as a single **Cloudflare Worker** serving both a React frontend and a REST API, with **Cloudflare D1** (SQL) as the database and **R2** for image storage. Features a distinctive **Neo-Brutalist** design language.

![Status](https://img.shields.io/badge/Status-Active_Development-success?style=for-the-badge)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=for-the-badge&logo=cloudflare)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![D1](https://img.shields.io/badge/D1-SQL-1C1E24?style=for-the-badge&logo=cloudflare)

---

## 📸 Application Showcase

| | |
|:---:|:---:|
| ![Desktop Page](screenshots/Desktop%20Page.png)<br>**Desktop Page** | ![Dashboard Page](screenshots/Dashboard%20Page.png)<br>**Dashboard Page** |
| ![About Page](screenshots/About%20Page.png)<br>**About Page** | ![Alert Modal](screenshots/Alert%20Modal.png)<br>**Alert Modal** |
| ![Blog CMS Page](screenshots/Blog%20CMS%20Page.png)<br>**Blog CMS Page** | ![Blog Post Page](screenshots/Blog%20Post%20Page.png)<br>**Blog Post Page** |
| ![Call Waiter Modal](screenshots/Call%20Waiter%20Modal.png)<br>**Call Waiter Modal** | ![Chart Modal](screenshots/Chart%20Modal.png)<br>**Chart Modal** |
| ![Checkout Modal](screenshots/Checkout%20Modal.png)<br>**Checkout Modal** | ![Confirmation Modal](screenshots/Confirmation%20Modal.png)<br>**Confirmation Modal** |
| ![Customer Order Page](screenshots/Customer%20Order%20Page.png)<br>**Customer Order Page** | ![Edit Employee Modal](screenshots/Edit%20Employee%20Modal.png)<br>**Edit Employee Modal** |
| ![Feedback Page](screenshots/Feedback%20Page.png)<br>**Feedback Page** | ![Footer with Feedback Page](screenshots/Footer%20with%20Feedback%20Page.png)<br>**Footer with Feedback Page** |
| ![Inventory Page](screenshots/Inventory%20Page.png)<br>**Inventory Page** | ![Kitchen Queue Page](screenshots/Kitchen%20Queue%20Page.png)<br>**Kitchen Queue Page** |
| ![Login Page](screenshots/Login%20Page.png)<br>**Login Page** | ![Menu Grid Page](screenshots/Menu%20Grid%20Page.png)<br>**Menu Grid Page** |
| ![Menu Management Page](screenshots/Menu%20Management%20Page.png)<br>**Menu Management Page** | ![Order History Page](screenshots/Order%20History%20Page.png)<br>**Order History Page** |
| ![Shift Management Page](screenshots/Shift%20Management%20Page.png)<br>**Shift Management Page** | ![Site Settings Page](screenshots/Site%20Settings%20Page.png)<br>**Site Settings Page** |
| ![Staff Management Page](screenshots/Staff%20Management%20Page.png)<br>**Staff Management Page** | ![Transaction Page](screenshots/Transaction%20Page.png)<br>**Transaction Page** |
| ![Waiter Page](screenshots/Waiter%20Page.png)<br>**Waiter Page** | **Coming Soon** |
| ![Mobile Landing Page](screenshots/Mobile%20Landing%20Page.png)<br>**Mobile View: Landing** | ![Mobile About Page](screenshots/Mobile%20About%20Page.png)<br>**Mobile View: About** |

---

## 🚀 Features

### Public & Customer
- **Dynamic Landing Page** with Neo-Brutalist design
- **About & Story** section
- **Blog & News** (CMS-driven)
- **Digital Ordering**: menu grid, cart, self-checkout, waiter call
- **Customer Feedback** form

### Management Dashboard
- **Operations Hub**: real-time stats, sticky notes, live clock
- **Attendance**: clock in/out with lateness tracking
- **Kitchen Display**: queue management (Pending → Preparing → Ready → Served)
- **Menu Management**: CRUD for products, categories, pricing
- **Inventory**: stock tracking with low-stock alerts
- **Finance**: transaction logs, revenue tracking
- **Staff & Shift Center**: employee profiles, role-based access, shift scheduling
- **CMS**: blog post management
- **Settings**: shop identity, social links, themes

---

## 🛠 Tech Stack

### Backend (API)
- **Runtime**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite-compatible)
- **File Storage**: Cloudflare R2 (images)
- **Auth**: JWT (Web Crypto API) + Bcryptjs
- **Framework**: Vanilla JavaScript (no Express)

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite 5
- **Styling**: Neo-Brutalist CSS, Lucide React Icons
- **Libraries**: Axios, Swiper, React Router 6

---

## 📂 Project Structure

```
/
├── worker.js           # Single Cloudflare Worker (API + static assets)
├── wrangler.jsonc      # Cloudflare Workers config
├── schema.sql          # D1 database schema
├── src/                # React app source
├── public/             # Static assets (images, etc.)
├── dist/               # Vite build output (auto-generated)
└── screenshots/        # Preview images
```

---

## 🚀 Deployment (Cloudflare)

### Prerequisites
- Cloudflare account with Workers, D1, and R2 enabled
- `wrangler` CLI (`npx wrangler`)

### 1. Create D1 Database
```bash
npx wrangler d1 create siapnyafe-db
```
Copy the returned `database_id` into `wrangler.jsonc`.

### 2. Initialize Schema
```bash
npx wrangler d1 execute siapnyafe-db --file=schema.sql --remote
```

### 3. Create R2 Bucket
```bash
npx wrangler r2 bucket create siapnyafe-images
```

### 4. Set Secrets
```bash
echo '<your-jwt-secret>' | npx wrangler secret put JWT_SECRET
echo '<your-seed-secret>' | npx wrangler secret put SEED_SECRET
```

### 5. Deploy
```bash
npm run deploy
```

### 6. Seed Database
```bash
curl -X POST https://siapnyafe.widifirmaan.web.id/api/seed \
  -H "Content-Type: application/json" \
  -d '{"secret":"<your-seed-secret>"}'
```

---

## 💻 Development

```bash
# Install dependencies
npm install

# Run dev server (frontend + API proxy)
npm run dev

# Build for production
npm run build
```

In development, the frontend runs on `http://localhost:8085` with API requests proxied to `http://localhost:3000`. To test the API locally, you can run the Worker locally:

```bash
npx wrangler dev
```

---

## 🔑 Credentials

| Role | Username | Password |
| :--- | :--- | :--- |
| **Manager** | `manager` | `manager123` |
| **Cashier** | `cashier` | `cashier123` |

---

## 👥 Authors

Developed by **Widi Firmansyah**.
