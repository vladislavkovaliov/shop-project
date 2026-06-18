import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map } from 'rxjs';
import type { Observable } from 'rxjs';
import type { DtoCountResponse, DtoRevenueStatsResponse, DtoOrdersTrendResponse, DtoUserRegistrationTrendResponse } from 'src/lib/types/api';
import { HomeStats, OrderStats, UserStats, RevenueStats, TrendStats } from './home.types';

@Injectable()
export class HomeService {
  private http = inject(HttpClient);

  static getCountUsersUrl = '/api/users/count';
  static getCountOrdersUrl = '/api/orders/count';
  static getRevenueStatsUrl = '/api/products/revenue-stats';
  static getOrdersTrendUrl = '/api/orders/trend';
  static getUserTrendUrl = '/api/users/registration-trend';

  getStats(): Observable<HomeStats> {
    return forkJoin([
      this.getCountUsers(),
      this.getCountOrders(),
      this.getRevenueStats(),
      this.getOrdersTrend(),
      this.getUserTrend(),
    ]).pipe(
      map(([users, orders, revenueStats, ordersTrend, userTrend]) => {
        const conversion =
          orders.count > 0 && users.count > 0
            ? Math.round((orders.count / users.count) * 10000) / 100
            : 0;

        return {
          users: users.count,
          orders: orders.count,
          revenue: revenueStats.totalRevenue,
          conversion,
          revenueTrend: { value: 0, sign: '+' },
          ordersTrend: ordersTrend.growth,
          usersTrend: userTrend.growth,
          conversionTrend: { value: 0, sign: '+' },
        };
      }),
    );
  }

  getCountUsers(): Observable<UserStats> {
    return this.http
      .get<DtoCountResponse>(HomeService.getCountUsersUrl)
      .pipe(map((response) => ({ count: response.count })));
  }

  getCountOrders(): Observable<OrderStats> {
    return this.http
      .get<DtoCountResponse>(HomeService.getCountOrdersUrl)
      .pipe(map((response) => ({ count: response.count })));
  }

  private getRevenueStats(): Observable<RevenueStats> {
    return this.http.get<DtoRevenueStatsResponse>(HomeService.getRevenueStatsUrl).pipe(
      map((r) => ({ totalRevenue: r.totalRevenue })),
    );
  }

  private getOrdersTrend(): Observable<TrendStats> {
    return this.http.get<DtoOrdersTrendResponse>(HomeService.getOrdersTrendUrl).pipe(
      map((r) => ({
        currentPeriod: r.currentPeriod ?? 0,
        previousPeriod: r.previousPeriod ?? 0,
        growth: { value: r.growth?.value ?? 0, sign: r.growth?.sign ?? '+' },
      })),
    );
  }

  private getUserTrend(): Observable<TrendStats> {
    return this.http.get<DtoUserRegistrationTrendResponse>(HomeService.getUserTrendUrl).pipe(
      map((r) => ({
        currentPeriod: r.currentPeriod ?? 0,
        previousPeriod: r.previousPeriod ?? 0,
        growth: { value: r.growth?.value ?? 0, sign: r.growth?.sign ?? '+' },
      })),
    );
  }
}
