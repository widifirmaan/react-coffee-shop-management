# Siap Nyafe POS

> Coffee shop management platform, customer self-ordering portal, and kitchen display system.

Siap Nyafe is a coffee shop point-of-sale (POS) and management web application built with React 18, Vite 5, and React Router. It features a customer self-ordering menu, cashier checkout with change calculation, kitchen display system (KDS) order tracking, ingredient inventory monitoring, staff shift scheduling, and manager financial analytics.

[![Live Demo](https://img.shields.io/badge/Demo-siapnyafe.widifirmaan.web.id-10B981?style=flat-square&logo=cloudflare&logoColor=white)](https://siapnyafe.widifirmaan.web.id)
[![React 18](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite 5](https://img.shields.io/badge/Vite-5.0.0-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React Router](https://img.shields.io/badge/Router-v6.18-CA4245?style=flat-square&logo=reactrouter&logoColor=white)](https://reactrouter.com/)
[![Lucide Icons](https://img.shields.io/badge/Icons-Lucide_React-F56565?style=flat-square)](https://lucide.dev/)
[![Design System](https://img.shields.io/badge/Design-Neo--Brutalism-FCD34D?style=flat-square)](#features)

---

## Live Production

- **URL:** [https://siapnyafe.widifirmaan.web.id](https://siapnyafe.widifirmaan.web.id)
- **Deployment:** Cloudflare Pages / Custom Domain CDN (`CNAME: siapnyafe.widifirmaan.web.id`)

---

## Showcase

| Desktop Interface (MacBook Pro M4) | Mobile Interface (iPhone 16 Pro) |
| :---: | :---: |
| **Customer Self-Order Menu & Cart Desktop**<br>![Order Menu Desktop](screenshots/Coffee%20Order%20Menu%20Desktop.png) | **Customer Self-Order Menu Mobile**<br>![Order Menu Mobile](screenshots/Coffee%20Order%20Menu%20Mobile.png) |
| **Operations Manager Dashboard Desktop**<br>![Manager Dashboard Desktop](screenshots/Coffee%20Manager%20Dashboard%20Desktop.png) | **Operations Manager Dashboard Mobile**<br>![Manager Dashboard Mobile](screenshots/Coffee%20Manager%20Dashboard%20Mobile.png) |
| **Cashier Point-of-Sale Register Desktop**<br>![Cashier POS Desktop](screenshots/Coffee%20Cashier%20POS%20Desktop.png) | **Cashier Point-of-Sale Register Mobile**<br>![Cashier POS Mobile](screenshots/Coffee%20Cashier%20POS%20Mobile.png) |
| **Public Landing CMS & Promotions Desktop**<br>![Landing CMS Desktop](screenshots/Coffee%20Landing%20CMS%20Desktop.png) | **Public Landing CMS Mobile**<br>![Landing CMS Mobile](screenshots/Coffee%20Landing%20CMS%20Mobile.png) |
| **Staff & Manager Login Gate Desktop**<br>![Staff Login Desktop](screenshots/Coffee%20Staff%20Login%20Desktop.png) | **Staff & Manager Login Gate Mobile**<br>![Staff Login Mobile](screenshots/Coffee%20Staff%20Login%20Mobile.png) |

---

## Features

- **Customer Self-Ordering Portal (`/order`)**: Digital guest menu with multi-category filtering (Coffee, Non-Coffee, Pastries, Main Course), drink customization modals (sweetness, ice levels, milk alternatives), and live cart management.
- **Cashier POS Register (`/cashier`)**: Order checkout terminal calculating subtotal, configurable tax percentages, coupon discounts, cash tendered exchange, and receipt printing.
- **Manager Operations Dashboard (`/dashboard`)**: Sales overview tracking daily revenue, profit margins, top-selling items, and active order counts.
- **Barista Kitchen Display System (`/kitchen`)**: Real-time barista ticket queue with order timestamps, preparation checklists, and progressive order lifecycle status toggling (Pending, Brewing, Completed).
- **Ingredient & Stock Inventory Control (`/inventory`)**: SKU-level stock level monitoring for coffee beans, dairy, syrups, and packaging with low-stock warnings.
- **Staff Roster & Weekly Shift Matrix (`/employee`, `/shift`)**: Multi-tier employee management tracking wage structures, contact information, role permissions, and weekly shift scheduling.
- **Table Waiter Assistance Dispatcher (`/waiter`)**: Real-time table calling system and service request notification dispatcher for floor staff.
- **Asset Depreciation & Equipment Logs (`/asset-management`)**: Maintenance tracking and depreciation calculations for espresso machines, commercial grinders, and cafe hardware.
- **Financial Accounting & Ledger (`/finance`)**: Operational cost ledger, expense breakdown, and daily cash reconciliations.
- **Customer Feedback & Rating Portal (`/feedback`)**: Guest review collection interface capturing satisfaction scores and customer experience sentiment.
- **Promotional CMS & Announcements (`/cms`, `/post-management`)**: Content management system for cafe announcements, blog posts, and seasonal promotional banners.
- **High-Contrast Component System**: Custom UI styled with CSS variables, borders, card shadows, and Lucide React vector icons.

---

## Tech Stack

| Category | Technologies | Purpose |
| :--- | :--- | :--- |
| **Core Framework** | React `18.2.0`, Vite `5.0.0` | SPA frontend foundation with fast Vite HMR and production bundle optimization |
| **Routing** | React Router DOM `6.18.0` | Client-side routing, URL parameter binding, and protected route wrappers |
| **State & Networking** | React Context API, Axios `1.6.0` | Centralized authentication state with global HTTP request interceptors |
| **Carousels & Sliders** | Swiper `11.0.5` | Mobile touch swipe carousels for promotional menu highlights |
| **Iconography** | Lucide React `0.292.0` | Consistent vector line icons across POS registers and dashboard views |
| **Hosting** | Cloudflare Pages | Global static edge delivery with custom apex domain routing |

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
│   │   ├── OrderPage.jsx           # Customer self-ordering digital menu
│   │   ├── DashboardPage.jsx       # Manager operations dashboard
│   │   ├── CashierPage.jsx         # POS register checkout
│   │   ├── KitchenPage.jsx         # Kitchen Display System (KDS)
│   │   ├── InventoryPage.jsx       # Raw ingredient stock tracking
│   │   ├── EmployeePage.jsx        # Staff directory & roles
│   │   ├── ShiftPage.jsx           # Weekly shift scheduling
│   │   ├── WaiterPage.jsx          # Table waiter assistance calls
│   │   ├── AssetManagementPage.jsx # Coffee machinery & depreciation
│   │   ├── FinancePage.jsx         # Financial ledger & expense tracking
│   │   ├── FeedbackPage.jsx        # Customer feedback & reviews
│   │   ├── CMSPage.jsx             # Public promotional landing
│   │   ├── PostManagementPage.jsx  # Blog & announcement manager
│   │   ├── SettingsPage.jsx        # Store configuration & tax settings
│   │   └── LoginPage.jsx           # Auth gate
│   ├── utils/                      # Staff and business logic helper algorithms
│   ├── App.jsx                     # Route definitions and layouts
│   └── main.jsx                    # React application root
├── screenshots/                    # MacBook Pro M4 & iPhone 16 Pro showcase mockups
└── README.md
```

---

## Getting Started & Local Development

### Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **npm** or **yarn**

### Installation & Setup

> **Environment Variables:** No external API keys are required for local frontend development. Default demo staff credentials and menu data are pre-configured for local evaluation.

```bash
# 1. Clone the repository
git clone https://github.com/widifirmaan/react-coffee-shop-management.git
cd react-coffee-shop-management

# 2. Install project dependencies
npm install

# 3. Start local development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your web browser.

### Production Build

```bash
# Compile and optimize production distribution bundle
npm run build
```

---

## Author

Developed by **[Widi Firmansyah](https://widifirmaan.web.id)**.
