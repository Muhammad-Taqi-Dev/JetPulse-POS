/**
 * Component: cart-drawer Data Model (CartItem Entity)
 * Domain entity model encapsulating item observables and pureComputeds.
 */
import * as ko from "knockout";
import { Product } from "../../data/mock-products";

export interface SerializedCartItem {
  id: string;
  sku: string;
  name: string;
  category?: string;
  icon?: string;
  unitPrice: number;
  quantity: number;
  discountPercent: number;
  lineTotal: number;
  maxStock?: number;
}

export class CartItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  icon: string;
  unitPrice: number;
  maxStock: number;

  quantity: ko.Observable<number>;
  discountPercent: ko.Observable<number>;

  lineTotal: ko.PureComputed<number>;
  savings: ko.PureComputed<number>;

  constructor(product: Partial<Product> & { id: string; name: string; sku: string; price: number }, initialQty: number = 1) {
    this.id = product.id;
    this.sku = product.sku;
    this.name = product.name;
    this.category = product.category || "Beverages";
    this.icon = product.icon || "📦";
    this.unitPrice = product.price;
    this.maxStock = product.stock || 99;

    this.quantity = ko.observable<number>(Math.max(1, initialQty));
    this.discountPercent = ko.observable<number>(0);

    this.lineTotal = ko.pureComputed(() => {
      const qty = Math.max(1, parseInt(String(this.quantity()), 10) || 1);
      const discount = Math.min(100, Math.max(0, parseFloat(String(this.discountPercent())) || 0));
      const baseAmount = qty * this.unitPrice;
      const discountedAmount = baseAmount * (1 - discount / 100);
      return Math.max(0, discountedAmount);
    });

    this.savings = ko.pureComputed(() => {
      const qty = Math.max(1, parseInt(String(this.quantity()), 10) || 1);
      const baseAmount = qty * this.unitPrice;
      return baseAmount - this.lineTotal();
    });
  }

  increment = (): void => {
    if (this.quantity() < this.maxStock) {
      this.quantity(this.quantity() + 1);
    }
  };

  decrement = (): void => {
    if (this.quantity() > 1) {
      this.quantity(this.quantity() - 1);
    }
  };

  toJSON(): SerializedCartItem {
    return {
      id: this.id,
      sku: this.sku,
      name: this.name,
      category: this.category,
      icon: this.icon,
      unitPrice: this.unitPrice,
      quantity: this.quantity(),
      discountPercent: this.discountPercent(),
      lineTotal: this.lineTotal(),
      maxStock: this.maxStock
    };
  }
}

export default {
  CartItem
};
