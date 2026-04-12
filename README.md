# ☕ Siap Nyafe - Modern Coffee Shop Management System

**Siap Nyafe** is a state-of-the-art, web-based Point of Sale (POS) and Management System designed specifically for modern coffee shops. Built with a high-performance **Node.js (Express)** backend and a dynamic **React** frontend, it features a distinctive **Neo-Brutalist** design language that sets it apart from generic management tools.

![Status](https://img.shields.io/badge/Status-Active_Development-success?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-20.x-green?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express-4.18-black?style=for-the-badge&logo=express)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-forestgreen?style=for-the-badge&logo=mongodb)

---

## 📸 Application Showcase

Explore the comprehensive features of **Siap Nyafe** through our gallery.

| | |
|:---:|:---:|
| ![Screenshot 1](screenshots/shot_01.png)<br>**Dashboard** | ![Screenshot 2](screenshots/shot_02.png)<br>**Confirmation Modal** |
| ![Screenshot 3](screenshots/shot_03.png)<br>**Alert** | ![Screenshot 4](screenshots/shot_04.png)<br>**Table** |
| ![Screenshot 5](screenshots/shot_05.png)<br>**Modal Edit Menu** | ![Screenshot 6](screenshots/shot_06.png)<br>**Queue Manager** |
| ![Screenshot 7](screenshots/shot_07.png)<br>**Order History** | ![Screenshot 8](screenshots/shot_08.png)<br>**Edit Stock Modal** |
| ![Screenshot 9](screenshots/shot_09.png)<br>**Edit Staff Modal** | ![Screenshot 10](screenshots/shot_10.png)<br>**Finance & Transactions** |
| ![Screenshot 11](screenshots/shot_11.png)<br>**Blog CMS Post Edit Modal** | ![Screenshot 12](screenshots/shot_12.png)<br>**Store Settings** |
| ![Screenshot 13](screenshots/shot_13.png)<br>**Homepage** | ![Screenshot 14](screenshots/shot_14.png)<br>**Blog Post Page** |
| ![Screenshot 15](screenshots/shot_15.png)<br>**About View** | ![Screenshot 16](screenshots/shot_16.png)<br>**Menu List & Details** |
| ![Screenshot 17](screenshots/shot_17.png)<br>**Cart System** | ![Screenshot 18](screenshots/shot_18.png)<br>**Checkout** |
| ![Screenshot 19](screenshots/shot_19.png)<br>**Call Waiter** | **Coming Soon** |

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
Developed by **Widi Firmaan** and the **Siap Nyafe Team**.
