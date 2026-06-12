import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { OrderService } from './order.service';
import type { PaginatedResponse, Order, DailyPurchase, OrderStats } from '@app/models/order.types';

const MOCK_ORDERS: Order[] = [
  { id: '12448', userId: 12448, createdAt: 'Oct 24, 14:20' },
  { id: '12449', userId: 12449, createdAt: 'Oct 24, 15:45' },
  { id: '12450', userId: 12450, createdAt: 'Oct 23, 11:30' },
  { id: '12451', userId: 12451, createdAt: 'Oct 23, 09:15' },
  { id: '12452', userId: 12452, createdAt: 'Oct 22, 18:00' },
  { id: '12453', userId: 12453, createdAt: 'Oct 22, 14:22' },
  { id: '12454', userId: 12454, createdAt: 'Oct 21, 16:10' },
  { id: '12455', userId: 12455, createdAt: 'Oct 21, 12:05' },
  { id: '12456', userId: 12456, createdAt: 'Oct 20, 10:30' },
  { id: '12457', userId: 12457, createdAt: 'Oct 20, 08:00' },
  { id: '12458', userId: 12458, createdAt: 'Oct 19, 17:45' },
  { id: '12459', userId: 12459, createdAt: 'Oct 19, 13:20' },
];

const RAW_RESPONSE = {
  data: [
    { id: 12448, user_id: 12448, created_at: 'Oct 24, 14:20' },
    { id: 12449, user_id: 12449, created_at: 'Oct 24, 15:45' },
    { id: 12450, user_id: 12450, created_at: 'Oct 23, 11:30' },
    { id: 12451, user_id: 12451, created_at: 'Oct 23, 09:15' },
    { id: 12452, user_id: 12452, created_at: 'Oct 22, 18:00' },
    { id: 12453, user_id: 12453, created_at: 'Oct 22, 14:22' },
    { id: 12454, user_id: 12454, created_at: 'Oct 21, 16:10' },
    { id: 12455, user_id: 12455, created_at: 'Oct 21, 12:05' },
    { id: 12456, user_id: 12456, created_at: 'Oct 20, 10:30' },
    { id: 12457, user_id: 12457, created_at: 'Oct 20, 08:00' },
    { id: 12458, user_id: 12458, created_at: 'Oct 19, 17:45' },
    { id: 12459, user_id: 12459, created_at: 'Oct 19, 13:20' },
  ],
  total: 12,
};

describe('OrderService', () => {
  let service: OrderService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OrderService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getOrders', () => {
    it('should make GET request with limit and offset params', () => {
      service.getOrders(0, 10).subscribe();
      const req = httpMock.expectOne('/api/orders?limit=10&offset=0');
      expect(req.request.method).toBe('GET');
      req.flush({ data: [], total: 0 });
    });

    it('should compute offset for page 2', () => {
      service.getOrders(2, 5).subscribe();
      const req = httpMock.expectOne('/api/orders?limit=5&offset=10');
      expect(req.request.method).toBe('GET');
      req.flush({ data: [], total: 0 });
    });

    it('should map RawOrder to Order (snake_case → camelCase)', () => {
      let result: PaginatedResponse<Order> | undefined;

      service.getOrders(0, 10).subscribe(r => result = r);
      httpMock.expectOne('/api/orders?limit=10&offset=0').flush(RAW_RESPONSE);

      expect(result!.items).toEqual(MOCK_ORDERS);
      expect(result!.total).toBe(12);
      expect(result!.page).toBe(0);
      expect(result!.pageSize).toBe(10);
    });

    it('should handle empty data', () => {
      let result: PaginatedResponse<Order> | undefined;

      service.getOrders(0, 10).subscribe(r => result = r);
      httpMock.expectOne('/api/orders?limit=10&offset=0').flush({ data: [], total: 0 });

      expect(result!.items).toEqual([]);
      expect(result!.total).toBe(0);
    });

    it('should propagate HTTP error', () => {
      let error: unknown;

      service.getOrders(0, 10).subscribe({ error: e => error = e });
      httpMock.expectOne('/api/orders?limit=10&offset=0').flush(
        { message: 'Server error' },
        { status: 500, statusText: 'Internal Server Error' },
      );

      expect(error).toBeTruthy();
    });
  });

  describe('getDailyPurchases', () => {
    it('should make GET request with limit and offset params', () => {
      service.getDailyPurchases(0, 5).subscribe();
      const req = httpMock.expectOne('/api/orders/daily-stats?limit=5&offset=0');
      expect(req.request.method).toBe('GET');
      req.flush({ data: [], total: 0 });
    });

    it('should pass through data and total', () => {
      let result: PaginatedResponse<DailyPurchase> | undefined;

      service.getDailyPurchases(0, 5).subscribe(r => result = r);
      httpMock.expectOne('/api/orders/daily-stats?limit=5&offset=0').flush({
        data: [
          { date: '2026-06-09T22:19:44Z', orders: 1, revenue: 71.49 },
          { date: '2026-06-08T00:00:00Z', orders: 3, revenue: 214.47 },
        ],
        total: 29,
      });

      expect(result!.items).toEqual([
        { date: '2026-06-09T22:19:44Z', orders: 1, revenue: 71.49 },
        { date: '2026-06-08T00:00:00Z', orders: 3, revenue: 214.47 },
      ]);
      expect(result!.total).toBe(29);
      expect(result!.page).toBe(0);
      expect(result!.pageSize).toBe(5);
    });

    it('should compute offset for page 2', () => {
      service.getDailyPurchases(2, 5).subscribe();
      const req = httpMock.expectOne('/api/orders/daily-stats?limit=5&offset=10');
      expect(req.request.method).toBe('GET');
      req.flush({ data: [], total: 0 });
    });
  });

  describe('getOrderStats', () => {
    it('should make GET request and map response', () => {
      let result: OrderStats | undefined;

      service.getOrderStats().subscribe(r => result = r);
      httpMock.expectOne('/api/orders/stats').flush({
        total: 42,
        totalThisMonth: 1240500,
        averageCheck: 4120,
      });

      expect(result!.totalThisMonth).toBe(1240500);
      expect(result!.averageCheck).toBe(4120);
      expect(result!.activeOrders).toBe(42);
    });
  });

  describe('createOrder', () => {
    it('should return order with id', () => {
      let result: Order | undefined;

      service.createOrder({}).subscribe(r => result = r);

      expect(result!.id).toBe('#NEW');
    });
  });
});
