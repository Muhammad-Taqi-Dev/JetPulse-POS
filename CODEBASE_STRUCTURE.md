# 📚 ApexPOS Enterprise — Codebase & Architecture Guide

This document provides a comprehensive technical breakdown of the **ApexPOS Enterprise** codebase, detailing the file structure, MVVM pattern, reactive data flows, state management, and design conventions used in this **Oracle JET v21** and **Knockout.js** application.

---

## 1. High-Level Architecture Overview

ApexPOS is structured as an **Enterprise Single Page Application (SPA)** following the **Model-View-ViewModel (MVVM)** architectural pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                            VIEW                             │
│         (HTML5 Templates + Knockout Declarative Bindings)   │
└──────────────────────────────┬──────────────────────────────┘
                                │  ▲
                  User Actions  │  │  Declarative Two-Way
                  (Click/Type)  │  │  Data-Binding Updates
                                ▼  │
┌─────────────────────────────────────────────────────────────┐
│                          VIEWMODEL                          │
│     (TypeScript Classes, ko.observable & ko.pureComputed)   │
└──────────────────────────────┬──────────────────────────────┘
                                │  ▲
                  Data Requests │  │  Typed JSON Payloads /
                  (Get / Post)  │  │  Asynchronous Promises
                                ▼  │
┌─────────────────────────────────────────────────────────────┐
│                     MODEL & SERVICE LAYER                   │
│        (BaseService, StorageService, BaseModel, DAL)        │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Comprehensive Directory & File Structure

```
JET_Web_Application/
├── README.md                            # GitHub overview & quick start guide
├── CODEBASE_STRUCTURE.md                # (This file) Architecture & codebase guide
├── package.json                         # Project dependencies, devDependencies & engines
├── tsconfig.json                        # TypeScript compiler options (AMD module output)
├── oraclejetconfig.json                 # Oracle JET CLI configuration & build mappings
│
├── src/                                 # APPLICATION SOURCE ROOT
│   ├── index.html                       # Master HTML shell (navbar, navigation, global modals)
│   │
│   ├── css/                             # DESIGN SYSTEM & STYLES
│   │   ├── app.css                      # Unified styles (themes, layout, components, 80mm print)
│   │   └── images/                      # Favicons, avatars & SVG branding icons
│   │
│   └── ts/                              # TYPESCRIPT SOURCE CODE
│       ├── declarations.d.ts            # RequireJS text plugin typings (`text!*`)
│       ├── accUtils.ts                  # Screen-reader accessibility announcer
│       ├── appController.ts             # Root ViewModel, router, active cart & global actions
│       ├── root.ts                      # Bootstrap entry point, bindings init & component loader
│       │
│       ├── bindings/                    # KNOCKOUT CUSTOM BINDING HANDLERS
│       │   └── custom-bindings.ts       # currency, pulseOnChange, stockBadge, numericOnly
│       │
│       ├── framework/                   # ENTERPRISE FRAMEWORK SERVICES
│       │   ├── base-model.ts            # Formatting utilities (currency, dates, reference IDs)
│       │   ├── base-service.ts          # REST & mock asynchronous HTTP transport client
│       │   └── storage-service.ts       # Namespaced LocalStorage persistence manager
│       │
│       ├── data/                        # DATA ACCESS LAYER
│       │   └── mock-products.ts         # Catalog dataset with stock, categories & pricing
│       │
│       ├── resources/nls/               # LOCALIZATION (NLS) DICTIONARIES
│       │   ├── pos.ts                   # Domain strings (Catalog, Cart, Checkout, Receipt)
│       │   └── generic.ts               # Generic strings (Buttons, Statuses, Errors)
│       │
│       ├── components/                  # MODULAR AMD WEB COMPONENTS
│       │   ├── index.ts                 # Central component registry
│       │   ├── pos-header/              # Header widget (Time clock, cashier switcher, order pill)
│       │   │   ├── loader.ts            # Component loader (exports template & viewModel)
│       │   │   ├── pos-header.ts        # ViewModel controller with interval timer
│       │   │   └── pos-header.html      # Component HTML markup
│       │   ├── product-catalog/         # Product catalog widget (Search, category chips, grid)
│       │   │   ├── loader.ts            # Component loader
│       │   │   ├── model.ts             # DAL querying BaseService
│       │   │   ├── product-catalog.ts   # ViewModel with filteredProducts pureComputed
│       │   │   └── product-catalog.html # Product cards grid template
│       │   ├── cart-drawer/             # Order register widget (Steppers, vouchers, summary)
│       │   │   ├── loader.ts            # Component loader
│       │   │   ├── model.ts             # CartItem domain entity model
│       │   │   ├── cart-drawer.ts       # ViewModel with financial computation tree
│       │   │   └── cart-drawer.html     # Items table, customer autocomplete & voucher inputs
│       │   ├── checkout-modal/          # Multi-tender payment processor modal
│       │   │   ├── loader.ts            # Component loader
│       │   │   ├── checkout-modal.ts    # ViewModel with change calculation & PIN gateway
│       │   │   └── checkout-modal.html  # Modal dialog markup (Cash, Virtual Card, QR Pay)
│       │   └── invoice-receipt/         # Thermal receipt preview & 80mm print generator
│       │       ├── loader.ts            # Component loader
│       │       ├── invoice-receipt.ts   # ViewModel with print & reset triggers
│       │       └── invoice-receipt.html # 80mm thermal receipt paper template with barcode
│       │
│       ├── viewModels/                  # JET PAGE VIEWMODELS
│       │   ├── dashboard.ts             # POS Register workspace module
│       │   ├── incidents.ts             # Order History & Receipts archive module
│       │   ├── customers.ts             # Customer Directory & CRM module
│       │   └── about.ts                 # Architecture overview module
│       │
│       └── views/                       # JET PAGE HTML VIEWS
│           ├── dashboard.html           # Hosts dual-pane POS workspace & modals
│           ├── incidents.html           # Revenue KPI cards, search bar & order history
│           ├── customers.html           # Customer cards, tier badges, KPIs & Add modal
│           └── about.html               # Technical architecture documentation view
```

---

## 3. Core Reactivity & MVVM Mechanics

### A. The Financial Calculation Tree (`cart-drawer.ts`)
Calculations in ApexPOS reactively cascade through a pure dependency graph. When an item quantity or promo voucher changes, **zero manual DOM math** is required:

```
cart (ko.observableArray of CartItem)
  ├── item.lineTotal()  ───┐
  └── item.lineTotal()  ───┼──> subTotal() ───┐
                           │                  ├──> voucherDiscountAmount() ──┐
voucherDiscount (obs) ─────┘                  ├──> taxableAmount()          ├──> grandTotal()
taxRate (obs: 8%) ────────────────────────────┼──> taxAmount() ─────────────┘
```

```typescript
// PureComputed implementation in cart-drawer.ts
this.subTotal = ko.pureComputed(() => {
  return this.cart().reduce((sum, item) => sum + item.lineTotal(), 0);
});

this.voucherDiscountAmount = ko.pureComputed(() => {
  const discountPct = this.voucherDiscount();
  return discountPct > 0 ? (this.subTotal() * discountPct) / 100 : 0;
});

this.taxAmount = ko.pureComputed(() => {
  const taxable = Math.max(0, this.subTotal() - this.voucherDiscountAmount());
  return taxable * this.taxRate();
});

this.grandTotal = ko.pureComputed(() => {
  return Math.max(0, this.subTotal() - this.voucherDiscountAmount() + this.taxAmount());
});
```

---

### B. Multi-Tender Checkout Validation (`checkout-modal.ts`)
The checkout modal computes payment validity and change return in real-time:

```typescript
// Change due calculator
this.changeDue = ko.pureComputed(() => {
  const tendered = parseFloat(this.amountTendered()) || 0;
  const total = this.orderTotal();
  return Math.max(0, tendered - total);
});

// Shortage indicator
this.isShortage = ko.pureComputed(() => {
  if (this.selectedMethod() !== "cash") return false;
  const tendered = parseFloat(this.amountTendered()) || 0;
  return tendered < this.orderTotal() && tendered > 0;
});

// Cash validation
this.isCashValid = ko.pureComputed(() => {
  const tendered = parseFloat(this.amountTendered()) || 0;
  return tendered >= this.orderTotal();
});

// PIN validation for card terminal
this.isPinValid = ko.pureComputed(() => {
  return this.cardPin().length === 4;
});
```

---

### C. Automated Customer CRM Sync & Tier Upgrades (`appController.ts`)
When a sale is completed with a customer name or phone number, `processCustomerSale` automatically syncs the CRM database:

```typescript
public processCustomerSale(customerName: string, customerPhone: string, grandTotal: number): void {
  let customers: CustomerRecord[] = StorageService.getItem<CustomerRecord[]>(StorageService.KEY_CUSTOMERS, []);
  
  // Find customer by phone number or exact name match
  let customer = customers.find(c => (customerPhone && c.phone === customerPhone) || (customerName && c.name.toLowerCase() === customerName.toLowerCase()));

  const pointsEarned = Math.floor(grandTotal);

  if (customer) {
    // Update existing customer record
    customer.totalVisits = (customer.totalVisits || 1) + 1;
    customer.totalSpend = (customer.totalSpend || 0) + grandTotal;
    customer.points = (customer.points || 0) + pointsEarned;
    customer.lastVisit = new Date().toISOString().split("T")[0];

    // Automatic Tier Calculation based on Lifetime Spend
    if (customer.totalSpend >= 1200) {
      customer.tier = "Platinum";
    } else if (customer.totalSpend >= 500) {
      customer.tier = "Gold";
    } else if (customer.totalSpend >= 150) {
      customer.tier = "Silver";
    } else {
      customer.tier = "Standard";
    }
  } else {
    // Auto-register new customer
    const newCustomer: CustomerRecord = {
      id: "CUST-" + String(Date.now()).slice(-4),
      name: customerName,
      phone: customerPhone,
      email: customerName.toLowerCase().replace(/\s+/g, ".") + "@example.com",
      tier: grandTotal >= 1200 ? "Platinum" : (grandTotal >= 500 ? "Gold" : (grandTotal >= 150 ? "Silver" : "Standard")),
      totalSpend: grandTotal,
      points: pointsEarned,
      totalVisits: 1,
      lastVisit: new Date().toISOString().split("T")[0],
      avatar: "👤"
    };
    customers.push(newCustomer);
  }

  StorageService.setItem(StorageService.KEY_CUSTOMERS, customers);
}
```

---

### D. Custom Knockout Binding Handlers (`custom-bindings.ts`)
Declarative binding handlers eliminate boilerplate DOM manipulation:

1. **`currency`**: Formats numbers into localized currency strings (e.g. `$1,250.00`).
   ```html
   <span data-bind="currency: lineTotal"></span>
   ```
2. **`pulseOnChange`**: Triggers a smooth CSS micro-animation whenever an observable's value changes.
   ```html
   <span data-bind="currency: grandTotal, pulseOnChange: grandTotal"></span>
   ```
3. **`stockBadge`**: Generates status badge classes and localized labels based on inventory count.
   ```html
   <span data-bind="stockBadge: stock"></span>
   ```
4. **`numericOnly`**: Restricts text inputs to valid decimal numbers in real time.
   ```html
   <input data-bind="value: amountTendered, numericOnly: true" />
   ```

---

## 4. Layer-by-Layer Technical Walkthrough

### 1. Framework & Service Layer (`src/ts/framework/`)
- **[`base-model.ts`](./src/ts/framework/base-model.ts)**: Centralized singleton formatters (`formatCurrency`, `formatNumber`, `formatDateTime`), reference number generators (`generateReference("INV-")`), and string interpolation utilities.
- **[`base-service.ts`](./src/ts/framework/base-service.ts)**: Asynchronous REST client wrapper with simulated network latency (150–400ms) and typed Promise responses.
- **[`storage-service.ts`](./src/ts/framework/storage-service.ts)**: Central persistence engine with namespaced storage keys:
  - `StorageService.KEY_ORDERS` (`POS_APP_ORDERS`): Completed transaction history.
  - `StorageService.KEY_CUSTOMERS` (`POS_APP_CUSTOMERS`): Customer CRM directory.
  - `StorageService.KEY_CASHIERS` (`POS_APP_CASHIERS`): Registered cashier staff accounts.
  - `StorageService.KEY_HELD_ORDERS` (`POS_APP_HELD_ORDERS`): Parked orders awaiting resumption.
  - `StorageService.KEY_THEME` (`POS_APP_THEME`): Active dark/light theme preference.

---

### 2. Modular AMD Web Components (`src/ts/components/`)
Each component is a decoupled Knockout component registered via `src/ts/components/index.ts`:

- **`pos-header`**: Top bar component with brand logo, live digital clock timer, cashier switcher dropdown, active cart summary pill, and theme toggle.
- **`product-catalog`**: Product catalog grid with real-time text search, category filtering chips, and stock badges.
- **`cart-drawer`**: POS register workspace with item quantity steppers, discount promo voucher validation, customer autocomplete, order hold action, and pay trigger.
- **`checkout-modal`**: Multi-tender payment processor featuring Cash (with quick-cash chips), Virtual Credit/Debit Card (with PIN pad simulator), and QR Digital Pay.
- **`invoice-receipt`**: 80mm thermal receipt generator featuring store branding, invoice ID, cashier attribution, itemized table, tax breakdown, barcode, and `@media print` styling.

---

### 3. Application Controller & Routing (`src/ts/appController.ts`)
The root ViewModel orchestrates application-wide state:
- **Navigation**: Uses Oracle JET `CoreRouter` and `ModuleRouterAdapter` to route between `dashboard`, `incidents`, `customers`, and `about`.
- **Global Observables**:
  - `cart`: Observable array of active `CartItem` objects.
  - `activeCashier` & `cashiersList`: Active staff profile and full cashiers list.
  - `heldOrders` & `activeHeldOrderCount`: List and count of parked orders.
  - `darkMode`: Active theme state (Light/Dark).
  - `toasts`: Array of active toast notifications.
- **Global Workflows**:
  - `addToCart(product, qty)`: Adds or increments product in cart.
  - `holdCurrentOrder()`: Captures cart state snapshot and saves to held orders.
  - `resumeHeldOrder(heldOrder)`: Restores snapshot into active cart and removes from held list.
  - `discardHeldOrder(heldOrder)`: Removes held order with notification.
  - `switchCashier(cashier)`: Switches active cashier profile.
  - `addCashier(name, role, avatar, pin)`: Registers a new cashier.
  - `deleteCashier(cashier)`: Removes custom cashier.
  - `onOrderCompleted(orderData)`: Saves completed order, updates CRM, clears cart, and opens receipt.
  - `openReceipt(orderData)`: Triggers the global thermal receipt modal for printing or reprinting.

---

### 4. Page ViewModels & Views (`src/ts/viewModels/` & `src/ts/views/`)
- **`dashboard.ts` / `dashboard.html`**: Dual-pane POS workspace hosting `<product-catalog>` and `<cart-drawer>`.
- **`incidents.ts` / `incidents.html`**: Order History & Revenue Analytics with KPI summary cards, transaction search, payment filters, and instant receipt reprint triggers.
- **`customers.ts` / `customers.html`**: Customer Directory & CRM dashboard with KPI metrics, search filtering, "+50 Points" bonus rewards, and manual "Add Customer" modal.
- **`about.ts` / `about.html`**: Interactive system architecture overview and framework feature showcase.

---

## 5. End-to-End Transaction Flow

```
[ Cashier Selects Item in Catalog ]
               │
               ▼
[ product-catalog.ts: addToCart(product) ]
               │
               ▼
[ appController.ts: addToCart() verifies stock & updates cart observableArray ]
               │
               ▼
[ cart-drawer.ts: subTotal, voucherDiscount, taxAmount, grandTotal pureComputeds update ]
               │
               ├── (Optional) [ User clicks "Hold Order" ] ──> [ Snapshot saved to HELD_ORDERS ]
               │                                                [ Navbar badge updates ]
               ▼
[ User clicks "Pay Now" -> checkout-modal.ts: open(orderData) ]
               │
               ├── [ Cash ] ──> [ Enter amount / Click quick chip -> Shortage check -> changeDue ]
               ├── [ Card ] ──> [ Enter 4-digit PIN on virtual terminal -> Validate ]
               └── [ QR ]   ──> [ Scan QR code -> Simulate Mobile Wallet Pay ]
               │
               ▼
[ User clicks "Complete Sale" -> BaseService.post("/api/v1/orders") ]
               │
               ▼
[ appController.ts: onOrderCompleted() ]
   ├── 1. Saves order record to StorageService.KEY_ORDERS
   ├── 2. Calls processCustomerSale() (accumulates spend, increments visits, calculates tier)
   ├── 3. Clears active cart & resets voucher
   ├── 4. Displays success toast notification
   └── 5. Calls invoiceReceipt.open() with completed order payload
               │
               ▼
[ invoice-receipt.ts: Renders 80mm thermal receipt with barcode -> User clicks "Print" ]
               │
               ▼
[ incidents.ts: Order is immediately searchable in history with live revenue KPI updates ]
```

---

## 6. How to Extend the Application

### A. Adding a New Product
Open [`src/ts/data/mock-products.ts`](./src/ts/data/mock-products.ts) and add a new typed product:
```typescript
{
  id: "PRD-013",
  sku: "BEV-MAT-13",
  name: "Matcha Green Tea Latte",
  category: "Beverages",
  price: 5.50,
  stock: 24,
  icon: "🍵",
  description: "Ceremonial grade Japanese matcha whisked with steamed oat milk."
}
```

---

### B. Adding a New Promo Voucher Code
Open [`src/ts/components/cart-drawer/cart-drawer.ts`](./src/ts/components/cart-drawer/cart-drawer.ts) and add the code to `availableVouchers`:
```typescript
private availableVouchers: Record<string, number> = {
  SAVE10: 10,
  VIP20: 20,
  FLASH30: 30,
  SUMMER15: 15  // 15% Summer promo
};
```

---

### C. Adding a New Page Route
1. Create your view template: `src/ts/views/inventory.html`
2. Create your viewModel: `src/ts/viewModels/inventory.ts`
   ```typescript
   class InventoryViewModel {
     // ViewModel logic
   }
   export = InventoryViewModel;
   ```
3. In `src/ts/appController.ts`, register the route in `navData`:
   ```typescript
   { path: "inventory", detail: { label: "Inventory", iconClass: "oj-ux-ico-box" } }
   ```
4. Rebuild the bundle using `npx ojet build`.
