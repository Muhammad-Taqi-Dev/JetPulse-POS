/**
 * Component: invoice-receipt ViewModel
 * Thermal receipt generator with formatted store details and print handlers.
 */
import * as ko from "knockout";
import BaseModel from "../../framework/base-model";
import posBundle from "../../resources/nls/pos";
import { CompletedOrderPayload } from "../checkout-modal/checkout-modal";

export interface InvoiceReceiptParams {
  rootModel: any;
}

class InvoiceReceiptViewModel {
  rootModel: any;
  baseModel: typeof BaseModel;
  nls: typeof posBundle.root;

  isOpen: ko.Observable<boolean>;
  receipt: ko.Observable<CompletedOrderPayload | null>;

  constructor(params: InvoiceReceiptParams) {
    this.rootModel = params.rootModel;
    this.baseModel = BaseModel;
    this.nls = posBundle.root;

    this.isOpen = ko.observable<boolean>(false);
    this.receipt = ko.observable<CompletedOrderPayload | null>(null);

    if (this.rootModel) {
      this.rootModel.receiptModalInstance = this;
    }
  }

  open = (orderPayload: CompletedOrderPayload): void => {
    this.receipt(orderPayload);
    this.isOpen(true);
  };

  close = (): void => {
    this.isOpen(false);
  };

  print = (): void => {
    window.print();
  };

  startNewSale = (): void => {
    this.close();
    if (this.rootModel) {
      if (typeof this.rootModel.resetOrder === "function") {
        this.rootModel.resetOrder();
      }
      if (typeof this.rootModel.goToPage === "function") {
        this.rootModel.goToPage("dashboard");
      }
    }
  };
}

export default InvoiceReceiptViewModel;
