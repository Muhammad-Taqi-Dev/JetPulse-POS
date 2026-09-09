/**
 * Localization (NLS): POS & Invoice Dictionary
 */

const posBundle = {
  root: {
    Header: {
      AppName: "JetPulse POS",
      TerminalId: "Terminal #04",
      Cashier: "Cashier: Muhammad Taqi",
      Branch: "Main Downtown Branch",
      ActiveOrders: "Active Orders: "
    },
    Catalog: {
      Title: "Product Catalog",
      SearchPlaceholder: "Search by item name, SKU, or category...",
      AllCategories: "All Categories",
      ItemCount: "{0} products available",
      AddToCart: "Add to Order",
      Price: "Price: ",
      SKU: "SKU: ",
      Stock: "Stock: "
    },
    Cart: {
      Title: "Order Register",
      EmptyCartMessage: "No items in current order.",
      EmptyCartSubMessage: "Select products from the catalog to begin.",
      Item: "Item",
      Qty: "Qty",
      Price: "Price",
      Total: "Total",
      Subtotal: "Subtotal",
      TaxVAT: "VAT (Tax 8%):",
      Discount: "Discount:",
      GrandTotal: "Grand Total:",
      VoucherPlaceholder: "Coupon (e.g. SAVE10, VIP20)",
      ApplyVoucher: "Apply",
      VoucherApplied: "Discount applied ({0}%)",
      InvalidVoucher: "Invalid promo code"
    },
    Checkout: {
      Title: "Process Payment",
      Subtitle: "Select tender method and confirm payment",
      PaymentMethod: "Payment Method",
      Cash: "Cash",
      CreditCard: "Credit / Debit Card",
      QRPay: "QR Digital Pay",
      AmountPayable: "Total Due:",
      AmountTendered: "Amount Received:",
      ChangeDue: "Change to Return:",
      QuickCash: "Quick Cash:",
      CustomerName: "Customer Name:",
      CustomerPhone: "Customer Phone / Loyalty ID:",
      CompletePayment: "Complete Sale",
      PaymentSuccess: "Payment Processed Successfully!"
    },
    Receipt: {
      InvoiceTitle: "TAX INVOICE / RECEIPT",
      StoreName: "Apex Retailers & Cafe Ltd.",
      StoreAddress: "100 Financial District Blvd, Suite 400",
      Phone: "Tel: +1 (800) 555-0199",
      TaxId: "Tax ID: US-98472910-X",
      OrderRef: "Order Ref:",
      Date: "Date/Time:",
      Cashier: "Cashier:",
      PaymentType: "Payment Type:",
      ThankYou: "Thank you for your business!",
      ReturnPolicy: "Goods once sold can be exchanged within 7 days with original receipt."
    },
    Errors: {
      GenericError: "An unexpected error occurred. Please try again."
    }
  }
};

export default posBundle;
