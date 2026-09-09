/**
 * Component: pos-header ViewModel
 * Manages live time clock, theme switching, and reactive cart counters.
 */
import * as ko from "knockout";
import BaseModel from "../../framework/base-model";
import posBundle from "../../resources/nls/pos";

export interface PosHeaderParams {
  rootModel: any;
}

class PosHeaderViewModel {
  rootModel: any;
  baseModel: typeof BaseModel;
  nls: typeof posBundle.root;
  currentTime: ko.Observable<string>;
  currentTheme: ko.Observable<string>;
  cartItemCount: ko.PureComputed<number>;
  private timerId: any;

  constructor(params: PosHeaderParams) {
    this.rootModel = params.rootModel;
    this.baseModel = BaseModel;
    this.nls = posBundle.root;

    this.currentTime = ko.observable(this.baseModel.formatDateTime(new Date()));
    this.currentTheme = ko.observable(document.documentElement.getAttribute("data-theme") || "dark");

    this.cartItemCount = ko.pureComputed(() => {
      if (!this.rootModel || !this.rootModel.cart) return 0;
      return this.rootModel.cart().reduce((total: number, item: any) => {
        return total + (item.quantity ? item.quantity() : 0);
      }, 0);
    });

    this.timerId = setInterval(() => {
      this.currentTime(this.baseModel.formatDateTime(new Date()));
    }, 1000);
  }

  toggleTheme = (): void => {
    const next = this.currentTheme() === "dark" ? "light" : "dark";
    this.currentTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  };

  dispose = (): void => {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  };
}

export default PosHeaderViewModel;
