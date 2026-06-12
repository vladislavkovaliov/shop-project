export interface Category {
  id: number;
  title: string;
  slug: string;
  createdAt: string;
}

export interface Growth {
  value: number;
  sign: string;
}

export interface CategoryRevenue {
  category: string;
  products: number;
  revenue: number;
  orders: number;
  growth: Growth;
}

export interface TopCategory {
  title: string;
  revenue: number;
}

export interface CategoryStats {
  totalCategories: number;
  totalProducts: number;
  topCategory: TopCategory;
}
