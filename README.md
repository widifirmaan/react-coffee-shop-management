# Siap Nyafe POS

> Neo-brutalist coffee shop management platform, customer self-order portal, and kitchen display system.

Siap Nyafe is an all-in-one coffee shop point-of-sale (POS) and operations suite built with React 18 and Vite. It unifies customer digital self-ordering, real-time kitchen ticket queueing (KDS), cashier order processing, inventory tracking, staff shift scheduling, and manager revenue analytics under a high-contrast Neo-Brutalist interface.

[![Live Demo](https://img.shields.io/badge/Demo-react--coffee--shop--management.vercel.app-10B981?style=flat-square&logo=vercel&logoColor=white)](https://react-coffee-shop-management.vercel.app/)
[![React 18](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React Router](https://img.shields.io/badge/Router-v6.18-CA4245?style=flat-square&logo=reactrouter&logoColor=white)](https://reactrouter.com/)
[![Lucide Icons](https://img.shields.io/badge/Icons-Lucide_React-F56565?style=flat-square)](https://lucide.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

---

## Live Production

- **URL:** [https://react-coffee-shop-management.vercel.app/](https://react-coffee-shop-management.vercel.app/)
- **Deployment:** Vercel Edge Network
- **Design System:** Neo-Brutalism (Bold high-contrast borders, solid drop shadows, tactile typography)

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

## Core Features

- **Customer Self-Ordering Portal (`/order`)**: Interactive digital menu with category filtering (Coffee, Non-Coffee, Pastries), item detail modal, customizable options, and dynamic cart summary.
- **Cashier POS Station (`/cashier`)**: Rapid order entry system with real-time tax calculation, discount application, payment method handling, and thermal receipt print trigger.
- **Operations Dashboard (`/dashboard`)**: KPI overview cards for daily gross revenue, net profit margin, top-selling coffee blends, and active orders velocity.
- **Kitchen Display System (`/kitchen`)**: Real-time order status board for baristas with order timers, preparation steps, and instant status toggling (Pending, Brewing, Completed).
- **Inventory & Stock Depletion (`/inventory`)**: Track raw ingredients, coffee beans, milk, and packaging with low-stock alerts and reorder thresholds.
- **Staff Roster & Shift Matrix (`/employee`, `/shift`)**: Employee profiles, hourly wages, role permissions (Cashier, Barista, Waiter, Manager), and weekly shift schedules.
- **Neo-Brutalist Component System**: Custom-engineered UI primitives with crisp 2px-3px solid borders, offset box-shadows, and high-readability retro typography.

---

## Tech Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend Framework** | React `18.2.0` | Functional components with Hooks and Context API state |
| **Bundler & Dev Server** | Vite `5.0.0` | Lightning-fast Hot Module Replacement (HMR) and optimized builds |
| **Routing** | React Router DOM `6.18.0` | Declarative client-side routing with role-based auth guards |
| **HTTP Client** | Axios `1.6.0` | REST API communication with global auth interceptors |
| **Iconography** | Lucide React `0.292.0` | Crisp SVG line icons matching the brutalist theme |
| **Sliders & Carousel** | Swiper `12.0.3` | Mobile touch-friendly promo and menu carousels |

---

## Project Structure

```text
react-coffee-shop-management/
├── src/
│   ├── components/
│   │   ├── layout/       # Navbar, OrderPageHeader, OrderPageFooter
│   │   └── ui/           # Neo-brutalist buttons, cards, modals, tables, badges
│   ├── context/
│   │   └── AuthContext.jsx # Global user authentication & role state
│   ├── pages/
│   │   ├── OrderPage.jsx       # Customer self-ordering digital menu
│   │   ├── DashboardPage.jsx   # Manager operations dashboard
│   │   ├── CashierPage.jsx     # POS register checkout
│   │   ├── KitchenPage.jsx     # Kitchen Display System (KDS)
│   │   ├── InventoryPage.jsx   # Stock tracking
│   │   ├── EmployeePage.jsx    # Staff management
│   │   ├── ShiftPage.jsx       # Shift scheduling
│   │   ├── CMSPage.jsx         # Public promotional landing
│   │   └── LoginPage.jsx       # Auth gate
│   ├── App.jsx                 # Route definitions and layouts
│   └── main.jsx                # React application root
├── raw_screenshots/            # Production screen captures
└── screenshots/                # MacBook Pro M4 & iPhone 16 Pro mockups
```

---

## Getting Started & Local Development

### Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **npm** or **yarn**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/widifirmaan/react-coffee-shop-management.git
   cd react-coffee-shop-management
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start local development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## License

This project is licensed under the [MIT License](LICENSE).
