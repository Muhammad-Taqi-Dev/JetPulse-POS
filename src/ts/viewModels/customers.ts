/**
 * @license
 * Copyright (c) 2014, 2026, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
import * as ko from "knockout";
import * as AccUtils from "../accUtils";
import BaseModel from "../framework/base-model";
import StorageService from "../framework/storage-service";
import rootViewModel, { CustomerProfile, DEFAULT_CUSTOMERS } from "../appController";

class CustomersViewModel {
  baseModel: typeof BaseModel;
  rootModel: typeof rootViewModel;

  customers: ko.ObservableArray<CustomerProfile>;
  searchQuery: ko.Observable<string>;
  filteredCustomers: ko.PureComputed<CustomerProfile[]>;

  // KPI Metrics
  totalCustomersCount: ko.PureComputed<number>;
  totalPointsAwarded: ko.PureComputed<number>;
  totalCustomersSpend: ko.PureComputed<number>;

  // Add Customer Modal State
  isAddCustomerModalOpen: ko.Observable<boolean>;
  newCustomerName: ko.Observable<string>;
  newCustomerPhone: ko.Observable<string>;
  newCustomerEmail: ko.Observable<string>;
  newCustomerTier: ko.Observable<"Platinum" | "Gold" | "Silver" | "Standard">;
  newCustomerAvatar: ko.Observable<string>;

  constructor() {
    this.baseModel = BaseModel;
    this.rootModel = rootViewModel;

    const saved = StorageService.get<CustomerProfile[]>("CUSTOMERS_LIST", DEFAULT_CUSTOMERS);
    this.customers = ko.observableArray<CustomerProfile>(saved);

    this.searchQuery = ko.observable<string>("");

    // Modal state
    this.isAddCustomerModalOpen = ko.observable<boolean>(false);
    this.newCustomerName = ko.observable<string>("");
    this.newCustomerPhone = ko.observable<string>("");
    this.newCustomerEmail = ko.observable<string>("");
    this.newCustomerTier = ko.observable<"Platinum" | "Gold" | "Silver" | "Standard">("Standard");
    this.newCustomerAvatar = ko.observable<string>("👤");

    this.filteredCustomers = ko.pureComputed(() => {
      const q = this.searchQuery().trim().toLowerCase();
      if (!q) return this.customers();
      return this.customers().filter((c) => {
        return (
          c.name.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.tier.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
        );
      });
    });

    this.totalCustomersCount = ko.pureComputed(() => {
      return this.customers().length;
    });

    this.totalPointsAwarded = ko.pureComputed(() => {
      return this.customers().reduce((sum, c) => sum + (c.points || 0), 0);
    });

    this.totalCustomersSpend = ko.pureComputed(() => {
      return this.customers().reduce((sum, c) => sum + (c.totalSpent || 0), 0);
    });
  }

  loadCustomers = (): void => {
    const list = StorageService.get<CustomerProfile[]>("CUSTOMERS_LIST", DEFAULT_CUSTOMERS);
    this.customers(list);
  };

  addPoints = (customer: CustomerProfile): void => {
    const updated = this.customers().map((c) => {
      if (c.id === customer.id) {
        return Object.assign({}, c, { points: (c.points || 0) + 50 });
      }
      return c;
    });
    this.customers(updated);
    StorageService.set("CUSTOMERS_LIST", updated);
    this.rootModel.showToast(`⭐ Awarded +50 loyalty points to ${customer.name}`, "success");
  };

  deleteCustomer = (customer: CustomerProfile, event?: Event): void => {
    if (event) event.stopPropagation();

    this.customers.remove(customer);
    StorageService.set("CUSTOMERS_LIST", this.customers());
    this.rootModel.showToast(`🗑️ Removed customer profile for ${customer.name}`, "info");
  };

  openAddCustomerModal = (): void => {
    this.newCustomerName("");
    this.newCustomerPhone("");
    this.newCustomerEmail("");
    this.newCustomerTier("Standard");
    this.newCustomerAvatar("👤");
    this.isAddCustomerModalOpen(true);
  };

  closeAddCustomerModal = (): void => {
    this.isAddCustomerModalOpen(false);
  };

  saveNewCustomer = (): void => {
    const name = this.newCustomerName().trim();
    if (!name) {
      this.rootModel.showToast("Please enter a customer name", "error");
      return;
    }

    const nextNum = this.customers().length + 1;
    const nextId = "CUST-" + String(nextNum).padStart(3, "0");
    const email = this.newCustomerEmail().trim() || (name.toLowerCase().replace(/\s+/g, ".") + "@customer.pos");
    const phone = this.newCustomerPhone().trim() || "+1 (555) 000-0000";

    const newCust: CustomerProfile = {
      id: nextId,
      name,
      phone,
      email,
      tier: this.newCustomerTier(),
      points: 100,
      totalSpent: 0,
      visits: 0,
      avatar: this.newCustomerAvatar() || "👤"
    };

    this.customers.unshift(newCust);
    StorageService.set("CUSTOMERS_LIST", this.customers());
    this.closeAddCustomerModal();
    this.rootModel.showToast(`🎉 Created new customer profile for ${name}`, "success");
  };

  connected(): void {
    AccUtils.announce("Customers & Loyalty page loaded.");
    document.title = "Customers & Loyalty - JetPulse POS";
    this.loadCustomers();
  }

  disconnected(): void {}
  transitionCompleted(): void {}
}

export = CustomersViewModel;
