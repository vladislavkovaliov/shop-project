import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, map } from 'rxjs';
import type { Observable } from 'rxjs';
import { type Order, type DailyPurchase, type OrderStats, type PaginatedResponse } from '@app/models/order.types';
import { mapOrders } from './order.mapper';
import { DtoListOrderResponse, DtoStatsOrderResponse, DtoListDailyStatResponse } from 'src/lib/types/api';

@Injectable()
export class OrderService {
  private http = inject(HttpClient);

  static getOrdersUrl = '/api/orders';
  static getOrdersStatsUrl = '/api/orders/stats';
  static getOrderStatsUrl = '/api/orders/daily-stats';

  getOrders(page: number, pageSize: number): Observable<PaginatedResponse<Order>> {
    const offset = page * pageSize;

    return this.http.get<DtoListOrderResponse>(OrderService.getOrdersUrl, {
      params: { limit: pageSize, offset: offset },
    }).pipe(
      map(response => {
        const { data, total } = response;
        
        const items = mapOrders(data);

        return { items, total, page, pageSize };
      }),
    );
  }

  getDailyPurchases(page: number, pageSize: number): Observable<PaginatedResponse<DailyPurchase>> {
    const offset = page * pageSize;

    return this.http.get<DtoListDailyStatResponse>(OrderService.getOrderStatsUrl, {
       params: { limit: pageSize, offset: offset },
    }).pipe(
      map(response => {
        const { data, total } = response;

        return { items: data, total: total, page, pageSize }
      })
    )
  }

  getOrderStats(): Observable<OrderStats> {
    return this.http.get<DtoStatsOrderResponse>(OrderService.getOrdersStatsUrl).pipe(
      map(response => {
        const { total, totalThisMonth, averageCheck } = response;

        return { totalThisMonth: totalThisMonth, averageCheck: averageCheck, activeOrders: total };
      }),
    );
  }

  createOrder(payload: Record<string, unknown>): Observable<Order> {
    console.log('createOrder payload', payload);
    return of({ id: '#NEW', userId: 0, createdAt: '' });
  }
}
