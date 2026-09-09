/**
 * Component: product-catalog Data Model (Model Layer)
 * Pure Data Access Layer (DAL) querying BaseService.
 */
import BaseService from "../../framework/base-service";
import mockProducts, { Product } from "../../data/mock-products";

class ProductCatalogModel {
  /**
   * Fetches all products from the service layer
   */
  fetchProducts(): Promise<Product[]> {
    return BaseService.get<Product[]>("/api/v1/products", mockProducts, 150)
      .then((response) => response.data);
  }

  /**
   * Extracts distinct categories from raw products
   */
  extractCategories(products: Product[]): string[] {
    const categories = new Set(products.map(p => p.category));
    return Array.from(categories);
  }
}

export default new ProductCatalogModel();
