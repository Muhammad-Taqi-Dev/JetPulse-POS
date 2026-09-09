/**
 * Data: POS Product Catalog Mock Dataset
 */

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  icon: string;
  description: string;
}

const mockProducts: Product[] = [
  // Beverages
  {
    id: "PRD-001",
    sku: "BEV-ESP-01",
    name: "Caramel Macchiato",
    category: "Beverages",
    price: 5.50,
    stock: 45,
    icon: "☕",
    description: "Freshly steamed milk with vanilla-flavored syrup, marked with espresso and caramel drizzle."
  },
  {
    id: "PRD-002",
    sku: "BEV-MAT-02",
    name: "Iced Matcha Green Tea Latte",
    category: "Beverages",
    price: 6.25,
    stock: 28,
    icon: "🍵",
    description: "Smooth and creamy matcha sweetened just right and served with milk over ice."
  },
  {
    id: "PRD-003",
    sku: "BEV-CLD-03",
    name: "Nitro Cold Brew Coffee",
    category: "Beverages",
    price: 4.95,
    stock: 35,
    icon: "🧊",
    description: "Slow-steeped cold brew infused with nitrogen for a velvety, creamy cascade."
  },
  {
    id: "PRD-004",
    sku: "BEV-SMO-04",
    name: "Berry Acai Smoothie",
    category: "Beverages",
    price: 7.00,
    stock: 8,
    icon: "🥤",
    description: "Organic acai berries blended with bananas, blueberries, and almond milk."
  },

  // Bakery / Mains
  {
    id: "PRD-005",
    sku: "BAK-CRN-05",
    name: "Artisan Butter Croissant",
    category: "Bakery",
    price: 3.75,
    stock: 18,
    icon: "🥐",
    description: "Flaky, buttery French golden croissant baked fresh every morning."
  },
  {
    id: "PRD-006",
    sku: "BAK-BAG-06",
    name: "Smoked Salmon & Cream Bagel",
    category: "Bakery",
    price: 9.50,
    stock: 14,
    icon: "🥯",
    description: "Toasted everything bagel with cream cheese, capers, red onions, and Norwegian salmon."
  },
  {
    id: "PRD-007",
    sku: "MAI-SAN-07",
    name: "Tuscan Grilled Chicken Panini",
    category: "Mains",
    price: 11.25,
    stock: 22,
    icon: "🥪",
    description: "Herb-marinated chicken breast, fresh mozzarella, sun-dried tomatoes, and basil pesto."
  },
  {
    id: "PRD-008",
    sku: "MAI-SLD-08",
    name: "Avocado Quinoa Power Bowl",
    category: "Mains",
    price: 12.80,
    stock: 5,
    icon: "🥗",
    description: "Organic tricolor quinoa, Hass avocado, chickpeas, cherry tomatoes, and tahini dressing."
  },

  // Desserts
  {
    id: "PRD-009",
    sku: "DES-CHE-09",
    name: "New York Classic Cheesecake",
    category: "Desserts",
    price: 6.75,
    stock: 12,
    icon: "🍰",
    description: "Rich and creamy classic cheesecake with a graham cracker crust and raspberry coulis."
  },
  {
    id: "PRD-010",
    sku: "DES-DON-10",
    name: "Belgian Chocolate Glazed Donut",
    category: "Desserts",
    price: 3.25,
    stock: 30,
    icon: "🍩",
    description: "Fluffy yeast donut dipped in 70% dark Belgian chocolate glaze."
  },
  {
    id: "PRD-011",
    sku: "DES-MAC-11",
    name: "French Macarons Box (4 pcs)",
    category: "Desserts",
    price: 8.50,
    stock: 3,
    icon: "🧁",
    description: "Assorted artisan macarons: Pistachio, Salted Caramel, Raspberry, and Vanilla Bean."
  },

  // Snacks
  {
    id: "PRD-012",
    sku: "SNA-TRS-12",
    name: "Organic Roasted Almonds & Pecans",
    category: "Snacks",
    price: 4.50,
    stock: 50,
    icon: "🥜",
    description: "Lightly sea-salted, slow-roasted California almonds and pecans."
  }
];

export default mockProducts;
