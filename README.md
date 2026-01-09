# ☕ Siap Nyafe - Modern Coffee Shop Management System

**Siap Nyafe** is a state-of-the-art, web-based Point of Sale (POS) and Management System designed specifically for modern coffee shops. Built with a high-performance **Spring Boot** backend and a dynamic **React** frontend, it features a distinctive **Neo-Brutalist** design language that sets it apart from generic management tools.

![Status](https://img.shields.io/badge/Status-Active_Development-success?style=for-the-badge)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2.1-green?style=for-the-badge&logo=spring)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-forestgreen?style=for-the-badge&logo=mongodb)

---

## 📸 Application Showcase

### Customer Ordering Experience
The customer-facing interface is designed for self-service kiosks or tablets, featuring a bold, high-contrast design.

| Landing Page (CMS) | Order Page (Customer) |
|:---:|:---:|
| ![Landing Page](screenshots/01_landing.png) | ![Order Page](screenshots/02_order_page.png) |

### Operations & Staff
Streamlined tools for kitchen staff and secure authentication.

| Kitchen Display System (KDS) | Staff Login Portal |
|:---:|:---:|
| ![Kitchen Display](screenshots/03_kitchen.png) | ![Login Page](screenshots/04_login.png) |

### Manager Dashboard & Administration
Comprehensive admin panel for analytics, inventory, and staff scheduling.

| Dashboard Overview | Finance & Order History |
|:---:|:---:|
| ![Dashboard Home](screenshots/05_dashboard.png) | ![Finance](screenshots/09_finance.png) |

| Inventory Management | Menu Management |
|:---:|:---:|
| ![Inventory](screenshots/07_inventory_management.png) | ![Menu Mgmt](screenshots/06_menu_management.png) |

| Staff Management | Content (Blog) & Settings |
|:---:|:---:|
| ![Staff](screenshots/08_staff_management.png) | ![Posts](screenshots/10_posts.png) |

| Shop Settings |
|:---:|
| ![Settings](screenshots/11_settings.png) |

---

## 🚀 Features Overview

### 🛒 Customer Experience (Ordering)
*   **Visual Menu**: Beautiful card-based layout with category filtering (Coffee, Non-Coffee, Snacks).
*   **Smart Cart**: Easy-to-use cart with quantity adjustments and special instruction fields.
*   **Self-Service**: Customers can input their name and table number directly.
*   **Payment Integration**: Options for Cash, QRIS, and Card payments.

### 👨‍🍳 Kitchen Display System (KDS)
*   **Real-Time Workflow**: Orders appear instantly with status states: `PENDING` ➔ `PREPARING` ➔ `READY` ➔ `SERVED`.
*   **Digital Tickets**: Replaces paper tickets with clear, readable digital cards showing items, table, and notes.
*   **Staff Assignment**: Tracks which shift member is handling specific orders.

### 📊 Admin & Management Dashboard
*   **Dashboard Hub**: A central view with sticky notes for team communication and quick stats.
*   **Inventory Management**: Track ingredient levels, units, and low-stock alerts.
*   **Finance & Transactions**: Detailed logs of all sales and revenue tracking.
*   **Employee Hub**: Manage staff profiles, roles, and shift schedules.
*   **Menu CMS**: Effortless addition/editing of menu items, prices, and images.

---

## 🛠 Tech Stack

### Backend (API Server)
*   **Framework**: Java 21 + Spring Boot 3.2.1
*   **Database**: MongoDB
*   **Security**: Spring Security (JWT/Session)
*   **Build Tool**: Maven

### Frontend (Client App)
*   **Framework**: React.js 18
*   **Build Tool**: Vite 5
*   **Styling**: **Neo-Brutalist CSS**, Vanilla CSS modules, Lucide React Icons.
*   **Libraries**: `Axios`, `Swiper`, `React Router 6`.

---

## 📂 Project Structure

```bash
/
├── backend/                 # Spring Boot Server
│   ├── src/main/java/...   # Controllers, Services, Models
│   └── src/main/resources/ # Application Config
│
└── frontend/                # React Vite Client
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── pages/          # Full page views
    │   └── assets/         # Images and global styles
    └── screenshots/        # Project display images
```

---

## 📦 Getting Started

### Prerequisites
*   **Java JDK 17+** (JDK 21 Recommended)
*   **Node.js 18+**
*   **MongoDB**

### 1. Backend Setup
```bash
cd backend
./mvnw spring-boot:run
```
*Server runs on `http://localhost:8080`*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Client runs on `http://localhost:3000`*

---

## 👥 Authors
Developed by **Widi Firmaan** and the **Siap Nyafe Team**.
