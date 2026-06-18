export interface HomeStats {
  revenue: number;
  orders: number;
  users: number;
  conversion: number;
  revenueTrend: Trend;
  ordersTrend: Trend;
  usersTrend: Trend;
  conversionTrend: Trend;
}

export interface UserStats {
  count: number;
}

export interface OrderStats {
  count: number;
}

export interface Trend {
  value: number;
  sign: string;
}

export interface RevenueStats {
  totalRevenue: number;
}

export interface TrendStats {
  currentPeriod: number;
  previousPeriod: number;
  growth: Trend;
}
