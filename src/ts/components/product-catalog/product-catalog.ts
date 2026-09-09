/**
 * Component: product-catalog ViewModel
 * Manages category filters, live searching, and cart delegation.
 */
import * as ko from "knockout";
import BaseModel from "../../framework/base-model";
import posBundle from "../../resources/nls/pos";
import CatalogModel from "./model";
import { Product } from "../../data/mock-products";

export interface ProductCatalogParams {
  rootModel: any;
}

class ProductCatalogViewModel {
  rootModel: any;
  baseModel: typeof BaseModel;
  nls: typeof posBundle.root;

  rawProducts: ko.ObservableArray<Product>;
  categories: ko.ObservableArray<string>;
  selectedCategory: ko.Observable<string>;
  searchQuery: ko.Observable<string>;
  isLoading: ko.Observable<boolean>;
  errorMessage: ko.Observable<string | null>;

  filteredProducts: ko.PureComputed<Product[]>;
  itemCountText: ko.PureComputed<string>;

  constructor(params: ProductCatalogParams) {
    this.rootModel = params.rootModel;
    this.baseModel = BaseModel;
    this.nls = posBundle.root;

    this.rawProducts = ko.observableArray<Product>([]);
    this.categories = ko.observableArray<string>(["All"]);
    this.selectedCategory = ko.observable<string>("All");
    this.searchQuery = ko.observable<string>("");
    this.isLoading = ko.observable<boolean>(true);
    this.errorMessage = ko.observable<string | null>(null);

    this.filteredProducts = ko.pureComputed(() => {
      const query = this.searchQuery().trim().toLowerCase();
      const activeCategory = this.selectedCategory();
      const list = this.rawProducts();

      return list.filter((item) => {
        const matchesCategory = activeCategory === "All" || item.category === activeCategory;
        const matchesQuery = !query ||
          item.name.toLowerCase().includes(query) ||
          item.sku.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query);

        return matchesCategory && matchesQuery;
      });
    });

    this.itemCountText = ko.pureComputed(() => {
      const count = this.filteredProducts().length;
      return this.baseModel.format(this.nls.Catalog.ItemCount, [count]);
    });

    this.init();
  }

  selectCategory = (category: string): void => {
    this.selectedCategory(category);
  };

  clearSearch = (): void => {
    this.searchQuery("");
  };

  addToCart = (product: Product): void => {
    if (product.stock <= 0) return;
    if (this.rootModel && typeof this.rootModel.addToCart === "function") {
      this.rootModel.addToCart(product);
    }
  };

  init = (): void => {
    this.isLoading(true);
    this.errorMessage(null);

    CatalogModel.fetchProducts()
      .then((data) => {
        this.rawProducts(data);
        const distinctCats = CatalogModel.extractCategories(data);
        this.categories(["All", ...distinctCats]);
        this.isLoading(false);
      })
      .catch((err) => {
        this.isLoading(false);
        this.errorMessage(err.message || this.nls.Errors.GenericError);
      });
  };
}

export default ProductCatalogViewModel;
