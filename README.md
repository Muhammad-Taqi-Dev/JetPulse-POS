# ⚡ ApexPOS Enterprise — Smart Point of Sale & Invoice Generator

[![Oracle JET](https://img.shields.io/badge/Oracle%20JET-v21.0.0-F80000?logo=oracle&logoColor=white)](https://www.oracle.com/webfolder/technetwork/jet/index.html)
[![Knockout.js](https://img.shields.io/badge/Knockout.js-MVVM-E44D26?logo=javascript&logoColor=white)](https://knockoutjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-UPL--1.0-blue.svg)](https://oss.oracle.com/licenses/upl/)
[![Thermal Print Ready](https://img.shields.io/badge/Print-80mm%20Thermal%20Receipt-success?logo=espressif&logoColor=white)](#-5-80mm-thermal-tax-receipt-engine)

**ApexPOS Enterprise** is a modern, enterprise-grade Point of Sale (POS), Customer Loyalty CRM, Multi-Tender Checkout Gateway, and Real-Time 80mm Thermal Invoice Generator web application. Built natively on **Oracle JavaScript Extension Toolkit (Oracle JET v21)** and **Knockout.js MVVM** architecture with **TypeScript** and modular **RequireJS AMD Web Components**.

---

## 🌟 Complete Feature Matrix

### 🛒 1. Dual-Pane POS Register (`/dashboard`)
- **Interactive Product Catalog**: Instant full-text search by item name, SKU, or category.
- **Category Filter Chips**: Instant category filtering (`All`, `Beverages`, `Bakery`, `Mains`, `Desserts`, `Snacks`).
- **Live Stock Indicator Badges**: Reactive color-coded stock count pills (`In Stock`, `Low Stock`, `Out of Stock`) with boundary enforcement.
- **Real-Time Financial Engine**: Automatic subtotal, promo vouchers (`SAVE10`, `VIP20`, `FLASH30`), VAT/Tax (8%), and grand total calculation with Knockout `ko.pureComputed` dependency trees.
- **Quantity Stepper Controls**: Increment, decrement, and direct quantity entry with automated stock validation.
- **Customer Autocomplete**: Dynamic customer name and phone number datalist linked with the CRM database.
- **Quick Clear & Keyboard Accessibility**: Fast register reset with confirmation toasts.

---

### ⏸️ 2. Parked & Held Orders System
- **One-Click Order Holding**: Park incomplete or interrupted transactions directly from the register.
- **State Snapshot Preservation**: Preserves cart items, quantities, promo vouchers, customer name, phone number, and timestamp.
- **Live Navbar & Drawer Badges**: Dynamic counters highlight active held orders across all pages.
- **Held Orders Management Modal**:
  - Browse all parked orders with item summaries, customer details, and grand totals.
  - **Resume Order**: Restores the cart and customer snapshot instantly to the register.
  - **Discard Order**: Safely removes held orders with instant toast notifications.
- **Persistent Storage**: Parked orders persist across browser reloads via `StorageService`.

---

### 👨‍💼 3. Cashier Management & Role Switching
- **Quick Navbar Cashier Switcher**: View active cashier avatar, name, and role from the global navbar.
- **Switch Active Cashier**: Seamlessly toggle between cashiers during shift changes.
- **Add New Cashier Modal**: Register new staff with customizable avatars (👨‍💼, 👩‍💼, 🧑‍💻, 👨‍🍳, 👩‍🍳, 🧑‍💼), full names, PIN codes, and role permissions (`Manager`, `Senior Cashier`, `Cashier`, `Trainee`).
- **Cashier Deletion**: Delete custom cashiers with automatic fallback to default staff.
- **Order & Receipt Attribution**: Every transaction and printed receipt logs the active cashier's name and role.

---

### 💳 4. Multi-Tender Checkout & Gateway Simulator
- **💵 Cash Payments**:
  - Real-time tendered amount input with change return calculation.
  - Quick-Cash shortcut chips (`Exact`, `$10`, `$20`, `$50`, `$100`).
  - Shortage validation prevents completing sales when tendered cash is insufficient.
- **💳 Credit / Debit Cards**:
  - Interactive virtual card visualization with live card number, cardholder name, and expiry date.
  - Virtual PIN-pad terminal simulator (`1–9`, `C`, `0`, `OK`) with masked 4-digit PIN security (`••••`).
  - Simulated card authorization with contactless/chip gateway response.
- **📱 QR Digital Pay**:
  - High-contrast SVG QR Code generator for mobile wallet payments.
  - "Simulate Wallet Scan & Pay" instant approval action.
- **Customer Loyalty Capture**: Automatically passes customer details to CRM upon sale completion.

---

### 🧾 5. 80mm Thermal Tax Receipt Engine
- **Standard 80mm POS Format**: Built specifically for thermal POS printers (Epson, Star Micronics, Citizen) with `@media print` CSS optimization.
- **Receipt Details**:
  - Store branding, address, tax registration number, and reference invoice ID (`INV-YYYYMMDD-XXXX`).
  - Live timestamp and assigned Cashier name & role.
  - Itemized items table with quantities, unit prices, and line totals.
  - Subtotal, voucher discount code & savings, VAT/Tax (8%), and grand total.
  - Tendered cash amount, change returned, and payment method details.
  - Generated thermal barcode for invoice scanning.
- **Cross-Page Reprint Reliability**: Globally mounted modal allows reprinting receipts immediately after checkout or at any time from the Order History archive.

---

### 👥 6. Customer Directory & Automated CRM Sync (`/customers`)
- **Automated POS Checkout Sync**:
  - Whenever an order is completed with a customer name or phone number, ApexPOS checks the CRM directory.
  - **Existing Customer**: Increments visit count (+1), accumulates total spend (+$grandTotal), updates last visit date, and awards **1 Loyalty Point per $1 spent**.
  - **Automatic Tier Upgrades**: Automatically recalculates and upgrades customer tiers based on lifetime spend:
    - 🔵 **Standard**: `$0 – $149`
    - ⚪ **Silver**: `$150 – $499`
    - 🟡 **Gold**: `$500 – $1,199`
    - 🟣 **Platinum**: `$1,200+`
  - **New Customer**: Automatically registers new customers in the directory without manual entry.
- **CRM Dashboard**:
  - Metric KPI cards: Total Customers, VIP / Loyalty Members, and Lifetime Spend.
  - Real-time search filter by customer name, phone number, email, or membership tier.
  - Manual "Add Customer" modal with avatar selector.
  - Quick "+50 Points" bonus reward button per customer.
  - Delete customer capability.

---

### 📜 7. Order History & Revenue Analytics (`/incidents`)
- **Real-Time Financial KPIs**: Total Revenue, Completed Sales Count, and Average Ticket Size.
- **Search & Filter**: Search transactions by Invoice ID, customer name, phone, or cashier name.
- **Payment Method Filter**: Filter by payment method (`All`, `Cash`, `Card`, `QR`).
- **Instant Receipt Reprint**: One-click reprint of any historical invoice.
- **Persistent Archive**: Stores full transaction history in `localStorage` via `StorageService`.

---

### 🌓 8. Unified Dark / Light Theme & UX Polish
- **Single Master Theme Toggle**: Seamless switch between Dark and Light mode from the top navbar with persistent preferences.
- **Tailored Modern Typography**: Inter / Outfit sans-serif typeface stack with high-contrast readability.
- **Custom Knockout Handlers**: `currency`, `pulseOnChange`, `stockBadge`, `numericOnly`.
- **Maximized POS Viewport**: Full-height workspace tailored for POS terminals, tablets, and desktop registers.

---

## 🚀 Quick Start & How to Run

### Prerequisites
- [Node.js](https://nodejs.org/) (version `>= 18.0.0` or `>= 16.0.0`)
- npm (bundled with Node.js)

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-username/JET_Web_Application.git
cd JET_Web_Application

# Install dependencies
npm install
```

### 2. Run the Development Server
Start the Oracle JET development server with live reload:
```bash
# Start dev server with browser launch
npx ojet serve

# Or start dev server in background / server-only mode
npx ojet serve --server-only
```
The application will be accessible at: **`http://localhost:8000`**

### 3. Build for Production
To compile and bundle optimized artifacts in the `web/` directory:
```bash
npx ojet build --release
```

---

## 🏗️ Project Architecture & File Structure

For an exhaustive technical breakdown of every class, service, MVVM binding, and data flow, see:  
👉 **[`CODEBASE_STRUCTURE.md`](./CODEBASE_STRUCTURE.md)**

```
JET_Web_Application/
├── src/
│   ├── css/
│   │   ├── app.css                     # Unified design system, light/dark themes & print styles
│   │   └── images/                     # Logos, avatars & SVG branding icons
│   │
│   ├── ts/
│   │   ├── bindings/
│   │   │   └── custom-bindings.ts      # Custom Knockout binding handlers (currency, pulseOnChange, etc.)
│   │   ├── components/                 # Modular Knockout AMD Web Components
│   │   │   ├── pos-header/             # Header widget with clock, cashier info & order pill
│   │   │   ├── product-catalog/        # Catalog grid, search & category chips
│   │   │   ├── cart-drawer/            # Register cart, steppers, vouchers & financial tree
│   │   │   ├── checkout-modal/         # Multi-tender payment processor (Cash, Card, QR)
│   │   │   ├── invoice-receipt/        # 80mm thermal receipt & print generator
│   │   │   └── index.ts                # Central component registration
│   │   ├── data/
│   │   │   └── mock-products.ts        # Typed catalog database with categories & stock
│   │   ├── framework/                  # Enterprise services layer
│   │   │   ├── base-model.ts           # Utility formatters (currency, dates, reference IDs)
│   │   │   ├── base-service.ts         # REST / Mock asynchronous HTTP client engine
│   │   │   └── storage-service.ts      # Namespaced LocalStorage persistence manager
│   │   ├── resources/nls/              # Localization dictionaries (pos.ts, generic.ts)
│   │   ├── viewModels/                 # Page ViewModels (dashboard, incidents, customers, about)
│   │   ├── views/                      # Page HTML templates (dashboard, incidents, customers, about)
│   │   ├── appController.ts            # Root application ViewModel, router & global state
│   │   └── root.ts                     # Bootstrap entry point & component loader
│   └── index.html                      # Single page application shell & global modals
├── oraclejetconfig.json                # Oracle JET CLI configuration
├── tsconfig.json                       # TypeScript compiler options (AMD module output)
└── package.json                        # Project metadata & dependencies
```

---

## 🏷️ Demo Data & Testing References

### Demo Promo Voucher Codes
Enter these codes in the register voucher box to test discount calculations:
- **`SAVE10`** — 10% Discount on order subtotal
- **`VIP20`** — 20% VIP Customer Discount
- **`FLASH30`** — 30% Flash Sale Discount

### Demo Cashiers
- **Sarah Connor** (Manager) — PIN: `1234`
- **Alex Morgan** (Senior Cashier) — PIN: `5678`
- **Elena Rostova** (Cashier) — PIN: `9012`

### Demo Customers (CRM)
- **Sarah Jenkins** (`+1 555-0192`) — Platinum Member
- **Michael Chang** (`+1 555-0143`) — Gold Member
- **Emma Watson** (`+1 555-0178`) — Silver Member
- **David Miller** (`+1 555-0165`) — Standard Member

---

## 🧰 Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | [Oracle JET v21.0.0](https://www.oracle.com/webfolder/technetwork/jet/index.html) | Enterprise SPA Framework, Router & Core Tooling |
| **Reactivity** | [Knockout.js v3.5.1](https://knockoutjs.com/) | Declarative MVVM, pureComputeds, observableArrays |
| **Language** | [TypeScript v5.8.3](https://www.typescriptlang.org/) | Strongly typed models, services, and viewModels |
| **Module Loader** | [RequireJS AMD](https://requirejs.org/) | Modular asynchronous script loading & component manifests |
| **Styling** | Vanilla CSS3 + Custom Design System | CSS variables, Flexbox/Grid, Dark/Light modes, Thermal `@media print` |
| **Persistence** | Namespaced `localStorage` | StorageService for orders, customers, cashiers, held orders, and themes |

---

## 👨‍💻 Author & Maintainer
- **Muhammad Taqi** — Frontend & Oracle JET Engineer

## 📄 License
This project is licensed under the **Universal Permissive License (UPL), Version 1.0**.
