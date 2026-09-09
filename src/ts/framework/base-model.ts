/**
 * Framework: BaseModel Utility Helper
 * Encapsulates common formatters, date/time helpers, and unique ID generation.
 */
class BaseModel {
  /**
   * Formats a number into localized currency format (e.g. $1,250.00)
   */
  formatCurrency(value: number | (() => number), currencyCode: string = "USD"): string {
    const num = typeof value === "function" ? value() : value;
    const parsed = parseFloat(String(num)) || 0;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(parsed);
  }

  /**
   * Formats a number with thousands separators (e.g. 1,000)
   */
  formatNumber(value: number | (() => number)): string {
    const num = typeof value === "function" ? value() : value;
    const parsed = parseFloat(String(num)) || 0;
    return new Intl.NumberFormat("en-US").format(parsed);
  }

  /**
   * Formats a date object or timestamp to readable string (e.g. "Sep 9, 2026, 11:45 AM")
   */
  formatDateTime(date?: Date | string | number): string {
    const d = date ? new Date(date) : new Date();
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  }

  /**
   * Generates a unique transaction / invoice reference ID
   */
  generateReference(prefix: string = "INV-"): string {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${dateStr}-${randomSuffix}`;
  }

  /**
   * String template replacer utility (e.g., format("Hello {0}", ["World"]))
   */
  format(str: string, params: (string | number)[]): string {
    if (!str) return "";
    return str.replace(/\{(\d+)\}/g, (_match, index) => {
      const idx = parseInt(index, 10);
      return typeof params[idx] !== "undefined" ? String(params[idx]) : _match;
    });
  }
}

export default new BaseModel();
