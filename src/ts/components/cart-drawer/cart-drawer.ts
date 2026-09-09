/**
 * Component: cart-drawer ViewModel
 * Manages core POS financial calculation tree, promo vouchers, and checkout dispatch.
 */
import * as ko from "knockout";
import BaseModel from "../../framework/base-model";
import StorageService from "../../framework/storage-service";
import { CustomerProfile, DEFAULT_CUSTOMERS } from "../../appController";
import posBundle from "../../resources/nls/pos";
import { CartItem } from "./model";

export interface CartDrawerParams {
  rootModel: any;
}

export interface VoucherFeedback {
  type: "success" | "error";
  text: string;
}

class CartDrawerViewModel {
  rootModel: any;
  baseModel: typeof BaseModel;
  nls: typeof posBundle.root;

  cart: ko.ObservableArray<CartItem>;
  customerName: ko.Observable<string>;
  voucherCode: ko.Observable<string>;
  voucherDiscountPercent: ko.Observable<number>;
  voucherFeedback: ko.Observable<VoucherFeedback | null>;
  taxRate: ko.Observable<number>;
  registeredCustomers: ko.PureComputed<CustomerProfile[]>;

  subTotal: ko.PureComputed<number>;
  voucherDiscountAmount: ko.PureComputed<number>;
  taxableAmount: ko.PureComputed<number>;
  taxAmount: ko.PureComputed<number>;
  grandTotal: ko.PureComputed<number>;
  totalQuantity: ko.PureComputed<number>;

  private static PROMO_CODES: Record<string, number> = {
    "SAVE10": 10,
    "VIP20": 20,
    "FLASH30": 30
  };

  constructor(params: CartDrawerParams) {
    this.rootModel = params.rootModel;
    this.baseModel = BaseModel;
    this.nls = posBundle.root;

    this.cart = this.rootModel ? this.rootModel.cart : ko.observableArray<CartItem>([]);
    this.customerName = ko.observable<string>("Walk-in Customer");
    this.voucherCode = ko.observable<string>("");
    this.voucherDiscountPercent = ko.observable<number>(0);
    this.voucherFeedback = ko.observable<VoucherFeedback | null>(null);
    this.taxRate = ko.observable<number>(0.08); // 8% VAT

    this.registeredCustomers = ko.pureComputed(() => {
      return StorageService.get<CustomerProfile[]>("CUSTOMERS_LIST", DEFAULT_CUSTOMERS);
    });

    this.subTotal = ko.pureComputed(() => {
      const items = this.cart();
      return items.reduce((sum: number, item: CartItem) => {
        return sum + item.lineTotal();
      }, 0);
    });

    this.voucherDiscountAmount = ko.pureComputed(() => {
      const percent = this.voucherDiscountPercent();
      if (percent <= 0) return 0;
      return this.subTotal() * (percent / 100);
    });

    this.taxableAmount = ko.pureComputed(() => {
      return Math.max(0, this.subTotal() - this.voucherDiscountAmount());
    });

    this.taxAmount = ko.pureComputed(() => {
      return this.taxableAmount() * this.taxRate();
    });

    this.grandTotal = ko.pureComputed(() => {
      return this.taxableAmount() + this.taxAmount();
    });

    this.totalQuantity = ko.pureComputed(() => {
      return this.cart().reduce((sum: number, item: CartItem) => {
        return sum + item.quantity();
      }, 0);
    });

    if (this.rootModel) {
      this.rootModel.cartDrawerInstance = this;
    }
  }

  openHeldOrdersModal = (): void => {
    if (this.rootModel && typeof this.rootModel.openHeldOrdersModal === "function") {
      this.rootModel.openHeldOrdersModal();
    }
  };

  applyVoucher = (): void => {
    const code = this.voucherCode().trim().toUpperCase();
    if (!code) {
      this.voucherDiscountPercent(0);
      this.voucherFeedback(null);
      return;
    }

    if (CartDrawerViewModel.PROMO_CODES[code]) {
      const discount = CartDrawerViewModel.PROMO_CODES[code];
      this.voucherDiscountPercent(discount);
      this.voucherFeedback({
        type: "success",
        text: this.baseModel.format(this.nls.Cart.VoucherApplied, [discount])
      });
    } else {
      this.voucherDiscountPercent(0);
      this.voucherFeedback({
        type: "error",
        text: this.nls.Cart.InvalidVoucher
      });
    }
  };

  removeVoucher = (): void => {
    this.voucherCode("");
    this.voucherDiscountPercent(0);
    this.voucherFeedback(null);
  };

  removeItem = (item: CartItem): void => {
    this.cart.remove(item);
  };

  clearCart = (): void => {
    if (this.cart().length === 0) return;
    this.cart.removeAll();
    this.removeVoucher();
  };

  holdOrder = (): void => {
    if (this.cart().length === 0) return;
    if (this.rootModel && typeof this.rootModel.saveHeldOrder === "function") {
      this.rootModel.saveHeldOrder({
        customerName: this.customerName(),
        voucherCode: this.voucherCode(),
        voucherDiscountPercent: this.voucherDiscountPercent(),
        voucherDiscountAmount: this.voucherDiscountAmount(),
        subTotal: this.subTotal(),
        taxAmount: this.taxAmount(),
        grandTotal: this.grandTotal()
      });
      this.customerName("Walk-in Customer");
      this.removeVoucher();
    }
  };

  proceedToCheckout = (): void => {
    if (this.cart().length === 0) return;
    if (this.rootModel && typeof this.rootModel.openCheckoutModal === "function") {
      this.rootModel.openCheckoutModal({
        customerName: this.customerName(),
        subTotal: this.subTotal(),
        discountAmount: this.voucherDiscountAmount(),
        taxAmount: this.taxAmount(),
        grandTotal: this.grandTotal(),
        items: this.cart().map((item: CartItem) => item.toJSON())
      });
    }
  };
}

export default CartDrawerViewModel;
