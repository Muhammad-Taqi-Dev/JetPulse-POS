/**
 * @license
 * Copyright (c) 2014, 2026, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
import * as ko from "knockout";
import * as AccUtils from "../accUtils";
import StorageService from "../framework/storage-service";
import rootViewModel from "../appController";
import mockProducts from "../data/mock-products";

class AboutViewModel {
  rootModel: typeof rootViewModel;

  // System Stats
  totalProducts: ko.Observable<number>;
  totalOrders: ko.Observable<number>;
  totalCustomers: ko.Observable<number>;
  totalCashiers: ko.Observable<number>;
  systemStatus: ko.Observable<string>;

  constructor() {
    this.rootModel = rootViewModel;

    const orders = StorageService.get<any[]>("ORDER_HISTORY", []);
    const customers = StorageService.get<any[]>("CUSTOMERS_LIST", []);
    const cashiers = StorageService.get<any[]>("CASHIERS_LIST", []);

    this.totalProducts = ko.observable(mockProducts.length);
    this.totalOrders = ko.observable(orders.length);
    this.totalCustomers = ko.observable(customers.length);
    this.totalCashiers = ko.observable(cashiers.length || 3);
    this.systemStatus = ko.observable("Operational & Ready");
  }

  connected(): void {
    AccUtils.announce("About POS page loaded.");
    document.title = "About - JetPulse POS";

    // Refresh stats upon connecting
    const orders = StorageService.get<any[]>("ORDER_HISTORY", []);
    const customers = StorageService.get<any[]>("CUSTOMERS_LIST", []);
    const cashiers = StorageService.get<any[]>("CASHIERS_LIST", []);

    this.totalOrders(orders.length);
    this.totalCustomers(customers.length);
    this.totalCashiers(cashiers.length || 3);
  }

  goToPOS = (): void => {
    this.rootModel.goToPage("dashboard");
  };

  goToHistory = (): void => {
    this.rootModel.goToPage("incidents");
  };

  goToCustomers = (): void => {
    this.rootModel.goToPage("customers");
  };

  disconnected(): void {}
  transitionCompleted(): void {}
}

export = AboutViewModel;