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
import rootViewModel from "../appController";
import { CompletedOrderPayload } from "../components/checkout-modal/checkout-modal";

class IncidentsViewModel {
  baseModel: typeof BaseModel;
  rootModel: typeof rootViewModel;

  orders: ko.ObservableArray<CompletedOrderPayload>;
  searchQuery: ko.Observable<string>;
  filteredOrders: ko.PureComputed<CompletedOrderPayload[]>;

  totalSales: ko.PureComputed<number>;
  totalOrdersCount: ko.PureComputed<number>;
  avgOrderValue: ko.PureComputed<number>;

  constructor() {
    this.baseModel = BaseModel;
    this.rootModel = rootViewModel;

    this.orders = ko.observableArray<CompletedOrderPayload>([]);
    this.searchQuery = ko.observable<string>("");

    this.filteredOrders = ko.pureComputed(() => {
      const q = this.searchQuery().trim().toLowerCase();
      const list = this.orders();
      if (!q) return list;
      return list.filter((order) => {
        return (
          order.referenceNumber.toLowerCase().includes(q) ||
          (order.customerName && order.customerName.toLowerCase().includes(q)) ||
          order.paymentMethod.toLowerCase().includes(q)
        );
      });
    });

    this.totalSales = ko.pureComputed(() => {
      return this.orders().reduce((sum, o) => sum + (o.grandTotal || 0), 0);
    });

    this.totalOrdersCount = ko.pureComputed(() => {
      return this.orders().length;
    });

    this.avgOrderValue = ko.pureComputed(() => {
      const count = this.totalOrdersCount();
      if (count === 0) return 0;
      return this.totalSales() / count;
    });
  }

  loadOrders = (): void => {
    const history = StorageService.get<CompletedOrderPayload[]>("ORDER_HISTORY", []);
    this.orders(history);
  };

  reprintReceipt = (order: CompletedOrderPayload): void => {
    if (this.rootModel) {
      if (typeof this.rootModel.openReceipt === "function") {
        this.rootModel.openReceipt(order);
      } else if (this.rootModel.receiptModalInstance && typeof this.rootModel.receiptModalInstance.open === "function") {
        this.rootModel.receiptModalInstance.open(order);
      }
    }
  };

  clearHistory = (): void => {
    StorageService.remove("ORDER_HISTORY");
    this.orders.removeAll();
    this.rootModel.showToast("Order transaction history cleared", "info");
  };

  connected(): void {
    AccUtils.announce("Order History page loaded.");
    document.title = "Order History - JetPulse POS";
    this.loadOrders();
  }

  disconnected(): void {}
  transitionCompleted(): void {}
}

export = IncidentsViewModel;
