/**
 * Central Component Registration for Oracle JET / Knockout
 */
import * as ko from "knockout";

// Import component modules directly
import posHeaderLoader = require("./pos-header/loader");
import productCatalogLoader = require("./product-catalog/loader");
import cartDrawerLoader = require("./cart-drawer/loader");
import checkoutModalLoader = require("./checkout-modal/loader");
import invoiceReceiptLoader = require("./invoice-receipt/loader");

export function registerComponents(): void {
  const components: Record<string, any> = {
    "pos-header": posHeaderLoader,
    "product-catalog": productCatalogLoader,
    "cart-drawer": cartDrawerLoader,
    "checkout-modal": checkoutModalLoader,
    "invoice-receipt": invoiceReceiptLoader
  };

  Object.keys(components).forEach((name) => {
    if (!ko.components.isRegistered(name)) {
      ko.components.register(name, {
        viewModel: components[name].viewModel,
        template: components[name].template
      });
    }
  });
}

export default registerComponents;
