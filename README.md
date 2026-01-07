# ☕ SIAP NYAFE - Modern Coffee Shop Management System

**Siap Nyafe** is a comprehensive, modern web-based Point of Sale (POS) and Management System designed for coffee shops. It features a Neo-Brutalist design language, robust backend, and seamless real-time interaction between customers, kitchen staff, and administration.

![Project Status](https://img.shields.io/badge/Status-Active%20Development-green)
![Tech Stack](https://img.shields.io/badge/Stack-SpringBoot%20%7C%20React%20%7C%20MongoDB-blue)

---

## 🚀 Key Features

### 🛒 Customer Ordering (QR / Public View)
- **Interactive Menu**: Beautiful card-based menu with categories (Swipeable on mobile).
- **Cart & Checkout**: Easy-to-use cart system.
- **Dynamic Ordering**: Customers can input Name, Table Number (Dropdown), and **Special Notes** (e.g., "Less Sugar").
- **Payment Methods**: Support for Cash, QRIS, Bank Transfer, E-Wallet, and Debit/Credit.
- **Real-time Updates**: Order status flows directly to the kitchen.
- **Shop Info**: Dynamic shop details (Name, Logo, Contact) fetched from Admin Settings.

### 👨‍🍳 Kitchen Display System (KDS)
- **Live Order Board**: Real-time view of incoming orders.
- **Workflow Management**:
  - `PENDING` -> `PREPARING` -> `READY` -> `COMPLETED`.
- **Detailed Cards**: Shows items, customer info, table number, notes (highlighted), and assigned shift staff.
- **Edit Capability**: Staff can edit orders (add items, change table, update payment method) directly from the kitchen view.
- **Order History**: Log of completed orders with Requeue nctionality.

### 📊 Admin Dashboard & Management
- **Dashboard**: Visual analytics of Revenue, Popular Items, and Order Traffic.
- **Menu Management**: Add, edit, delete menu items with images, prices, and availability toggles.
- **Employee & Shift**: Manage staff roles (Cashier, Barista, Kitchen, etc.) and assign them to shifts.
- **Shop Settings**: Configure Shop Name, Address, Social Media, and Logo dynamically.
- **Authentication**: Secure login for staff/admin using JWT/Session-based auth.

---

## 🛠 Technology Stack

### Backend
- **Framework**: Java Spring Boot 3
- **Database**: MongoDB
- **Security**: Spring Security (Custom User Details, Password Encoding)
- **Build Tool**: Maven

### Frontend
- **Framework**: React.js (Vite)
- **Styling**: Vanilla CSS + Inline Styles (Neo-Brutalist Aesthetic) & Lucide Icons
- **HTTP Client**: Axios
- **State**: React Hooks (useState, useEffect)

---

## 📦 Installation & Setup

### Prerequisites
- JDK 17+
- Node.js 18+
- MongoDB (Running locally or Atlas)

### 1. Backend Setup
```bash
cd backend
mvn spring-boot:run
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

## 🛣 Future Roadmap
- [x] Basic Ordering & Kitchen Flow
- [x] Admin Dashboard & Analytics
- [x] Edit Order & Payment Methods
- [ ] **Inventory Management system** (Ingredient tracking)
- [ ] **Customer Loyalty Program**
- [ ] **Multi-branch Support**
- [ ] **Kitchen Printer Integration** (Thermal receipt printing)
- [ ] **Detailed Financial Reports** (Export to Excel/PDF)

---

## 👥 Authors
Developed by **Widi Firmaan** and the **Siap Nyafe Team**.
