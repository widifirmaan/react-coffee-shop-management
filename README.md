# ☕ Siap Nyafe - Modern Coffee Shop Management System

**Siap Nyafe** is a state-of-the-art, web-based Point of Sale (POS) and Management System designed specifically for modern coffee shops. Built with a high-performance **Spring Boot** backend and a dynamic **React** frontend, it features a distinctive **Neo-Brutalist** design language that sets it apart from generic management tools.

![Status](https://img.shields.io/badge/Status-Active_Development-success?style=for-the-badge)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2.1-green?style=for-the-badge&logo=spring)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-forestgreen?style=for-the-badge&logo=mongodb)

---

## 🚀 Features Overview

### �️ Customer Experience (Ordering)
*   **Visual Menu**: Beautiful card-based layout with category filtering (Coffee, Non-Coffee, Snacks).
*   **Smart Cart**: easy-to-use cart with quantity adjustments and special instruction fields (e.g., "Less Ice").
*   **Self-Service**: Customers can input their name and table number directly.
*   **Payment Integration**: Options for Cash, QRIS, and Card payments.

### 👨‍🍳 Kitchen Display System (KDS)
*   **Real-Time Workflow**: Orders appear instantly with status states: `PENDING` ➔ `PREPARING` ➔ `READY` ➔ `SERVED`.
*   **Digital Tickets**: Replaces paper tickets with clear, readable digital cards showing items, table, and notes.
*   **Staff Assignment**: Tracks which shift member is handling specific orders.

### � Admin & Management Dashboard
*   **Dashboard Hub**: A central view with sticky notes for team communication and quick stats.
*   **Inventory Management**: Track ingredient levels, units, and low-stock alerts.
*   **Finance & Transactions**: detailed logs of all sales and revenue tracking.
*   **Employee Hub**: Manage staff profiles, roles, and shift schedules.
*   **Menu CMS**: effortless addition/editing of menu items, prices, and images.
*   **Content Management**: Manage the "Latest Drops" (News/Blog) section dynamically.

### ⚙️ System Configuration
*   **Dynamic Branding**: Change the Shop Name, Address, Social Media links, and Logo directly from settings.
*   **Security**: Role-based access control (Admin, Employee) using Spring Security.

---

## 🛠 Tech Stack

### Backend (API Server)
*   **Framework**: Java 21 + Spring Boot 3.2.1
*   **Database**: MongoDB
*   **Security**: Spring Security (JWT/Session)
*   **Build Tool**: Maven
*   **Key Modules**: `Lombok` (Boilerplate reduction), `Spring Data MongoDB`.

### Frontend (Client App)
*   **Framework**: React.js 18
*   **Build Tool**: Vite 5 (Super fast HMR)
*   **Styling**: **Neo-Brutalist CSS**, Vanilla CSS modules, Lucide React Icons.
*   **Libraries**: `Axios` (API requests), `Swiper` (Carousels), `React Router 6`.

---

## 📂 Project Structure

```bash
/
├── backend/                 # Spring Boot Server
│   ├── src/main/java/...   # Controllers, Services, Models, Repositories
│   └── src/main/resources/ # Config (application.properties)
│
└── frontend/                # React Vite Client
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── pages/          # Full page views (Dashboard, Menu, Kitchen, etc.)
    │   └── assets/         # Images and global styles
    └── public/             # Static assets
```

---

## 📦 Getting Started

### Prerequisites
*   **Java JDK 17** or higher (JDK 21 Recommended)
*   **Node.js 18** or higher
*   **MongoDB** (Local instance or MongoDB Atlas connection string)

### 1. Backend Setup
Navigate to the backend directory and start the Spring Boot server.

```bash
cd backend
# Run with Maven Wrapper (Linux/Mac)
./mvnw spring-boot:run
# OR standard Maven
mvn spring-boot:run
```
*The server will start on `http://localhost:8080`*

### 2. Frontend Setup
Open a new terminal, navigate to the frontend, and start the Vite dev server.

```bash
cd frontend
npm install
npm run dev
```
*The client will start on `http://localhost:3000`*

---

## � API Endpoints Snapshot

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/menus` | Fetch all menu items |
| `POST` | `/api/orders` | Create a new customer order |
| `GET` | `/api/orders/status/{status}` | Filter orders (e.g., PENDING) |
| `GET` | `/api/ingredients` | Get inventory stock levels |
| `POST` | `/api/auth/login` | Staff authentication |
| `GET` | `/api/shop-config` | Get shop metadata (name, logo) |

---

## 🛣 Roadmap & Status

- [x] **Core Ordering System** (Menu ➔ Cart ➔ Order)
- [x] **Kitchen Workflow** (Status updates)
- [x] **Admin Dashboard** (Analytics & Overview)
- [x] **Inventory System** (Ingredient Stock)
- [x] **Employee & Shift Management**
- [x] **CMS for Landing Page**
- [ ] **Advanced Reporting** (Export PDF/Excel)
- [ ] **Customer Loyalty Points**
- [ ] **Multi-location Support**

---

## 👥 Authors
Developed by **Widi Firmaan** and the **Siap Nyafe Team**.
