export interface Product {
  id: number;
  title: string;
  price: number;
  category: string;
}

export interface ProductRevenue {
  title: string;
  revenue: number;
  growth: Growth;
}

export interface Growth {
  value: number;
  sign: string;
}
