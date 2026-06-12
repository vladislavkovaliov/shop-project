export interface Order {
  id: string;
  userId: number;
  createdAt: string;
}

export interface DailyPurchase {
  date: string;
  orders: number;
  revenue: number;
}

export interface OrderStats {
  totalThisMonth: number;
  averageCheck: number;
  activeOrders: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
