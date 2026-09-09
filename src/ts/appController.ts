/**
 * @license
 * Copyright (c) 2014, 2026, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
import * as ko from "knockout";
import * as ResponsiveUtils from "ojs/ojresponsiveutils";
import * as ResponsiveKnockoutUtils from "ojs/ojresponsiveknockoututils";
import CoreRouter = require("ojs/ojcorerouter");
import ModuleRouterAdapter = require("ojs/ojmodulerouter-adapter");
import KnockoutRouterAdapter = require("ojs/ojknockoutrouteradapter");
import UrlParamAdapter = require("ojs/ojurlparamadapter");
import ArrayDataProvider = require("ojs/ojarraydataprovider");
import "ojs/ojknockout";
import "ojs/ojmodule-element";
import { ojNavigationList } from "ojs/ojnavigationlist";
import Context = require("ojs/ojcontext");
import "ojs/ojdrawerpopup";

import BaseModel from "./framework/base-model";
import StorageService from "./framework/storage-service";
import { CartItem } from "./components/cart-drawer/model";
import { Product } from "./data/mock-products";
import { CompletedOrderPayload } from "./components/checkout-modal/checkout-modal";

export interface ToastItem {
  id: number;
  message: string;
  type: "info" | "success" | "error";
}

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  tier: "Platinum" | "Gold" | "Silver" | "Standard";
  points: number;
  totalSpent: number;
  visits: number;
  avatar: string;
}

export const DEFAULT_CUSTOMERS: CustomerProfile[] = [
  { id: "CUST-001", name: "Sarah Jenkins", phone: "+1 (555) 234-8901", email: "sarah.j@example.com", tier: "Platinum", points: 1240, totalSpent: 845.50, visits: 42, avatar: "👩‍💼" },
  { id: "CUST-002", name: "David Chen", phone: "+1 (555) 876-5432", email: "david.chen@example.com", tier: "Gold", points: 780, totalSpent: 520.00, visits: 28, avatar: "👨‍💻" },
  { id: "CUST-003", name: "Elena Rodriguez", phone: "+1 (555) 345-6789", email: "elena.r@example.com", tier: "Gold", points: 620, totalSpent: 410.75, visits: 19, avatar: "👩‍🔬" },
  { id: "CUST-004", name: "Marcus Vance", phone: "+1 (555) 901-2345", email: "marcus.v@example.com", tier: "Silver", points: 340, totalSpent: 215.20, visits: 11, avatar: "👨‍🎨" },
  { id: "CUST-005", name: "Amara Patel", phone: "+1 (555) 678-9012", email: "amara.p@example.com", tier: "Standard", points: 110, totalSpent: 78.50, visits: 4, avatar: "👩‍🎓" }
];

export interface CashierProfile {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export interface HeldOrderItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  unitPrice?: number;
  quantity: number;
  icon: string;
  maxStock: number;
  category?: string;
}

export interface HeldOrder {
  id: string;
  timestamp: string;
  formattedTime: string;
  customerName: string;
  cashierName: string;
  items: HeldOrderItem[];
  subTotal: number;
  voucherCode?: string;
  voucherDiscountPercent?: number;
  voucherDiscountAmount?: number;
  taxAmount: number;
  grandTotal: number;
}

interface CoreRouterDetail {
  label: string;
  iconClass: string;
}

class RootViewModel {
  manner: ko.Observable<string>;
  message: ko.Observable<string | undefined>;
  smScreen: ko.Observable<boolean> | undefined;
  mdScreen: ko.Observable<boolean> | undefined;
  router: CoreRouter<CoreRouterDetail> | undefined;
  moduleAdapter: ModuleRouterAdapter<CoreRouterDetail>;
  sideDrawerOn: ko.Observable<boolean>;
  navDataProvider: ojNavigationList<string, CoreRouter.CoreRouterState<CoreRouterDetail>>["data"];
  appName: ko.Observable<string>;
  currentTheme: ko.Observable<string>;
  currentTime: ko.Observable<string>;
  footerLinks: Array<object>;
  selection: KnockoutRouterAdapter<CoreRouterDetail>;

  // Global POS Shared State
  baseModel: typeof BaseModel;
  cart: ko.ObservableArray<CartItem>;
  heldOrders: ko.ObservableArray<HeldOrder>;
  isHeldOrdersModalOpen: ko.Observable<boolean>;
  toasts: ko.ObservableArray<ToastItem>;
  cartItemCount: ko.PureComputed<number>;

  // Cashier Management State
  cashiers: ko.ObservableArray<CashierProfile>;
  activeCashier: ko.Observable<CashierProfile>;
  isCashierDropdownOpen: ko.Observable<boolean>;
  isAddCashierModalOpen: ko.Observable<boolean>;
  newCashierName: ko.Observable<string>;
  newCashierRole: ko.Observable<string>;
  newCashierAvatar: ko.Observable<string>;

  // Component instances
  cartDrawerInstance: any;
  checkoutModalInstance: any;
  receiptModalInstance: any;

  private clockTimerId: any;

  constructor() {
    this.baseModel = BaseModel;
    this.cart = ko.observableArray<CartItem>([]);
    
    // Load persisted held orders
    const savedHeldOrders = StorageService.get<HeldOrder[]>("HELD_ORDERS", []);
    this.heldOrders = ko.observableArray<HeldOrder>(savedHeldOrders);
    this.isHeldOrdersModalOpen = ko.observable<boolean>(false);

    this.toasts = ko.observableArray<ToastItem>([]);
    this.currentTheme = ko.observable(document.documentElement.getAttribute("data-theme") || "dark");
    this.currentTime = ko.observable(this.baseModel.formatDateTime(new Date()));

    // Cashier Management Initialization
    const defaultCashiers: CashierProfile[] = [
      { id: "CSH-01", name: "Muhammad Taqi", role: "Head Cashier & Shift Lead", avatar: "👤" },
      { id: "CSH-02", name: "Sarah Jenkins", role: "Senior POS Operator", avatar: "👩‍💼" },
      { id: "CSH-03", name: "Alex Rivera", role: "Barista / Cashier", avatar: "👨‍🍳" },
      { id: "CSH-04", name: "Elena Gomez", role: "Cashier", avatar: "👩‍🎓" }
    ];

    const savedCashiers = StorageService.get<CashierProfile[]>("CASHIERS_LIST", defaultCashiers);
    this.cashiers = ko.observableArray<CashierProfile>(savedCashiers);
    this.activeCashier = ko.observable<CashierProfile>(this.cashiers()[0] || defaultCashiers[0]);

    this.isCashierDropdownOpen = ko.observable<boolean>(false);
    this.isAddCashierModalOpen = ko.observable<boolean>(false);
    this.newCashierName = ko.observable<string>("");
    this.newCashierRole = ko.observable<string>("Cashier");
    this.newCashierAvatar = ko.observable<string>("👤");

    // Computed total items in cart
    this.cartItemCount = ko.pureComputed(() => {
      return this.cart().reduce((total: number, item: CartItem) => {
        return total + (item.quantity ? item.quantity() : 0);
      }, 0);
    });

    // Start Live Clock Timer
    this.clockTimerId = setInterval(() => {
      this.currentTime(this.baseModel.formatDateTime(new Date()));
    }, 1000);

    // Accessibility announcements
    this.manner = ko.observable("polite");
    this.message = ko.observable();

    const globalBodyElement: HTMLElement | null = document.getElementById("globalBody");
    if (globalBodyElement) {
      globalBodyElement.addEventListener("announce", this.announcementHandler, false);
    }

    // Responsive media queries
    const smQuery: string | null = ResponsiveUtils.getFrameworkQuery("sm-only");
    if (smQuery) {
      this.smScreen = ResponsiveKnockoutUtils.createMediaQueryObservable(smQuery);
    }

    const mdQuery: string | null = ResponsiveUtils.getFrameworkQuery("md-up");
    if (mdQuery) {
      this.mdScreen = ResponsiveKnockoutUtils.createMediaQueryObservable(mdQuery);
    }

    const navData = [
      { path: "", redirect: "dashboard" },
      { path: "dashboard", detail: { label: "POS Register", iconClass: "oj-ux-ico-store" } },
      { path: "incidents", detail: { label: "Order History", iconClass: "oj-ux-ico-receipt" } },
      { path: "customers", detail: { label: "Customers", iconClass: "oj-ux-ico-contact-group" } },
      { path: "about", detail: { label: "About POS", iconClass: "oj-ux-ico-information-s" } }
    ];

    const router = new CoreRouter(navData, {
      urlAdapter: new UrlParamAdapter()
    });
    router.sync();

    this.router = router;
    this.moduleAdapter = new ModuleRouterAdapter(router);
    this.selection = new KnockoutRouterAdapter(router);
    this.navDataProvider = new ArrayDataProvider(navData.slice(1), { keyAttributes: "path" });

    // Drawer state
    this.sideDrawerOn = ko.observable(false);
    this.mdScreen?.subscribe(() => {
      this.sideDrawerOn(false);
    });

    // Header branding
    this.appName = ko.observable("JetPulse POS");

    // Footer links
    this.footerLinks = [
      { name: "JetPulse POS Documentation", linkId: "aboutOracle", linkTarget: "#" },
      { name: "Terminal Support", linkId: "contactUs", linkTarget: "#" },
      { name: "Legal Notices", linkId: "legalNotices", linkTarget: "#" },
      { name: "System Status: Online", linkId: "termsOfUse", linkTarget: "#" }
    ];

    Context.getPageContext().getBusyContext().applicationBootstrapComplete();
  }

  /**
   * Navigation Helper: Go to page
   */
  goToPage = (path: string): void => {
    if (this.router) {
      this.router.go({ path: path }).catch((err: any) => {
        console.warn("Navigation to " + path + " failed:", err);
      });
    } else if (this.selection && typeof this.selection.path === "function") {
      this.selection.path(path);
    }
    this.sideDrawerOn(false);
    this.closeCashierDropdown();
  };

  /**
   * Cashier Management Actions
   */
  toggleCashierDropdown = (): void => {
    this.isCashierDropdownOpen(!this.isCashierDropdownOpen());
  };

  closeCashierDropdown = (): void => {
    this.isCashierDropdownOpen(false);
  };

  switchCashier = (cashier: CashierProfile): void => {
    this.activeCashier(cashier);
    this.isCashierDropdownOpen(false);
    this.showToast(`Switched active cashier to ${cashier.name}`, "info");
  };

  openAddCashierModal = (): void => {
    this.isCashierDropdownOpen(false);
    this.newCashierName("");
    this.newCashierRole("Cashier");
    this.newCashierAvatar("👤");
    this.isAddCashierModalOpen(true);
  };

  closeAddCashierModal = (): void => {
    this.isAddCashierModalOpen(false);
  };

  addCashier = (): void => {
    const name = this.newCashierName().trim();
    if (!name) {
      this.showToast("Please enter a cashier name", "error");
      return;
    }

    const nextId = "CSH-0" + (this.cashiers().length + 1);
    const newCashier: CashierProfile = {
      id: nextId,
      name,
      role: this.newCashierRole().trim() || "Cashier",
      avatar: this.newCashierAvatar() || "👤"
    };

    this.cashiers.push(newCashier);
    StorageService.set("CASHIERS_LIST", this.cashiers());
    this.activeCashier(newCashier);
    this.closeAddCashierModal();
    this.showToast(`Added and switched to cashier ${name}`, "success");
  };

  removeCashier = (cashier: CashierProfile, event?: Event): void => {
    if (event) event.stopPropagation();

    if (this.cashiers().length <= 1) {
      this.showToast("Cannot remove the only remaining cashier", "error");
      return;
    }

    this.cashiers.remove(cashier);
    StorageService.set("CASHIERS_LIST", this.cashiers());

    if (this.activeCashier().id === cashier.id) {
      const remaining = this.cashiers()[0];
      if (remaining) {
        this.activeCashier(remaining);
      }
    }

    this.showToast(`Removed cashier ${cashier.name}`, "info");
  };

  /**
   * Theme Toggle
   */
  toggleTheme = (): void => {
    const next = this.currentTheme() === "dark" ? "light" : "dark";
    this.currentTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  };

  announcementHandler = (event: any): void => {
    this.message(event.detail.message);
    this.manner(event.detail.manner);
  };

  toggleDrawer = (): void => {
    this.sideDrawerOn(!this.sideDrawerOn());
  };

  openedChangedHandler = (event: CustomEvent): void => {
    if (event.detail.value === false) {
      const drawerToggleButtonElement = document.querySelector("#drawerToggleButton") as HTMLElement;
      if (drawerToggleButtonElement) {
        drawerToggleButtonElement.focus();
      }
    }
  };

  /**
   * Cross-component Action: Add product to cart
   */
  addToCart = (product: Product): void => {
    const existingItem = this.cart().find((item: CartItem) => item.id === product.id);

    if (existingItem) {
      if (existingItem.quantity() < product.stock) {
        existingItem.increment();
        this.showToast(`Updated ${product.name} (Qty: ${existingItem.quantity()})`, "info");
      } else {
        this.showToast(`Stock limit reached for ${product.name}`, "error");
      }
    } else {
      const newItem = new CartItem(product, 1);
      this.cart.push(newItem);
      this.showToast(`Added ${product.name} to order`, "success");
    }
  };

  /**
   * Cross-component Action: Open Checkout Modal
   */
  openCheckoutModal = (orderData: any): void => {
    if (this.checkoutModalInstance && typeof this.checkoutModalInstance.open === "function") {
      this.checkoutModalInstance.open(orderData);
    }
  };

  /**
   * Process Customer from POS Sale:
   * If customer exists: adds order total to totalSpent, increments visits counter +1, awards points, updates tier.
   * If new customer name: automatically registers into Customer Directory CRM with initial visit, spend, and points.
   */
  processCustomerSale = (customerName: string, customerPhone?: string, saleAmount: number = 0): CustomerProfile | null => {
    const cleanName = (customerName || "").trim();
    if (!cleanName || cleanName.toLowerCase() === "walk-in customer" || cleanName.toLowerCase() === "walk-in") {
      return null;
    }

    const customerList = StorageService.get<CustomerProfile[]>("CUSTOMERS_LIST", DEFAULT_CUSTOMERS);
    const cleanPhone = (customerPhone || "").trim();

    // Find existing customer by name (case-insensitive) or phone (if provided)
    const existingIndex = customerList.findIndex(c => {
      const nameMatch = c.name.trim().toLowerCase() === cleanName.toLowerCase();
      const phoneDigits = cleanPhone.replace(/\D/g, "");
      const cPhoneDigits = (c.phone || "").replace(/\D/g, "");
      const phoneMatch = Boolean(phoneDigits && cPhoneDigits && phoneDigits === cPhoneDigits && phoneDigits.length >= 7);
      return nameMatch || phoneMatch;
    });

    const calculateTier = (spend: number): "Platinum" | "Gold" | "Silver" | "Standard" => {
      if (spend >= 700) return "Platinum";
      if (spend >= 350) return "Gold";
      if (spend >= 150) return "Silver";
      return "Standard";
    };

    if (existingIndex >= 0) {
      // Existing customer: update metrics
      const target = customerList[existingIndex];
      target.visits = (target.visits || 0) + 1;
      target.totalSpent = Math.round(((target.totalSpent || 0) + saleAmount) * 100) / 100;
      target.points = (target.points || 0) + Math.round(saleAmount * 10);
      target.tier = calculateTier(target.totalSpent);
      if (cleanPhone && (!target.phone || target.phone === "+1 (555) 000-0000")) {
        target.phone = cleanPhone;
      }
      customerList[existingIndex] = target;
      StorageService.set("CUSTOMERS_LIST", customerList);
      return target;
    } else {
      // New customer: auto-register profile
      const nextNum = customerList.length + 1;
      const nextId = "CUST-" + String(nextNum).padStart(3, "0");
      const avatars = ["👤", "👩‍💼", "👨‍🍳", "👩‍🎓", "👨‍💻", "👩‍🔬", "👨‍🎨", "🧑‍💼"];
      const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
      const email = cleanName.toLowerCase().replace(/\s+/g, ".") + "@customer.pos";
      const totalSpent = Math.round(saleAmount * 100) / 100;

      const newCustomer: CustomerProfile = {
        id: nextId,
        name: cleanName,
        phone: cleanPhone || "+1 (555) 000-0000",
        email: email,
        tier: calculateTier(totalSpent),
        points: Math.round(saleAmount * 10),
        totalSpent: totalSpent,
        visits: 1,
        avatar: randomAvatar
      };

      customerList.unshift(newCustomer);
      StorageService.set("CUSTOMERS_LIST", customerList);
      return newCustomer;
    }
  };

  /**
   * Cross-component Action: Order Completed
   */
  onOrderCompleted = (orderPayload: CompletedOrderPayload): void => {
    // Attach current active cashier name
    orderPayload.cashierName = this.activeCashier().name;

    // Persist transaction to local storage history
    const orderHistory = StorageService.get<CompletedOrderPayload[]>("ORDER_HISTORY", []);
    orderHistory.unshift(orderPayload);
    StorageService.set("ORDER_HISTORY", orderHistory.slice(0, 100));

    // Auto-update or register customer in CRM module
    if (orderPayload.customerName) {
      const processedCustomer = this.processCustomerSale(orderPayload.customerName, orderPayload.customerPhone, orderPayload.grandTotal);
      if (processedCustomer) {
        if (processedCustomer.visits === 1) {
          this.showToast(`🎉 Auto-registered "${processedCustomer.name}" into Customer CRM!`, "success");
        } else {
          this.showToast(`👤 Updated CRM: ${processedCustomer.name} (${processedCustomer.visits} visits, $${processedCustomer.totalSpent.toFixed(2)} total spent)`, "info");
        }
      }
    }

    this.showToast(`Order #${orderPayload.referenceNumber} completed successfully!`, "success");

    this.openReceipt(orderPayload);
  };

  /**
   * Cross-component Action: Open Thermal Receipt Modal
   */
  openReceipt = (orderPayload: CompletedOrderPayload): void => {
    if (this.receiptModalInstance && typeof this.receiptModalInstance.open === "function") {
      this.receiptModalInstance.open(orderPayload);
    }
  };

  /**
   * Cross-component Action: Reset Order after sale
   */
  resetOrder = (): void => {
    this.cart.removeAll();
  };

  /**
   * Cross-component Action: Held Orders Management
   */
  openHeldOrdersModal = (): void => {
    this.isHeldOrdersModalOpen(true);
    this.closeCashierDropdown();
  };

  closeHeldOrdersModal = (): void => {
    this.isHeldOrdersModalOpen(false);
  };

  saveHeldOrder = (orderSnapshot?: Partial<HeldOrder>): void => {
    if (this.cart().length === 0) {
      this.showToast("No items in cart to put on hold", "error");
      return;
    }

    const nextId = "HOLD-" + Math.floor(1000 + Math.random() * 9000);
    const now = new Date();

    const heldItemPayload: HeldOrderItem[] = this.cart().map((item: CartItem) => {
      const raw = item.toJSON();
      return {
        id: raw.id,
        name: raw.name,
        sku: raw.sku,
        price: raw.unitPrice,
        unitPrice: raw.unitPrice,
        quantity: raw.quantity,
        icon: raw.icon || "📦",
        maxStock: raw.maxStock || 99,
        category: raw.category || "Beverages"
      };
    });

    const subTotal = orderSnapshot?.subTotal || heldItemPayload.reduce((sum, it) => sum + (it.price * it.quantity), 0);
    const taxAmount = orderSnapshot?.taxAmount || (subTotal * 0.08);
    const grandTotal = orderSnapshot?.grandTotal || (subTotal + taxAmount);

    const newHeldOrder: HeldOrder = {
      id: nextId,
      timestamp: now.toISOString(),
      formattedTime: this.baseModel.formatDateTime(now),
      customerName: orderSnapshot?.customerName || "Walk-in Customer",
      cashierName: this.activeCashier().name,
      items: heldItemPayload,
      subTotal: subTotal,
      voucherCode: orderSnapshot?.voucherCode || "",
      voucherDiscountPercent: orderSnapshot?.voucherDiscountPercent || 0,
      voucherDiscountAmount: orderSnapshot?.voucherDiscountAmount || 0,
      taxAmount: taxAmount,
      grandTotal: grandTotal
    };

    this.heldOrders.unshift(newHeldOrder);
    StorageService.set("HELD_ORDERS", this.heldOrders());

    // Clear current active cart
    this.cart.removeAll();

    this.showToast(`⏸️ Order #${nextId} placed on hold for ${newHeldOrder.customerName}`, "info");
  };

  resumeHeldOrder = (heldOrder: HeldOrder): void => {
    // Map held items to CartItem instances
    const restoredItems: CartItem[] = heldOrder.items.map((raw: HeldOrderItem) => {
      return new CartItem({
        id: raw.id,
        name: raw.name,
        sku: raw.sku,
        price: raw.unitPrice || raw.price,
        stock: raw.maxStock || 99,
        category: raw.category || "Beverages",
        icon: raw.icon || "📦"
      }, raw.quantity);
    });

    this.cart(restoredItems);

    // Restore customer and voucher discount if cartDrawer instance is present
    if (this.cartDrawerInstance) {
      if (typeof this.cartDrawerInstance.customerName === "function") {
        this.cartDrawerInstance.customerName(heldOrder.customerName || "Walk-in Customer");
      }
      if (heldOrder.voucherCode && typeof this.cartDrawerInstance.voucherCode === "function") {
        this.cartDrawerInstance.voucherCode(heldOrder.voucherCode);
        if (typeof this.cartDrawerInstance.applyVoucher === "function") {
          this.cartDrawerInstance.applyVoucher();
        }
      }
    }

    // Remove from held orders list and save
    this.heldOrders.remove(heldOrder);
    StorageService.set("HELD_ORDERS", this.heldOrders());
    this.isHeldOrdersModalOpen(false);

    // Navigate to register if not already there
    this.goToPage("dashboard");

    this.showToast(`▶ Resumed Order #${heldOrder.id} (${restoredItems.length} items)`, "success");
  };

  deleteHeldOrder = (heldOrder: HeldOrder, event?: Event): void => {
    if (event) event.stopPropagation();

    this.heldOrders.remove(heldOrder);
    StorageService.set("HELD_ORDERS", this.heldOrders());
    this.showToast(`Deleted held order #${heldOrder.id}`, "info");
  };

  clearAllHeldOrders = (): void => {
    if (this.heldOrders().length === 0) return;
    this.heldOrders.removeAll();
    StorageService.set("HELD_ORDERS", []);
    this.showToast("All held orders cleared", "info");
  };

  /**
   * Toast notification helper
   */
  showToast = (message: string, type: "info" | "success" | "error" = "info"): void => {
    const toast: ToastItem = {
      id: Date.now() + Math.random(),
      message,
      type
    };
    this.toasts.push(toast);

    setTimeout(() => {
      this.toasts.remove(toast);
    }, 3500);
  };
}

export default new RootViewModel();
