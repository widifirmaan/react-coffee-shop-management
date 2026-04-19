# ☕ React - Coffee Shop Management Brutalist

**React - Coffee Shop Management Brutalist** is a state-of-the-art, web-based Point of Sale (POS) and Management System designed specifically for modern coffee shops. Built with a high-performance **Node.js (Express)** backend and a dynamic **React** frontend, it features a distinctive **Neo-Brutalist** design language that sets it apart from generic management tools. It is built to streamline daily operations in a coffee shop. The project focused on delivering a visually appealing interface with modern styling and practical functionality. The Brutalist design emphasized clean typography, intuitive navigation, and a warm color palette to reflect the cozy atmosphere.

![Status](https://img.shields.io/badge/Status-Active_Development-success?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-20.x-green?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express-4.18-black?style=for-the-badge&logo=express)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-forestgreen?style=for-the-badge&logo=mongodb)

---

## 📸 Application Showcase

Explore the comprehensive features of **React - Coffee Shop Management Brutalist** through our gallery.

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

## 🚀 Features Overview

### 🌐 Public & Customer Experience
*   **Dynamic Landing Page**: A high-impact, Neo-Brutalist designed homepage with interactive parallax elements.
*   **About & Story**: Engaging "Info Layer" showcasing the coffee shop's philosophy and history.
*   **Blog & News**: Integrated CMS-driven blog for latest updates, promos, and events.
*   **Digital Ordering**: 
    *   **Visual Menu**: Beautiful card-based layout with category filtering.
    *   **Smart Cart**: Effortless cart management with special instruction support.
    *   **Self-Checkout**: Guest name and table selection for seamless service.
    *   **Waiter Call**: Instant digital assistance trigger for customers.

### 📊 Management Dashboard (Manager & Staff)
*   **Operations Hub**: Real-time stats, team sticky notes, and live clock.
*   **Attendance System**: Integrated **Clock In/Out** with lateness tracking and shift alerts.
*   **Kitchen Display System (KDS)**: Real-time queue management (Pending ➔ Preparing ➔ Ready ➔ Served).
*   **Menu Management**: Full CRUD capabilities for products, categories, and pricing.
*   **Inventory Tracking**: Digital warehouse management with automated low-stock indicators.
*   **Finance & Sales**: Detailed transaction logs and revenue performance tracking.
*   **Staff & Shift Center**:
    *   **Employee Management**: Manage staff profiles, roles, and access.
    *   **Shift Scheduling**: Drag-and-drop weekly scheduler with role-based validation.
*   **CMS & Content Control**: Dedicated panel for managing blog posts and published media.
*   **Customer Feedback**: Centralized view for managing customer reviews and ratings.
*   **Site Settings**: Global configuration for shop identity, social links, and visual themes.

---

## 🛠 Tech Stack

### Backend (API Server)
*   **Framework**: Node.js + Express.js
*   **Database**: MongoDB (Mongoose)
*   **Security**: JWT (JSON Web Tokens) & Bcryptjs
*   **Runtime**: Node 18+ or 20+

### Frontend (Client App)
*   **Framework**: React.js 18
*   **Build Tool**: Vite 5
*   **Styling**: **Neo-Brutalist CSS**, Vanilla CSS modules, Lucide React Icons.
*   **Libraries**: `Axios`, `Swiper`, `React Router 6`.

---

## 📂 Project Structure

```bash
/
├── api/                   # Node.js Express Server (Primary Backend)
│   ├── models/            # Mongoose Schemas
│   ├── routes/            # API Endpoints
│   └── index.js           # Server Entry Point
│
├── frontend/              # React Vite Client (Frontend App)
│   ├── src/               # Application Source
│   └── assets/            # Global Styles & Assets
│
└── screenshots/           # Application Preview Images
```

---

## 📦 Getting Started (Monolith Mode)

The project is now a monolith. You can manage everything from the root directory.

### 1. Database (MongoDB)
Ensure MongoDB is installed and running on your local machine. We successfully started it with:
```bash
mongod --dbpath ./data/db
```

### 2. One-Time Setup
Install all dependencies for root, backend, and frontend with one command:
```bash
npm run install-all
```

### 3. Build & Run (Production/Monolith)
To run the application as a single unit (API + Frontend):
1. **Build the frontend**:
   ```bash
   npm run build
   ```
2. **Start the monolith server**:
   ```bash
   npm start
   ```
*Access the full app at `http://localhost:3000`*

### 4. Development Mode
To run both backend and frontend concurrently with Hot Module Replacement (HMR):
```bash
npm run dev
```
*API runs on `http://localhost:3000`, Frontend runs on `http://localhost:8085`*

---

## 🔑 Access & Credentials

| Role | Access URL | Identifier | Password |
| :--- | :--- | :--- | :--- |
| **Manager** | `http://localhost:8085/login` | `manager` | `password123` |
| **Staff** | `http://localhost:8085/login` | *Employee Email* | `password123` |
| **Customer** | `http://localhost:8085/order` | N/A | N/A |

> [!TIP]
> - **Default Staff Email**: You can use `manager` or `michael@americano.com` for testing.
> - **Data Reset**: To reset or re-seed the database with dummy data, visit `http://localhost:3000/api/seeder/run` while the backend is running.


---

## 👥 Authors
Developed by **Widi Firmaan** and the **Project Team**.
