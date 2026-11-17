# Siap Nyafe POS

> Fullstack coffee shop point-of-sale, customer self-ordering portal, kitchen display system, and operational management platform built with React 18, Cloudflare Workers, and Cloudflare D1.

Siap Nyafe is a full-stack coffee shop management and point-of-sale (POS) web application built with React 18 and a serverless Cloudflare Workers backend powered by Cloudflare D1 SQLite and R2 object storage. Engineered with a bold Neo-Brutalist design system, the platform provides a public customer self-ordering menu, cashier register terminal with instant change calculation, real-time kitchen display system (KDS) order workflows, raw ingredient inventory tracking, staff roster scheduling, equipment asset depreciation logs, and managerial financial accounting.

[![Live Demo](https://img.shields.io/badge/Demo-siapnyafe.widifirmaan.web.id-10B981?style=flat-square&logo=cloudflare&logoColor=white)](https://siapnyafe.widifirmaan.web.id)
[![React 18](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite 5](https://img.shields.io/badge/Vite-5.0.0-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Cloudflare Workers](https://img.shields.io/badge/Backend-Cloudflare_Workers-F38020?style=flat-square&logo=cloudflareworkers&logoColor=white)](https://workers.cloudflare.com/)
[![Cloudflare D1](https://img.shields.io/badge/Database-Cloudflare_D1_SQLite-F38020?style=flat-square&logo=sqlite&logoColor=white)](https://developers.cloudflare.com/d1/)
[![React Router](https://img.shields.io/badge/Router-v6.18-CA4245?style=flat-square&logo=reactrouter&logoColor=white)](https://reactrouter.com/)
[![Lucide Icons](https://img.shields.io/badge/Icons-Lucide_React-F56565?style=flat-square)](https://lucide.dev/)
[![Design System](https://img.shields.io/badge/Design-Neo--Brutalism-FCD34D?style=flat-square)](#features)

---

## Live Production

- **URL:** [https://siapnyafe.widifirmaan.web.id](https://siapnyafe.widifirmaan.web.id)
- **Deployment:** Cloudflare Workers & Cloudflare Pages (`siapnyafe.widifirmaan.web.id`)
- **Backend Architecture:** Serverless Edge Worker (`worker.js`), Cloudflare D1 Database (`siapnyafe`), and Cloudflare R2 (`siapnyafe-images`)

---

## Showcase

### 1. Customer Brand & Self-Ordering Experience (`/`, `/order`)

| Desktop Interface (MacBook Pro M4) | Mobile Interface (iPhone 16 Pro) |
| :---: | :---: |
| **Public Brand Landing CMS (Hero View)**<br>![Public Brand Landing CMS Desktop](screenshots/Coffee%20Landing%20CMS%20Hero%20Desktop.png) | **Public Brand Landing CMS (Hero View)**<br>![Public Brand Landing CMS Mobile](screenshots/Coffee%20Landing%20CMS%20Hero%20Mobile.png) |
| **Brand Story & Split Gate (Info Section)**<br>![Brand Story Info Section Desktop](screenshots/Coffee%20Landing%20CMS%20Info%20Section%20Desktop.png) | **Brand Story & Split Gate (Info Section)**<br>![Brand Story Info Section Mobile](screenshots/Coffee%20Landing%20CMS%20Info%20Section%20Mobile.png) |
| **Promotional Roasts & Specials (Latest Drop Section)**<br>![Latest Drop Section Desktop](screenshots/Coffee%20Landing%20CMS%20Latest%20Drop%20Desktop.png) | **Promotional Roasts & Specials (Latest Drop Section)**<br>![Latest Drop Section Mobile](screenshots/Coffee%20Landing%20CMS%20Latest%20Drop%20Mobile.png) |
| **Fullscreen Signature Menu (Menu Section)**<br>![Fullscreen Signature Menu Desktop](screenshots/Coffee%20Landing%20CMS%20Menu%20Section%20Desktop.png) | **Fullscreen Signature Menu (Menu Section)**<br>![Fullscreen Signature Menu Mobile](screenshots/Coffee%20Landing%20CMS%20Menu%20Section%20Mobile.png) |
| **Signature Menu Item Specifications (Menu Detail Modal)**<br>![Signature Menu Item Modal Desktop](screenshots/Coffee%20Landing%20CMS%20Menu%20Detail%20Modal%20Desktop.png) | **Signature Menu Item Specifications (Menu Detail Modal)**<br>![Signature Menu Item Modal Mobile](screenshots/Coffee%20Landing%20CMS%20Menu%20Detail%20Modal%20Mobile.png) |
| **Promotional Coffee Story Reader (Blog Article Modal)**<br>![Landing Blog Article Modal Desktop](screenshots/Coffee%20Landing%20CMS%20Blog%20Post%20Modal%20Desktop.png) | **Promotional Coffee Story Reader (Blog Article Modal)**<br>![Landing Blog Article Modal Mobile](screenshots/Coffee%20Landing%20CMS%20Blog%20Post%20Modal%20Mobile.png) |
| **Customer Self-Order Catalog (`/order`)**<br>![Customer Order Catalog Desktop](screenshots/Coffee%20Customer%20Order%20Page%20Desktop.png) | **Customer Self-Order Catalog (`/order`)**<br>![Customer Order Catalog Mobile](screenshots/Coffee%20Customer%20Order%20Page%20Mobile.png) |
| **Beverage Customization & Preferences (Item Modal)**<br>![Customer Item Customization Modal Desktop](screenshots/Coffee%20Customer%20Modal%20Customization%20Desktop.png) | **Beverage Customization & Preferences (Item Modal)**<br>![Customer Item Customization Modal Mobile](screenshots/Coffee%20Customer%20Modal%20Customization%20Mobile.png) |
| **High-Resolution Beverage View (Image Zoom Modal)**<br>![Customer Image Zoom Modal Desktop](screenshots/Coffee%20Customer%20Image%20Zoom%20Modal%20Desktop.png) | **High-Resolution Beverage View (Image Zoom Modal)**<br>![Customer Image Zoom Modal Mobile](screenshots/Coffee%20Customer%20Image%20Zoom%20Modal%20Mobile.png) |
| **Real-Time Cart Tray & Order Summary (Cart Modal)**<br>![Customer Cart Modal Desktop](screenshots/Coffee%20Customer%20Modal%20Cart%20Desktop.png) | **Real-Time Cart Tray & Order Summary (Cart Modal)**<br>![Customer Cart Modal Mobile](screenshots/Coffee%20Customer%20Modal%20Cart%20Mobile.png) |
| **Table Number & Customer Information (Checkout Modal)**<br>![Customer Checkout Modal Desktop](screenshots/Coffee%20Customer%20Modal%20Checkout%20Desktop.png) | **Table Number & Customer Information (Checkout Modal)**<br>![Customer Checkout Modal Mobile](screenshots/Coffee%20Customer%20Modal%20Checkout%20Mobile.png) |
| **Pre-Dispatch Order Review (Confirm Order Modal)**<br>![Customer Confirm Order Modal Desktop](screenshots/Coffee%20Customer%20Modal%20Confirm%20Order%20Desktop.png) | **Pre-Dispatch Order Review (Confirm Order Modal)**<br>![Customer Confirm Order Modal Mobile](screenshots/Coffee%20Customer%20Modal%20Confirm%20Order%20Mobile.png) |
| **Order Confirmation Ticket (Pesanan Diterima Modal)**<br>![Customer Order Success Modal Desktop](screenshots/Coffee%20Customer%20Modal%20Order%20Success%20Desktop.png) | **Order Confirmation Ticket (Pesanan Diterima Modal)**<br>![Customer Order Success Modal Mobile](screenshots/Coffee%20Customer%20Modal%20Order%20Success%20Mobile.png) |
| **Floor Assistance & Bill Request (Call Waiter Modal)**<br>![Customer Call Waiter Modal Desktop](screenshots/Coffee%20Customer%20Modal%20Call%20Waiter%20Desktop.png) | **Floor Assistance & Bill Request (Call Waiter Modal)**<br>![Customer Call Waiter Modal Mobile](screenshots/Coffee%20Customer%20Modal%20Call%20Waiter%20Mobile.png) |
| **Table Waiter Summon Notification (Toast Alert)**<br>![Customer Waiter Alert Desktop](screenshots/Coffee%20Customer%20Alert%20Waiter%20Notified%20Desktop.png) | **Table Waiter Summon Notification (Toast Alert)**<br>![Customer Waiter Alert Mobile](screenshots/Coffee%20Customer%20Alert%20Waiter%20Notified%20Mobile.png) |

---

### 2. Point of Sale (POS) & Kitchen Barista Operations (`/cashier`, `/kitchen`, `/waiter`)

| Desktop Interface (MacBook Pro M4) | Mobile Interface (iPhone 16 Pro) |
| :---: | :---: |
| **Cashier Point-of-Sale Register Terminal (`/cashier`)**<br>![Cashier POS Register Desktop](screenshots/Coffee%20Cashier%20POS%20Register%20Desktop.png) | **Cashier Point-of-Sale Register Terminal (`/cashier`)**<br>![Cashier POS Register Mobile](screenshots/Coffee%20Cashier%20POS%20Register%20Mobile.png) |
| **Thermal Receipt & Invoice Print Modal (Cashier Receipt)**<br>![Cashier Modal Thermal Receipt Desktop](screenshots/Coffee%20Cashier%20Modal%20Thermal%20Receipt%20Desktop.png) | **Thermal Receipt & Invoice Print Modal (Cashier Receipt)**<br>![Cashier Modal Thermal Receipt Mobile](screenshots/Coffee%20Cashier%20Modal%20Thermal%20Receipt%20Mobile.png) |
| **POS Insufficient Cash Payment (Underpaid Error Alert)**<br>![Cashier Underpaid Alert Desktop](screenshots/Coffee%20Cashier%20Alert%20Underpaid%20Error%20Desktop.png) | **POS Insufficient Cash Payment (Underpaid Error Alert)**<br>![Cashier Underpaid Alert Mobile](screenshots/Coffee%20Cashier%20Alert%20Underpaid%20Error%20Mobile.png) |
| **POS Empty Cart Validation (Empty Cart Error Alert)**<br>![Cashier Empty Cart Alert Desktop](screenshots/Coffee%20Cashier%20Alert%20Empty%20Cart%20Error%20Desktop.png) | **POS Empty Cart Validation (Empty Cart Error Alert)**<br>![Cashier Empty Cart Alert Mobile](screenshots/Coffee%20Cashier%20Alert%20Empty%20Cart%20Error%20Mobile.png) |
| **POS Order Finalized & Stored (Completed Toast Alert)**<br>![Cashier Order Completed Alert Desktop](screenshots/Coffee%20Cashier%20Alert%20Order%20Completed%20Desktop.png) | **POS Order Finalized & Stored (Completed Toast Alert)**<br>![Cashier Order Completed Alert Mobile](screenshots/Coffee%20Cashier%20Alert%20Order%20Completed%20Mobile.png) |
| **Barista Kitchen Display System (KDS) (`/kitchen`)**<br>![Kitchen Display System Desktop](screenshots/Coffee%20Kitchen%20Display%20System%20Desktop.png) | **Barista Kitchen Display System (KDS) (`/kitchen`)**<br>![Kitchen Display System Mobile](screenshots/Coffee%20Kitchen%20Display%20System%20Mobile.png) |
| **Order Preparation Transition (Kitchen Status Confirm Modal)**<br>![Kitchen Status Confirm Modal Desktop](screenshots/Coffee%20Kitchen%20Modal%20Status%20Confirm%20Desktop.png) | **Order Preparation Transition (Kitchen Status Confirm Modal)**<br>![Kitchen Status Confirm Modal Mobile](screenshots/Coffee%20Kitchen%20Modal%20Status%20Confirm%20Mobile.png) |
| **Kitchen Ticket Modifier & Note Editor (Edit Order Modal)**<br>![Kitchen Edit Order Modal Desktop](screenshots/Coffee%20Kitchen%20Modal%20Edit%20Order%20Desktop.png) | **Kitchen Ticket Modifier & Note Editor (Edit Order Modal)**<br>![Kitchen Edit Order Modal Mobile](screenshots/Coffee%20Kitchen%20Modal%20Edit%20Order%20Mobile.png) |
| **Kitchen Status Transition Broadcast (Toast Alert)**<br>![Kitchen Status Alert Desktop](screenshots/Coffee%20Kitchen%20Alert%20Status%20Updated%20Desktop.png) | **Kitchen Status Transition Broadcast (Toast Alert)**<br>![Kitchen Status Alert Mobile](screenshots/Coffee%20Kitchen%20Alert%20Status%20Updated%20Mobile.png) |
| **Floor Table Assistance Queue (`/waiter`)**<br>![Waiter Service Queue Desktop](screenshots/Coffee%20Waiter%20Service%20Queue%20Desktop.png) | **Floor Table Assistance Queue (`/waiter`)**<br>![Waiter Service Queue Mobile](screenshots/Coffee%20Waiter%20Service%20Queue%20Mobile.png) |
| **Service Request Fulfillment (Resolve Confirm Modal)**<br>![Waiter Resolve Modal Desktop](screenshots/Coffee%20Waiter%20Modal%20Resolve%20Confirm%20Desktop.png) | **Service Request Fulfillment (Resolve Confirm Modal)**<br>![Waiter Resolve Modal Mobile](screenshots/Coffee%20Waiter%20Modal%20Resolve%20Confirm%20Mobile.png) |
| **Floor Assistance Request Resolved (Toast Alert)**<br>![Waiter Resolved Alert Desktop](screenshots/Coffee%20Waiter%20Alert%20Request%20Resolved%20Desktop.png) | **Floor Assistance Request Resolved (Toast Alert)**<br>![Waiter Resolved Alert Mobile](screenshots/Coffee%20Waiter%20Alert%20Request%20Resolved%20Mobile.png) |

---

### 3. Managerial Oversight, Timecards & Staff Administration (`/dashboard`, `/employees`, `/shifts`, `/login`)

| Desktop Interface (MacBook Pro M4) | Mobile Interface (iPhone 16 Pro) |
| :---: | :---: |
| **Executive Operations Dashboard (`/dashboard`)**<br>![Manager Dashboard Overview Desktop](screenshots/Coffee%20Manager%20Dashboard%20Overview%20Desktop.png) | **Executive Operations Dashboard (`/dashboard`)**<br>![Manager Dashboard Overview Mobile](screenshots/Coffee%20Manager%20Dashboard%20Overview%20Mobile.png) |
| **Shift Attendance Confirmation (Clock In Confirm Modal)**<br>![Dashboard Clock In Confirm Modal Desktop](screenshots/Coffee%20Dashboard%20Modal%20Clock%20In%20Confirm%20Desktop.png) | **Shift Attendance Confirmation (Clock In Confirm Modal)**<br>![Dashboard Clock In Confirm Modal Mobile](screenshots/Coffee%20Dashboard%20Modal%20Clock%20In%20Confirm%20Mobile.png) |
| **Shift Timecard & Attendance Alert (Late Attendance Modal)**<br>![Dashboard Attendance Alert Desktop](screenshots/Coffee%20Dashboard%20Modal%20Attendance%20Alert%20Desktop.png) | **Shift Timecard & Attendance Alert (Late Attendance Modal)**<br>![Dashboard Attendance Alert Mobile](screenshots/Coffee%20Dashboard%20Modal%20Attendance%20Alert%20Mobile.png) |
| **Late Attendance Notification Banner (Late Toast Alert)**<br>![Dashboard Attendance Late Alert Desktop](screenshots/Coffee%20Dashboard%20Alert%20Attendance%20Late%20Desktop.png) | **Late Attendance Notification Banner (Late Toast Alert)**<br>![Dashboard Attendance Late Alert Mobile](screenshots/Coffee%20Dashboard%20Alert%20Attendance%20Late%20Mobile.png) |
| **Manager Operational Memo Saved (Toast Alert)**<br>![Dashboard Memo Saved Alert Desktop](screenshots/Coffee%20Dashboard%20Alert%20Note%20Saved%20Desktop.png) | **Manager Operational Memo Saved (Toast Alert)**<br>![Dashboard Memo Saved Alert Mobile](screenshots/Coffee%20Dashboard%20Alert%20Note%20Saved%20Mobile.png) |
| **Staff & Manager Authentication Portal (`/login`)**<br>![Staff Login Desktop](screenshots/Coffee%20Staff%20Login%20Desktop.png) | **Staff & Manager Authentication Portal (`/login`)**<br>![Staff Login Mobile](screenshots/Coffee%20Staff%20Login%20Mobile.png) |
| **Staff Authentication Failure (401 Auth Error Alert)**<br>![Staff Auth Error Alert Desktop](screenshots/Coffee%20Staff%20Login%20Alert%20Auth%20Error%20Desktop.png) | **Staff Authentication Failure (401 Auth Error Alert)**<br>![Staff Auth Error Alert Mobile](screenshots/Coffee%20Staff%20Login%20Alert%20Auth%20Error%20Mobile.png) |
| **Staff Directory & Wage Roster (`/employees`)**<br>![Staff Roster Management Desktop](screenshots/Coffee%20Staff%20Roster%20Management%20Desktop.png) | **Staff Directory & Wage Roster (`/employees`)**<br>![Staff Roster Management Mobile](screenshots/Coffee%20Staff%20Roster%20Management%20Mobile.png) |
| **Staff Recruitment & Role Provisioning (Recruit Modal)**<br>![Staff Recruit Modal Desktop](screenshots/Coffee%20Staff%20Modal%20Recruit%20Employee%20Desktop.png) | **Staff Recruitment & Role Provisioning (Recruit Modal)**<br>![Staff Recruit Modal Mobile](screenshots/Coffee%20Staff%20Modal%20Recruit%20Employee%20Mobile.png) |
| **Staff Profile & Wage Adjustment (Edit Employee Modal)**<br>![Staff Edit Employee Modal Desktop](screenshots/Coffee%20Staff%20Modal%20Edit%20Employee%20Desktop.png) | **Staff Profile & Wage Adjustment (Edit Employee Modal)**<br>![Staff Edit Employee Modal Mobile](screenshots/Coffee%20Staff%20Modal%20Edit%20Employee%20Mobile.png) |
| **Shift Attendance History (Attendance History Modal)**<br>![Staff Attendance History Modal Desktop](screenshots/Coffee%20Staff%20Modal%20Attendance%20History%20Desktop.png) | **Shift Attendance History (Attendance History Modal)**<br>![Staff Attendance History Modal Mobile](screenshots/Coffee%20Staff%20Modal%20Attendance%20History%20Mobile.png) |
| **Staff Suspension Gate (Freeze Account Confirm Modal)**<br>![Staff Freeze Modal Desktop](screenshots/Coffee%20Staff%20Modal%20Freeze%20Account%20Confirm%20Desktop.png) | **Staff Suspension Gate (Freeze Account Confirm Modal)**<br>![Staff Freeze Modal Mobile](screenshots/Coffee%20Staff%20Modal%20Freeze%20Account%20Confirm%20Mobile.png) |
| **Staff Account Status Suspended (Toast Alert)**<br>![Staff Account Frozen Alert Desktop](screenshots/Coffee%20Staff%20Alert%20Account%20Frozen%20Desktop.png) | **Staff Account Status Suspended (Toast Alert)**<br>![Staff Account Frozen Alert Mobile](screenshots/Coffee%20Staff%20Alert%20Account%20Frozen%20Mobile.png) |
| **Weekly Shift Scheduling Matrix (`/shifts`)**<br>![Shift Scheduling Matrix Desktop](screenshots/Coffee%20Shift%20Scheduling%20Matrix%20Desktop.png) | **Weekly Shift Scheduling Matrix (`/shifts`)**<br>![Shift Scheduling Matrix Mobile](screenshots/Coffee%20Shift%20Scheduling%20Matrix%20Mobile.png) |
| **Automated Shift Randomization (Randomize Confirm Modal)**<br>![Shift Randomize Confirm Modal Desktop](screenshots/Coffee%20Shift%20Modal%20Randomize%20Confirm%20Desktop.png) | **Automated Shift Randomization (Randomize Confirm Modal)**<br>![Shift Randomize Confirm Modal Mobile](screenshots/Coffee%20Shift%20Modal%20Randomize%20Confirm%20Mobile.png) |
| **Weekly Shift Schedule Saved (Toast Alert)**<br>![Shift Schedule Saved Alert Desktop](screenshots/Coffee%20Shift%20Alert%20Schedule%20Saved%20Desktop.png) | **Weekly Shift Schedule Saved (Toast Alert)**<br>![Shift Schedule Saved Alert Mobile](screenshots/Coffee%20Shift%20Alert%20Schedule%20Saved%20Mobile.png) |

---

### 4. Supply Chain, Equipment Assets, Finance & Marketing (`/menu`, `/inventory`, `/assets`, `/finance`, `/posts`, `/feedback`, `/settings`)

| Desktop Interface (MacBook Pro M4) | Mobile Interface (iPhone 16 Pro) |
| :---: | :---: |
| **Menu Catalog & Recipe Management (`/menu`)**<br>![Menu Item Management Desktop](screenshots/Coffee%20Menu%20Item%20Management%20Desktop.png) | **Menu Catalog & Recipe Management (`/menu`)**<br>![Menu Item Management Mobile](screenshots/Coffee%20Menu%20Item%20Management%20Mobile.png) |
| **Drink Creation & Price Setup (Add Menu Item Modal)**<br>![Menu Modal Add Item Desktop](screenshots/Coffee%20Menu%20Modal%20Add%20Item%20Desktop.png) | **Drink Creation & Price Setup (Add Menu Item Modal)**<br>![Menu Modal Add Item Mobile](screenshots/Coffee%20Menu%20Modal%20Add%20Item%20Mobile.png) |
| **Menu Category Classification (Add Category Modal)**<br>![Menu Modal Add Category Desktop](screenshots/Coffee%20Menu%20Modal%20Add%20Category%20Desktop.png) | **Menu Category Classification (Add Category Modal)**<br>![Menu Modal Add Category Mobile](screenshots/Coffee%20Menu%20Modal%20Add%20Category%20Mobile.png) |
| **Catalog Item Specifications (Item Detail View Modal)**<br>![Menu Item Detail Modal Desktop](screenshots/Coffee%20Menu%20Modal%20Item%20Detail%20View%20Desktop.png) | **Catalog Item Specifications (Item Detail View Modal)**<br>![Menu Item Detail Modal Mobile](screenshots/Coffee%20Menu%20Modal%20Item%20Detail%20View%20Mobile.png) |
| **Catalog Item Created (Toast Alert)**<br>![Menu Item Created Alert Desktop](screenshots/Coffee%20Menu%20Alert%20Item%20Created%20Desktop.png) | **Catalog Item Created (Toast Alert)**<br>![Menu Item Created Alert Mobile](screenshots/Coffee%20Menu%20Alert%20Item%20Created%20Mobile.png) |
| **Raw Material & Ingredient Inventory (`/inventory`)**<br>![Inventory Stock Control Desktop](screenshots/Coffee%20Inventory%20Stock%20Control%20Desktop.png) | **Raw Material & Ingredient Inventory (`/inventory`)**<br>![Inventory Stock Control Mobile](screenshots/Coffee%20Inventory%20Stock%20Control%20Mobile.png) |
| **Ingredient Restock & Safety Stock (Add Stock Modal)**<br>![Inventory Modal Add Stock Desktop](screenshots/Coffee%20Inventory%20Modal%20Add%20Stock%20Desktop.png) | **Ingredient Restock & Safety Stock (Add Stock Modal)**<br>![Inventory Modal Add Stock Mobile](screenshots/Coffee%20Inventory%20Modal%20Add%20Stock%20Mobile.png) |
| **Bill of Materials & Recipe Linkage (Link Recipe Modal)**<br>![Inventory Modal Link Recipe Desktop](screenshots/Coffee%20Inventory%20Modal%20Link%20Recipe%20Desktop.png) | **Bill of Materials & Recipe Linkage (Link Recipe Modal)**<br>![Inventory Modal Link Recipe Mobile](screenshots/Coffee%20Inventory%20Modal%20Link%20Recipe%20Mobile.png) |
| **Raw Ingredient Stock Updated (Toast Alert)**<br>![Inventory Stock Alert Desktop](screenshots/Coffee%20Inventory%20Alert%20Stock%20Added%20Desktop.png) | **Raw Ingredient Stock Updated (Toast Alert)**<br>![Inventory Stock Alert Mobile](screenshots/Coffee%20Inventory%20Alert%20Stock%20Added%20Mobile.png) |
| **Bill of Materials Recipe Linked (Toast Alert)**<br>![Inventory Recipe Alert Desktop](screenshots/Coffee%20Inventory%20Alert%20Recipe%20Linked%20Desktop.png) | **Bill of Materials Recipe Linked (Toast Alert)**<br>![Inventory Recipe Alert Mobile](screenshots/Coffee%20Inventory%20Alert%20Recipe%20Linked%20Mobile.png) |
| **Commercial Machinery & Equipment Register (`/assets`)**<br>![Asset & Equipment Desktop](screenshots/Coffee%20Asset%20&%20Equipment%20Desktop.png) | **Commercial Machinery & Equipment Register (`/assets`)**<br>![Asset & Equipment Mobile](screenshots/Coffee%20Asset%20&%20Equipment%20Mobile.png) |
| **Equipment Asset Registration (Register Asset Modal)**<br>![Asset Modal Register Desktop](screenshots/Coffee%20Asset%20Modal%20Register%20Desktop.png) | **Equipment Asset Registration (Register Asset Modal)**<br>![Asset Modal Register Mobile](screenshots/Coffee%20Asset%20Modal%20Register%20Mobile.png) |
| **Machine Condition & Maintenance (Asset Condition Modal)**<br>![Asset Condition Maintenance Modal Desktop](screenshots/Coffee%20Asset%20Modal%20Condition%20Maintenance%20Desktop.png) | **Machine Condition & Maintenance (Asset Condition Modal)**<br>![Asset Condition Maintenance Modal Mobile](screenshots/Coffee%20Asset%20Modal%20Condition%20Maintenance%20Mobile.png) |
| **Commercial Hardware Registered (Toast Alert)**<br>![Asset Registered Alert Desktop](screenshots/Coffee%20Asset%20Alert%20Registered%20Desktop.png) | **Commercial Hardware Registered (Toast Alert)**<br>![Asset Registered Alert Mobile](screenshots/Coffee%20Asset%20Alert%20Registered%20Mobile.png) |
| **Equipment Maintenance Logged (Toast Alert)**<br>![Asset Maintenance Alert Desktop](screenshots/Coffee%20Asset%20Alert%20Maintenance%20Logged%20Desktop.png) | **Equipment Maintenance Logged (Toast Alert)**<br>![Asset Maintenance Alert Mobile](screenshots/Coffee%20Asset%20Alert%20Maintenance%20Logged%20Mobile.png) |
| **Financial Ledger & Cashflow Analytics (`/finance`)**<br>![Finance Cashflow Reports Desktop](screenshots/Coffee%20Finance%20Cashflow%20Reports%20Desktop.png) | **Financial Ledger & Cashflow Analytics (`/finance`)**<br>![Finance Cashflow Reports Mobile](screenshots/Coffee%20Finance%20Cashflow%20Reports%20Mobile.png) |
| **Petty Cash & Expense Logging (Record Transaction Modal)**<br>![Finance Record Transaction Modal Desktop](screenshots/Coffee%20Finance%20Modal%20Record%20Transaction%20Desktop.png) | **Petty Cash & Expense Logging (Record Transaction Modal)**<br>![Finance Record Transaction Modal Mobile](screenshots/Coffee%20Finance%20Modal%20Record%20Transaction%20Mobile.png) |
| **Ledger Transaction Recorded (Toast Alert)**<br>![Finance Transaction Alert Desktop](screenshots/Coffee%20Finance%20Alert%20Transaction%20Recorded%20Desktop.png) | **Ledger Transaction Recorded (Toast Alert)**<br>![Finance Transaction Alert Mobile](screenshots/Coffee%20Finance%20Alert%20Transaction%20Recorded%20Mobile.png) |
| **Announcements & Promotional Blog CMS (`/posts`)**<br>![Blog Post CMS Desktop](screenshots/Coffee%20Blog%20Post%20CMS%20Desktop.png) | **Announcements & Promotional Blog CMS (`/posts`)**<br>![Blog Post CMS Mobile](screenshots/Coffee%20Blog%20Post%20CMS%20Mobile.png) |
| **Article Authoring & Publishing (Create Post Modal)**<br>![Blog Modal Create Post Desktop](screenshots/Coffee%20Blog%20Modal%20Create%20Post%20Desktop.png) | **Article Authoring & Publishing (Create Post Modal)**<br>![Blog Modal Create Post Mobile](screenshots/Coffee%20Blog%20Modal%20Create%20Post%20Mobile.png) |
| **Editorial Post Published (Toast Alert)**<br>![Blog Post Saved Alert Desktop](screenshots/Coffee%20Blog%20Alert%20Post%20Saved%20Desktop.png) | **Editorial Post Published (Toast Alert)**<br>![Blog Post Saved Alert Mobile](screenshots/Coffee%20Blog%20Alert%20Post%20Saved%20Mobile.png) |
| **Customer Feedback & Review Auditing (`/feedback`)**<br>![Customer Feedback Reviews Desktop](screenshots/Coffee%20Customer%20Feedback%20Reviews%20Desktop.png) | **Customer Feedback & Review Auditing (`/feedback`)**<br>![Customer Feedback Reviews Mobile](screenshots/Coffee%20Customer%20Feedback%20Reviews%20Mobile.png) |
| **Customer Feedback Review Removed (Toast Alert)**<br>![Customer Feedback Deleted Alert Desktop](screenshots/Coffee%20Customer%20Feedback%20Alert%20Deleted%20Desktop.png) | **Customer Feedback Review Removed (Toast Alert)**<br>![Customer Feedback Deleted Alert Mobile](screenshots/Coffee%20Customer%20Feedback%20Alert%20Deleted%20Mobile.png) |
| **Global Store Configuration & Tax Rules (`/settings`)**<br>![Store Settings Config Desktop](screenshots/Coffee%20Store%20Settings%20Config%20Desktop.png) | **Global Store Configuration & Tax Rules (`/settings`)**<br>![Store Settings Config Mobile](screenshots/Coffee%20Store%20Settings%20Config%20Mobile.png) |
| **Store Settings & Tax Rules Saved (Toast Alert)**<br>![Store Settings Saved Alert Desktop](screenshots/Coffee%20Store%20Settings%20Alert%20Saved%20Desktop.png) | **Store Settings & Tax Rules Saved (Toast Alert)**<br>![Store Settings Saved Alert Mobile](screenshots/Coffee%20Store%20Settings%20Alert%20Saved%20Mobile.png) |

---

### 5. Interactive System Alerts & Operational Notifications (Global Alert System)

| Desktop Interface (MacBook Pro M4) | Mobile Interface (iPhone 16 Pro) |
| :---: | :---: |
| **Late Attendance Warning (Attendance Late Toast Alert)**<br>![Late Attendance Alert Desktop](screenshots/Coffee%20Dashboard%20Alert%20Attendance%20Late%20Desktop.png) | **Late Attendance Warning (Attendance Late Toast Alert)**<br>![Late Attendance Alert Mobile](screenshots/Coffee%20Dashboard%20Alert%20Attendance%20Late%20Mobile.png) |
| **POS Insufficient Cash Payment (Underpaid Error Alert)**<br>![Cashier Underpaid Alert Desktop](screenshots/Coffee%20Cashier%20Alert%20Underpaid%20Error%20Desktop.png) | **POS Insufficient Cash Payment (Underpaid Error Alert)**<br>![Cashier Underpaid Alert Mobile](screenshots/Coffee%20Cashier%20Alert%20Underpaid%20Error%20Mobile.png) |
| **POS Empty Cart Validation (Empty Cart Error Alert)**<br>![Cashier Empty Cart Alert Desktop](screenshots/Coffee%20Cashier%20Alert%20Empty%20Cart%20Error%20Desktop.png) | **POS Empty Cart Validation (Empty Cart Error Alert)**<br>![Cashier Empty Cart Alert Mobile](screenshots/Coffee%20Cashier%20Alert%20Empty%20Cart%20Error%20Mobile.png) |
| **Staff Authentication Failure (401 Auth Error Alert)**<br>![Staff Login Auth Error Alert Desktop](screenshots/Coffee%20Staff%20Login%20Alert%20Auth%20Error%20Desktop.png) | **Staff Authentication Failure (401 Auth Error Alert)**<br>![Staff Login Auth Error Alert Mobile](screenshots/Coffee%20Staff%20Login%20Alert%20Auth%20Error%20Mobile.png) |
| **Floor Table Service Dispatched (Waiter Summoned Alert)**<br>![Customer Waiter Alert Desktop](screenshots/Coffee%20Customer%20Alert%20Waiter%20Notified%20Desktop.png) | **Floor Table Service Dispatched (Waiter Summoned Alert)**<br>![Customer Waiter Alert Mobile](screenshots/Coffee%20Customer%20Alert%20Waiter%20Notified%20Mobile.png) |
| **Kitchen Order Status Progression (KDS Status Alert)**<br>![Kitchen Status Alert Desktop](screenshots/Coffee%20Kitchen%20Alert%20Status%20Updated%20Desktop.png) | **Kitchen Order Status Progression (KDS Status Alert)**<br>![Kitchen Status Alert Mobile](screenshots/Coffee%20Kitchen%20Alert%20Status%20Updated%20Mobile.png) |

---

## Features

- **Public Brand Showcase & Interactive CMS (`/`)**: High-energy Neo-Brutalist brand landing featuring infinite typography marquees, split-gate animated "About Us" brand story reveal, promotional latest roasts showcase, and interactive 3D signature menu overlay with item specification modals.
- **Customer Digital Self-Ordering Portal (`/order`)**: Interactive customer-facing menu featuring multi-category filtering (Coffee, Non-Coffee, Featured, Snack, Food), item customization options (sweetness level, ice preference, dairy alternatives), notes, and a real-time floating cart tray with table number assignment.
- **Cart & Dynamic Order Dispatch Modals**: Complete step-by-step guest checkout flow consisting of a real-time cart drawer, table and contact information form, pre-dispatch order confirmation review, instant order submission to edge SQLite D1, and official order ticket display.
- **Table Call Waiter Assistance (`/order`, `/waiter`)**: Floating table service request button enabling seated diners to summon floor staff for payment, bill collection, or assistance, broadcasting real-time notification alerts with sound toggles to the waiter dashboard.
- **Cashier POS Register Terminal (`/cashier`)**: Rapid order entry register for cashiers with instant subtotal tallying, configurable tax calculation (10%), dynamic coupon code discounts, quick cash tendered denominations, instant change return computation, and modal thermal printable receipt.
- **Executive Operations Dashboard (`/dashboard`)**: Central managerial oversight displaying live daily revenue, gross profit, sales counts, daily attendance clock-in/clock-out tracker, clocked-in shift staff status, and sticky operational memo notes.
- **Barista Kitchen Display System (`/kitchen`)**: Real-time barista order queue with preparation status workflow (`PENDING`, `PREPARING`, `READY_TO_SERVE`, `COMPLETED`), order timer elapsed counters, customer special instructions, and itemized recipe checklists.
- **Menu & Recipe Management (`/menu`)**: Complete catalog manager with category assignment, pricing, image URL/R2 uploads, item availability switch (`available: true/false`), and ingredient recipe binding for automated inventory deduction.
- **Ingredient & Stock Inventory Control (`/inventory`)**: Raw material inventory tracker monitoring coffee beans, fresh milk, syrups, and packaging with minimum safety stock thresholds (`minStock`), real-time stock deductions, and restock logging.
- **Staff Directory & Payroll (`/employees`)**: Multi-role employee database tracking IDs (`EMP-MAN-001`, `EMP-BAR-001`, etc.), positions, base monthly salaries, contact phone numbers, PINs, active/inactive statuses, and attendance logs.
- **Weekly Shift Scheduling (`/shifts`)**: Matrix scheduling for morning, afternoon, and night shifts across front-of-house and back-of-house teams with automated roster conflict prevention and fair randomized shift generation.
- **Equipment & Asset Depreciation (`/assets`)**: Machinery register tracking commercial espresso machines, grinders, and cafe hardware with purchase dates, initial costs, maintenance schedules, condition ratings (`GOOD`, `NEEDS_MAINTENANCE`, `BROKEN`), and book value depreciation.
- **Financial Ledger & Expense Accounting (`/finance`)**: Real-time cash flow ledger logging revenues, operational expenditures, supplier raw material purchasing, and net profit margin summaries.
- **Customer Feedback & Sentiment (`/feedback`)**: Guest review collection collecting star ratings (1 to 5), customer comments, and logged shift staff associations for service quality auditing.
- **Promotional CMS & Announcements (`/posts`, `/settings`)**: Editorial blog publishing for articles and promotions (`/posts`), and global store configuration (`/settings` - shop name, phone, tax percentage, receipt footer).

---

## Tech Stack

| Category | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React `18.2.0`, Vite `5.0.0` | SPA frontend foundation with fast Vite HMR and production bundle optimization |
| **Routing** | React Router DOM `6.18.0` | Client-side routing, URL parameter binding, and role-based protected route wrappers |
| **State & Networking** | React Context API, Axios `1.6.0` | Centralized authentication state with global HTTP request and session interceptors |
| **UI & Styling** | Neo-Brutalist Design System | High-contrast CSS variable tokens, bold borders, retro drop-shadows, and layout patterns |
| **Carousels & Sliders** | Swiper `12.0.3` | Mobile touch swipe carousels for promotional menu highlights and image galleries |
| **Iconography** | Lucide React `0.292.0` | Consistent vector line icons across POS registers, menus, and dashboard views |
| **Serverless Backend** | Cloudflare Workers (`worker.js`) | Edge REST API runtime handling authentication, orders, inventory, and attendance |
| **Database** | Cloudflare D1 (SQLite) | Serverless relational database holding employees, menus, orders, shifts, and assets |
| **Object Storage** | Cloudflare R2 | S3-compatible cloud object storage for menu photography and promotional uploads |
| **Security & Auth** | bcryptjs `2.4.3`, JWT | Salting and hashing employee credentials with stateless JSON Web Token sessions |
| **Tooling & Deploy** | Wrangler `4.147.0`, Cloudflare Pages | Worker configuration, D1 schema migration execution, and edge CDN deployments |

---

## Project Structure

```bash
/
├── src/
│   ├── components/
│   │   ├── layout/                 # Navbar, OrderPageHeader, OrderPageFooter
│   │   └── ui/                     # Reusable buttons, cards, modals, tables, badges
│   ├── context/
│   │   └── AuthContext.jsx         # Global user authentication & role state
│   ├── pages/
│   │   ├── OrderPage.jsx           # Customer self-ordering digital menu (/order)
│   │   ├── DashboardPage.jsx       # Manager operations dashboard (/dashboard)
│   │   ├── CashierPage.jsx         # POS register checkout (/cashier)
│   │   ├── KitchenPage.jsx         # Kitchen Display System (KDS) (/kitchen)
│   │   ├── MenuPage.jsx            # Menu catalog & recipes (/menu)
│   │   ├── InventoryPage.jsx       # Raw ingredient stock tracking (/inventory)
│   │   ├── EmployeePage.jsx        # Staff directory & roles (/employees)
│   │   ├── ShiftPage.jsx           # Weekly shift scheduling (/shifts)
│   │   ├── WaiterPage.jsx          # Table waiter assistance calls (/waiter)
│   │   ├── AssetManagementPage.jsx # Coffee machinery & depreciation (/assets)
│   │   ├── FinancePage.jsx         # Financial ledger & expense tracking (/finance)
│   │   ├── FeedbackPage.jsx        # Customer feedback & reviews (/feedback)
│   │   ├── CMSPage.jsx             # Public promotional landing (/)
│   │   ├── PostManagementPage.jsx  # Blog & announcement manager (/posts)
│   │   ├── SettingsPage.jsx        # Store configuration & tax settings (/settings)
│   │   └── LoginPage.jsx           # Authentication portal (/login)
│   ├── utils/                      # Staff utility and shift business logic algorithms
│   ├── App.jsx                     # Route definitions and role-based guards
│   └── main.jsx                    # React application entry point
├── screenshots/                    # MacBook Pro M4 & iPhone 16 Pro showcase mockups
├── public/                         # Static icons, patterns, and background art
├── worker.js                       # Cloudflare Worker REST API implementation
├── schema.sql                      # Cloudflare D1 SQLite database table definitions
├── wrangler.jsonc                  # Cloudflare Worker, D1, and R2 binding configuration
├── vite.config.js                  # Vite build and development proxy configuration
├── package.json                    # Dependencies, scripts, and engine specifications
└── README.md
```

---

## Getting Started & Local Development

### Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **npm** or **yarn**

---

### Option 1: Frontend Development (Connected to Production API)

The fastest way to run and explore the application locally is pointing the Vite frontend to the live production Cloudflare Worker API:

```bash
# 1. Clone the repository
git clone https://github.com/widifirmaan/reactjs-coffee-shop-management.git
cd reactjs-coffee-shop-management

# 2. Install project dependencies
npm install

# 3. Create local environment configuration (.env.local)
echo "VITE_API_URL=https://siapnyafe.widifirmaan.web.id" > .env.local

# 4. Start local development server
npm run dev
```

Open [http://localhost:8085](http://localhost:8085) in your web browser.

---

### Option 2: Fullstack Local Development (Wrangler + D1 SQLite)

To develop both the frontend and the Cloudflare Worker API locally with an isolated local SQLite D1 database:

```bash
# 1. Install dependencies
npm install

# 2. Initialize the local D1 database schema
npx wrangler d1 execute siapnyafe --local --file=./schema.sql

# 3. Start local Cloudflare Worker API
npx wrangler dev

# 4. In a separate terminal, start the Vite development server
npm run dev
```

The frontend will proxy `/api` requests to the local worker on port `3000`.

---

### Production Build & Deployment

```bash
# Compile and optimize production distribution bundle
npm run build

# Deploy to Cloudflare Workers / Pages
npm run deploy
```

---

## Database Seeding & Demo Credentials

Siap Nyafe provides automated database seeder endpoints in the Cloudflare Worker to populate employees across all 5 operational roles, default catalog items, Unsplash photography, raw ingredients, and coffee equipment assets.

### 1. Triggering Database Seeding

Execute the seeder endpoints via `curl` or HTTP client:

```bash
# Seed 14 employee accounts and initial categories
curl -X POST https://siapnyafe.widifirmaan.web.id/api/seed \
  -H "Content-Type: application/json" \
  -d '{"secret":"siap-nyafe-secure-jwt-key-production-2026"}'

# Seed full menu catalog, blog posts, ingredients, and assets
curl -X POST https://siapnyafe.widifirmaan.web.id/api/seed-content \
  -H "Content-Type: application/json" \
  -d '{"secret":"siap-nyafe-seed-2026"}'
```

### 2. Pre-Configured Demo Accounts

| Role | Employee ID | Email | Password | Default Route | Accessible Modules |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Manager** | `EMP-MAN-001` | `manager@americano.com` | `manager123` | `/dashboard` | All Modules (Dashboard, Cashier, Menu, Kitchen, Inventory, Staff, Shifts, Assets, Finance, Posts, Settings) |
| **Cashier** | `EMP-CSH-001` | `cashier1@americano.com` | `cashier123` | `/dashboard` | POS Cashier Checkout (`/cashier`), Customer Feedback (`/feedback`), Public Order (`/order`) |
| **Barista** | `EMP-BAR-001` | `barista1@americano.com` | `barista123` | `/dashboard` | Kitchen Display Queue (`/kitchen`), Inventory Stock (`/inventory`), Menu (`/menu`) |
| **Kitchen Staff** | `EMP-KIT-001` | `kitchen1@americano.com` | `kitchen123` | `/dashboard` | Kitchen Display Queue (`/kitchen`), Inventory Stock (`/inventory`) |
| **Waiter** | `EMP-WAI-001` | `waiter1@americano.com` | `waiter123` | `/dashboard` | Waiter Table Calls (`/waiter`), Customer Feedback (`/feedback`) |

> **Customer Self-Order:** No login credentials are required to browse the digital menu or place orders at `/order` or view the promotional landing page at `/`.

---

## Author

Developed by **[Widi Firmansyah](https://widifirmaan.web.id)**.
