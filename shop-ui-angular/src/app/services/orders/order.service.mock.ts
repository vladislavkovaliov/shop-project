import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import type { Observable } from 'rxjs';
import type { Order, DailyPurchase, OrderStats, PaginatedResponse } from '@app/models/order.types';

const MOCK_ORDERS: Order[] = [
  { id: '12448', userId: 1, createdAt: 'Oct 24, 14:20' },
  { id: '12449', userId: 2, createdAt: 'Oct 24, 15:45' },
  { id: '12450', userId: 3, createdAt: 'Oct 23, 11:30' },
  { id: '12451', userId: 4, createdAt: 'Oct 23, 09:15' },
  { id: '12452', userId: 5, createdAt: 'Oct 22, 18:00' },
  { id: '12453', userId: 6, createdAt: 'Oct 22, 14:22' },
  { id: '12454', userId: 7, createdAt: 'Oct 21, 16:10' },
  { id: '12455', userId: 8, createdAt: 'Oct 21, 12:05' },
  { id: '12456', userId: 9, createdAt: 'Oct 20, 10:30' },
  { id: '12457', userId: 10, createdAt: 'Oct 20, 08:00' },
  { id: '12458', userId: 11, createdAt: 'Oct 19, 17:45' },
  { id: '12459', userId: 12, createdAt: 'Oct 19, 13:20' },
];

const MOCK_DAILY: DailyPurchase[] = [
  { date: 'Oct 24', orders: 12, revenue: 45200 },
  { date: 'Oct 23', orders: 8, revenue: 32100 },
  { date: 'Oct 22', orders: 15, revenue: 58400 },
  { date: 'Oct 21', orders: 10, revenue: 39800 },
  { date: 'Oct 20', orders: 6, revenue: 22500 },
  { date: 'Oct 19', orders: 14, revenue: 51200 },
  { date: 'Oct 18', orders: 9, revenue: 35600 },
  { date: 'Oct 17', orders: 11, revenue: 42100 },
  { date: 'Oct 16', orders: 7, revenue: 28900 },
  { date: 'Oct 15', orders: 13, revenue: 49300 },
];

@Injectable()
export class MockOrderService {
  getOrders(page: number, pageSize: number): Observable<PaginatedResponse<Order>> {
    const start = page * pageSize;
    const items = MOCK_ORDERS.slice(start, start + pageSize);
    return of({ items, total: MOCK_ORDERS.length, page, pageSize });
  }

  getDailyPurchases(page: number, pageSize: number): Observable<PaginatedResponse<DailyPurchase>> {
    const start = page * pageSize;
    const items = MOCK_DAILY.slice(start, start + pageSize);
    return of({ items, total: MOCK_DAILY.length, page, pageSize });
  }

  getOrderStats(): Observable<OrderStats> {
    return of({ totalThisMonth: 1240500, averageCheck: 4120, activeOrders: 42 });
  }

  createOrder(payload: Record<string, unknown>): Observable<Order> {
    console.log('MockOrderService.createOrder payload', payload);
    return of({ id: '#NEW', userId: 0, createdAt: '' });
  }
}
