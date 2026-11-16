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

| Desktop Interface (MacBook Pro M4) | Mobile Interface (iPhone 16 Pro) |
| :---: | :---: |
| **Customer Self-Order Menu & Cart Desktop**<br>![Customer Self-Order Menu Desktop](screenshots/Coffee%20Order%20Menu%20Desktop.png) | **Customer Self-Order Menu Mobile**<br>![Customer Self-Order Menu Mobile](screenshots/Coffee%20Order%20Menu%20Mobile.png) |
| **Operations Manager Dashboard Desktop**<br>![Operations Manager Dashboard Desktop](screenshots/Coffee%20Manager%20Dashboard%20Desktop.png) | **Operations Manager Dashboard Mobile**<br>![Operations Manager Dashboard Mobile](screenshots/Coffee%20Manager%20Dashboard%20Mobile.png) |
| **Cashier Point-of-Sale Register Desktop**<br>![Cashier Point-of-Sale Register Desktop](screenshots/Coffee%20Cashier%20POS%20Desktop.png) | **Cashier Point-of-Sale Register Mobile**<br>![Cashier Point-of-Sale Register Mobile](screenshots/Coffee%20Cashier%20POS%20Mobile.png) |
| **Kitchen Display System (KDS) Desktop**<br>![Kitchen Display System Desktop](screenshots/Coffee%20Kitchen%20Display%20Desktop.png) | **Kitchen Display System (KDS) Mobile**<br>![Kitchen Display System Mobile](screenshots/Coffee%20Kitchen%20Display%20Mobile.png) |
| **Menu & Recipe Management Desktop**<br>![Menu & Recipe Management Desktop](screenshots/Coffee%20Menu%20Management%20Desktop.png) | **Menu & Recipe Management Mobile**<br>![Menu & Recipe Management Mobile](screenshots/Coffee%20Menu%20Management%20Mobile.png) |
| **Raw Ingredient Inventory Control Desktop**<br>![Raw Ingredient Inventory Control Desktop](screenshots/Coffee%20Inventory%20Stock%20Desktop.png) | **Raw Ingredient Inventory Control Mobile**<br>![Raw Ingredient Inventory Control Mobile](screenshots/Coffee%20Inventory%20Stock%20Mobile.png) |
| **Staff Directory & Roster Desktop**<br>![Staff Directory & Roster Desktop](screenshots/Coffee%20Staff%20Roster%20Desktop.png) | **Staff Directory & Roster Mobile**<br>![Staff Directory & Roster Mobile](screenshots/Coffee%20Staff%20Roster%20Mobile.png) |
| **Weekly Shift Scheduling Matrix Desktop**<br>![Weekly Shift Scheduling Matrix Desktop](screenshots/Coffee%20Shift%20Scheduling%20Desktop.png) | **Weekly Shift Scheduling Matrix Mobile**<br>![Weekly Shift Scheduling Matrix Mobile](screenshots/Coffee%20Shift%20Scheduling%20Mobile.png) |
| **Table Waiter Assistance Dispatcher Desktop**<br>![Table Waiter Assistance Dispatcher Desktop](screenshots/Coffee%20Waiter%20Service%20Desktop.png) | **Table Waiter Assistance Dispatcher Mobile**<br>![Table Waiter Assistance Dispatcher Mobile](screenshots/Coffee%20Waiter%20Service%20Mobile.png) |
| **Machinery & Equipment Assets Desktop**<br>![Machinery & Equipment Assets Desktop](screenshots/Coffee%20Asset%20Management%20Desktop.png) | **Machinery & Equipment Assets Mobile**<br>![Machinery & Equipment Assets Mobile](screenshots/Coffee%20Asset%20Management%20Mobile.png) |
| **Financial Ledger & Cashflow Desktop**<br>![Financial Ledger & Cashflow Desktop](screenshots/Coffee%20Finance%20Cashflow%20Desktop.png) | **Financial Ledger & Cashflow Mobile**<br>![Financial Ledger & Cashflow Mobile](screenshots/Coffee%20Finance%20Cashflow%20Mobile.png) |
| **Customer Feedback & Review Portal Desktop**<br>![Customer Feedback & Review Portal Desktop](screenshots/Coffee%20Customer%20Feedback%20Desktop.png) | **Customer Feedback & Review Portal Mobile**<br>![Customer Feedback & Review Portal Mobile](screenshots/Coffee%20Customer%20Feedback%20Mobile.png) |
| **Announcements & Promotional Blog CMS Desktop**<br>![Announcements & Promotional Blog CMS Desktop](screenshots/Coffee%20Blog%20CMS%20Desktop.png) | **Announcements & Promotional Blog CMS Mobile**<br>![Announcements & Promotional Blog CMS Mobile](screenshots/Coffee%20Blog%20CMS%20Mobile.png) |
| **Global Store Configuration & Settings Desktop**<br>![Global Store Configuration & Settings Desktop](screenshots/Coffee%20Store%20Settings%20Desktop.png) | **Global Store Configuration & Settings Mobile**<br>![Global Store Configuration & Settings Mobile](screenshots/Coffee%20Store%20Settings%20Mobile.png) |
| **Public Brand Landing CMS Desktop**<br>![Public Brand Landing CMS Desktop](screenshots/Coffee%20Landing%20CMS%20Desktop.png) | **Public Brand Landing CMS Mobile**<br>![Public Brand Landing CMS Mobile](screenshots/Coffee%20Landing%20CMS%20Mobile.png) |
| **Staff & Manager Authentication Portal Desktop**<br>![Staff Login Desktop](screenshots/Coffee%20Staff%20Login%20Desktop.png) | **Staff & Manager Authentication Portal Mobile**<br>![Staff Login Mobile](screenshots/Coffee%20Staff%20Login%20Mobile.png) |

---

## Features

- **Customer Digital Self-Ordering Portal (`/order`)**: Interactive customer-facing menu featuring multi-category filtering (Coffee, Non-Coffee, Featured, Snack, Food), item customization options (sweetness level, ice preference, dairy alternatives), notes, and a real-time floating cart tray with table number assignment.
- **Cashier POS Register Terminal (`/cashier`)**: Rapid order entry register for cashiers with instant subtotal tallying, configurable tax calculation (10%), dynamic coupon code discounts, quick cash tendered denominations, instant change return computation, and modal printable receipt.
- **Executive Operations Dashboard (`/dashboard`)**: Central managerial oversight displaying live daily revenue, gross profit, sales counts, daily attendance clock-in/clock-out tracker, clocked-in shift staff status, and sticky operational memo notes.
- **Barista Kitchen Display System (`/kitchen`)**: Real-time barista order queue with preparation status workflow (`PENDING`, `PROCESSING`, `READY`, `SERVED`), order timer elapsed counters, customer special instructions, and itemized recipe checklists.
- **Menu & Recipe Management (`/menu`)**: Complete catalog manager with category assignment, pricing, image URL/R2 uploads, item availability switch (`available: true/false`), and ingredient recipe binding for automated inventory deduction.
- **Ingredient & Stock Inventory Control (`/inventory`)**: Raw material inventory tracker monitoring coffee beans, fresh milk, syrups, and packaging with minimum safety stock thresholds (`minStock`), real-time stock deductions, and restock logging.
- **Staff Directory & Payroll (`/employees`)**: Multi-role employee database tracking IDs (`EMP-MAN-001`, `EMP-BAR-001`, etc.), positions, base monthly salaries, contact phone numbers, PINs, active/inactive statuses, and attendance logs.
- **Weekly Shift Scheduling (`/shifts`)**: Matrix scheduling for morning, afternoon, and night shifts across front-of-house and back-of-house teams with automated roster conflict prevention.
- **Table Waiter Assistance Dispatcher (`/waiter`)**: Service call receiver alerting floor staff to customer table requests (water refill, clean table, bill request) with one-click acknowledge and resolve buttons.
- **Customer Feedback & Sentiment (`/feedback`)**: Guest review collection collecting star ratings (1 to 5), customer comments, and logged shift staff associations for service quality auditing.
- **Equipment & Asset Depreciation (`/assets`)**: Machinery register tracking commercial espresso machines, grinders, and cafe hardware with purchase dates, initial costs, maintenance schedules, condition ratings (`GOOD`, `MAINTENANCE`, `REPLACE`), and book value depreciation.
- **Financial Ledger & Expense Accounting (`/finance`)**: Real-time cash flow ledger logging revenues, operational expenditures, supplier raw material purchasing, and net profit margin summaries.
- **Promotional CMS & Announcements (`/`, `/posts`, `/settings`)**: Public promotional landing page with hero banners, brand history, featured menu highlights, announcement blog publishing (`/posts`), and global store configuration (`/settings` - shop name, phone, tax percentage, receipt footer).

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
