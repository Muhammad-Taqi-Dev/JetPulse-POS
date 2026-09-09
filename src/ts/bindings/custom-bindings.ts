/**
 * Knockout Custom Binding Handlers
 * Registers custom declarative binding handlers for enterprise formatting, animations, and badges.
 */
import * as ko from "knockout";
import BaseModel from "../framework/base-model";

/**
 * 1. Currency Binding Handler
 * Usage: data-bind="currency: lineTotal" or data-bind="currency: { value: lineTotal, code: 'USD' }"
 */
(ko.bindingHandlers as any).currency = {
  update: function (element: HTMLElement, valueAccessor: () => any): void {
    const value = valueAccessor();
    let amount: number = 0;
    let code: string = "USD";

    if (value && typeof value === "object" && !(value instanceof Function)) {
      amount = ko.unwrap(value.value);
      code = ko.unwrap(value.code) || "USD";
    } else {
      amount = ko.unwrap(value);
    }

    element.textContent = BaseModel.formatCurrency(amount, code);
  }
};

/**
 * 2. Pulse On Change Binding Handler
 * Flashes a subtle highlight animation whenever the observable value updates.
 */
(ko.bindingHandlers as any).pulseOnChange = {
  update: function (element: HTMLElement, valueAccessor: () => any): void {
    // Read observable to establish dependency
    ko.unwrap(valueAccessor());

    element.classList.remove("pulse-highlight");
    // Force reflow
    void element.offsetWidth;
    element.classList.add("pulse-highlight");
  }
};

/**
 * 3. Stock Badge Binding Handler
 * Automatically applies CSS class and formatted text based on numeric stock count.
 */
(ko.bindingHandlers as any).stockBadge = {
  update: function (element: HTMLElement, valueAccessor: () => any): void {
    const stock = ko.unwrap(valueAccessor());
    element.classList.remove("badge-in-stock", "badge-low-stock", "badge-out-of-stock");

    if (stock > 10) {
      element.className += " badge badge-in-stock";
      element.textContent = "In Stock (" + stock + ")";
    } else if (stock > 0) {
      element.className += " badge badge-low-stock";
      element.textContent = "Low Stock (" + stock + ")";
    } else {
      element.className += " badge badge-out-of-stock";
      element.textContent = "Out of Stock";
    }
  }
};

/**
 * 4. Numeric Input Filter Binding Handler
 * Enforces numeric-only typing on input fields.
 */
(ko.bindingHandlers as any).numericOnly = {
  init: function (element: HTMLInputElement): void {
    element.addEventListener("input", function () {
      const clean = element.value.replace(/[^0-9.]/g, "");
      if (element.value !== clean) {
        element.value = clean;
        element.dispatchEvent(new Event("change"));
      }
    });
  }
};

export default ko.bindingHandlers;
