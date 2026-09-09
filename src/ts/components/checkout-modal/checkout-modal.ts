/**
 * Component: checkout-modal ViewModel
 * Multi-tender payment processor simulating cash, card, and QR payments with rich states.
 */
import * as ko from "knockout";
import BaseModel from "../../framework/base-model";
import BaseService from "../../framework/base-service";
import posBundle from "../../resources/nls/pos";
import genericBundle from "../../resources/nls/generic";

export interface CheckoutModalParams {
  rootModel: any;
}

export interface OrderCheckoutData {
  customerName: string;
  subTotal: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
  items: any[];
}

export interface CompletedOrderPayload {
  referenceNumber: string;
  timestamp: string;
  paymentMethod: string;
  customerName: string;
  customerPhone: string;
  subTotal: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
  amountTendered: number;
  changeDue: number;
  cashierName?: string;
  items: any[];
  authCode?: string;
}

class CheckoutModalViewModel {
  rootModel: any;
  baseModel: typeof BaseModel;
  nls: typeof posBundle.root & { Buttons?: typeof genericBundle.root.Buttons };

  isOpen: ko.Observable<boolean>;
  orderData: ko.Observable<OrderCheckoutData | null>;
  selectedPaymentMethod: ko.Observable<"cash" | "card" | "qr">;
  amountTendered: ko.Observable<string>;
  customerPhone: ko.Observable<string>;
  isProcessing: ko.Observable<boolean>;
  processingStep: ko.Observable<string>;
  errorMessage: ko.Observable<string | null>;

  // Card Payment Simulation States
  cardState: ko.Observable<"idle" | "reading" | "authorized">;
  cardAuthCode: ko.Observable<string>;
  cardNumber: ko.Observable<string>;
  cardExpiry: ko.Observable<string>;

  // QR Digital Pay Simulation States
  qrState: ko.Observable<"ready" | "scanning" | "paid">;
  qrTxId: ko.Observable<string>;
  selectedWallet: ko.Observable<string>;

  grandTotal: ko.PureComputed<number>;
  changeDue: ko.PureComputed<number>;
  cashShortage: ko.PureComputed<number>;
  isCashSufficient: ko.PureComputed<boolean>;
  canSubmitPayment: ko.PureComputed<boolean>;
  cardHolder: ko.PureComputed<string>;

  constructor(params: CheckoutModalParams) {
    this.rootModel = params.rootModel;
    this.baseModel = BaseModel;
    this.nls = Object.assign({}, posBundle.root, { Buttons: genericBundle.root.Buttons });

    this.isOpen = ko.observable<boolean>(false);
    this.orderData = ko.observable<OrderCheckoutData | null>(null);
    this.selectedPaymentMethod = ko.observable<"cash" | "card" | "qr">("cash");
    this.amountTendered = ko.observable<string>("");
    this.customerPhone = ko.observable<string>("");
    this.isProcessing = ko.observable<boolean>(false);
    this.processingStep = ko.observable<string>("Authorizing Transaction...");
    this.errorMessage = ko.observable<string | null>(null);

    // Card state
    this.cardState = ko.observable<"idle" | "reading" | "authorized">("idle");
    this.cardAuthCode = ko.observable<string>("");
    this.cardNumber = ko.observable<string>("•••• •••• •••• 4242");
    this.cardExpiry = ko.observable<string>("08/29");

    // QR state
    this.qrState = ko.observable<"ready" | "scanning" | "paid">("ready");
    this.qrTxId = ko.observable<string>("");
    this.selectedWallet = ko.observable<string>("Apple Pay");

    this.grandTotal = ko.pureComputed(() => {
      const data = this.orderData();
      return data ? data.grandTotal : 0;
    });

    this.cardHolder = ko.pureComputed(() => {
      const data = this.orderData();
      if (data && data.customerName && data.customerName !== "Walk-in Customer") {
        return data.customerName.toUpperCase();
      }
      return "VALUED CUSTOMER";
    });

    this.changeDue = ko.pureComputed(() => {
      const tendered = parseFloat(this.amountTendered()) || 0;
      const total = this.grandTotal();
      return Math.max(0, tendered - total);
    });

    this.cashShortage = ko.pureComputed(() => {
      const tendered = parseFloat(this.amountTendered()) || 0;
      const total = this.grandTotal();
      return Math.max(0, total - tendered);
    });

    this.isCashSufficient = ko.pureComputed(() => {
      const tendered = parseFloat(this.amountTendered()) || 0;
      return tendered >= this.grandTotal() && this.grandTotal() > 0;
    });

    this.canSubmitPayment = ko.pureComputed(() => {
      if (this.isProcessing()) return false;
      if (this.grandTotal() <= 0) return false;

      if (this.selectedPaymentMethod() === "cash") {
        return this.isCashSufficient();
      }

      return true;
    });

    if (this.rootModel) {
      this.rootModel.checkoutModalInstance = this;
    }
  }

  setPaymentMethod = (method: "cash" | "card" | "qr"): void => {
    this.selectedPaymentMethod(method);
    this.errorMessage(null);
  };

  setQuickCash = (amount: number | "exact"): void => {
    if (amount === "exact") {
      this.amountTendered(this.grandTotal().toFixed(2));
    } else {
      this.amountTendered(Number(amount).toFixed(2));
    }
  };

  addQuickCash = (increment: number): void => {
    const current = parseFloat(this.amountTendered()) || 0;
    const next = current + increment;
    this.amountTendered(next.toFixed(2));
  };

  simulateCardTap = (): void => {
    if (this.cardState() === "reading") return;
    this.cardState("reading");
    this.errorMessage(null);

    setTimeout(() => {
      const auth = "APX-" + Math.floor(100000 + Math.random() * 900000);
      this.cardAuthCode(auth);
      this.cardState("authorized");
    }, 850);
  };

  resetCardState = (): void => {
    this.cardState("idle");
    this.cardAuthCode("");
  };

  simulateQrScan = (): void => {
    if (this.qrState() === "scanning") return;
    this.qrState("scanning");
    this.errorMessage(null);

    setTimeout(() => {
      const tx = "QR-" + Math.floor(10000 + Math.random() * 90000);
      this.qrTxId(tx);
      this.qrState("paid");
    }, 750);
  };

  resetQrState = (): void => {
    this.qrState("ready");
    this.qrTxId("");
  };

  open = (data: OrderCheckoutData): void => {
    this.orderData(data);
    this.selectedPaymentMethod("cash");
    this.amountTendered(data.grandTotal.toFixed(2));
    this.customerPhone("");
    this.errorMessage(null);
    this.isProcessing(false);
    this.cardState("idle");
    this.cardAuthCode("");
    this.qrState("ready");
    this.qrTxId("");
    this.isOpen(true);
  };

  close = (): void => {
    if (this.isProcessing()) return;
    this.isOpen(false);
  };

  completeTransaction = (): void => {
    if (!this.canSubmitPayment()) return;

    const data = this.orderData();
    if (!data) return;

    this.isProcessing(true);
    this.errorMessage(null);
    this.processingStep("Authorizing & Generating Invoice...");

    const method = this.selectedPaymentMethod();
    let authCode = "";

    if (method === "card") {
      authCode = this.cardAuthCode() || ("APX-" + Math.floor(100000 + Math.random() * 900000));
    } else if (method === "qr") {
      authCode = this.qrTxId() || ("QR-" + Math.floor(10000 + Math.random() * 90000));
    }

    const payload: CompletedOrderPayload = {
      referenceNumber: this.baseModel.generateReference("INV-"),
      timestamp: new Date().toISOString(),
      paymentMethod: method,
      customerName: data.customerName,
      customerPhone: this.customerPhone(),
      subTotal: data.subTotal,
      discountAmount: data.discountAmount,
      taxAmount: data.taxAmount,
      grandTotal: this.grandTotal(),
      amountTendered: method === "cash" ? (parseFloat(this.amountTendered()) || this.grandTotal()) : this.grandTotal(),
      changeDue: method === "cash" ? this.changeDue() : 0,
      items: data.items,
      authCode
    };

    BaseService.post("/api/v1/orders", payload, { success: true }, 500)
      .then(() => {
        this.isProcessing(false);
        this.isOpen(false);

        if (this.rootModel && typeof this.rootModel.onOrderCompleted === "function") {
          this.rootModel.onOrderCompleted(payload);
        }
      })
      .catch((err) => {
        this.isProcessing(false);
        this.errorMessage(err.message || this.nls.Errors.GenericError);
      });
  };
}

export default CheckoutModalViewModel;
