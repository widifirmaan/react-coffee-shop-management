# ☕ Siap Nyafe - Modern Coffee Shop Management System

**Siap Nyafe** is a state-of-the-art, web-based Point of Sale (POS) and Management System designed specifically for modern coffee shops. Built with a high-performance **Spring Boot** backend and a dynamic **React** frontend, it features a distinctive **Neo-Brutalist** design language that sets it apart from generic management tools.

![Status](https://img.shields.io/badge/Status-Active_Development-success?style=for-the-badge)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2.1-green?style=for-the-badge&logo=spring)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-forestgreen?style=for-the-badge&logo=mongodb)

---

## 📸 Application Showcase

Explore the comprehensive features of **Siap Nyafe** through our gallery.

| | |
|:---:|:---:|
| ![Screenshot 1](screenshots/shot_01.png)<br>**Dashboard** | ![Screenshot 2](screenshots/shot_02.png)<br>**Mobile / Menu Detail** |
| ![Screenshot 3](screenshots/shot_03.png)<br>**Cart / Order Summary** | ![Screenshot 4](screenshots/shot_04.png)<br>**Customer Order View** |
| ![Screenshot 5](screenshots/shot_05.png)<br>**Kitchen Display System (KDS)** | ![Screenshot 6](screenshots/shot_06.png)<br>**Manager Dashboard Overview** |
| ![Screenshot 7](screenshots/shot_07.png)<br>**Real-time Statistics** | ![Screenshot 8](screenshots/shot_08.png)<br>**Menu Management (CMS)** |
| ![Screenshot 9](screenshots/shot_09.png)<br>**Inventory Tracking** | ![Screenshot 10](screenshots/shot_10.png)<br>**Staff & Shift Management** |
| ![Screenshot 11](screenshots/shot_11.png)<br>**Finance & Transactions** | ![Screenshot 12](screenshots/shot_12.png)<br>**Blog / Post Management** |
| ![Screenshot 13](screenshots/shot_13.png)<br>**Shop Settings** | ![Screenshot 14](screenshots/shot_14.png)<br>**Order History** |
| ![Screenshot 15](screenshots/shot_15.png)<br>**Detail View** | ![Screenshot 16](screenshots/shot_16.png)<br>**Edit Modal / Form** |
| ![Screenshot 17](screenshots/shot_17.png)<br>**System Configuration** | ![Screenshot 18](screenshots/shot_18.png)<br>**User Profile** |
| ![Screenshot 19](screenshots/shot_19.png)<br>**Mobile Responsive View** | |

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
