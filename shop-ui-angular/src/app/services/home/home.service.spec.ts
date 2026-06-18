import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { HomeService } from './home.service';
import type { HomeStats } from './home.types';

const MOCK_COUNT_RESPONSE = { count: 100 };
const MOCK_REVENUE_STATS = { totalRevenue: 50000, averageOrderValue: 150, totalProductsSold: 333 };
const MOCK_ORDERS_TREND = { currentPeriod: 42, previousPeriod: 35, growth: { value: 20, sign: '+' } };
const MOCK_USER_TREND = { currentPeriod: 25, previousPeriod: 30, growth: { value: 16.7, sign: '-' } };

describe('HomeService', () => {
  let service: HomeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HomeService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(HomeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getCountUsers', () => {
    it('should make GET request to /api/users/count', () => {
      service.getCountUsers().subscribe();
      const req = httpMock.expectOne('/api/users/count');
      expect(req.request.method).toBe('GET');
      req.flush(MOCK_COUNT_RESPONSE);
    });

    it('should return mapped UserStats', () => {
      let result: { count: number } | undefined;

      service.getCountUsers().subscribe(r => result = r);
      httpMock.expectOne('/api/users/count').flush(MOCK_COUNT_RESPONSE);

      expect(result).toEqual({ count: 100 });
    });
  });

  describe('getCountOrders', () => {
    it('should make GET request to /api/orders/count', () => {
      service.getCountOrders().subscribe();
      const req = httpMock.expectOne('/api/orders/count');
      expect(req.request.method).toBe('GET');
      req.flush(MOCK_COUNT_RESPONSE);
    });

    it('should return mapped OrderStats', () => {
      let result: { count: number } | undefined;

      service.getCountOrders().subscribe(r => result = r);
      httpMock.expectOne('/api/orders/count').flush(MOCK_COUNT_RESPONSE);

      expect(result).toEqual({ count: 100 });
    });
  });

  describe('getStats', () => {
    it('should fetch all 5 endpoints and return HomeStats', () => {
      let result: HomeStats | undefined;

      service.getStats().subscribe(r => result = r);

      httpMock.expectOne('/api/users/count').flush(MOCK_COUNT_RESPONSE);
      httpMock.expectOne('/api/orders/count').flush(MOCK_COUNT_RESPONSE);
      httpMock.expectOne('/api/products/revenue-stats').flush(MOCK_REVENUE_STATS);
      httpMock.expectOne('/api/orders/trend').flush(MOCK_ORDERS_TREND);
      httpMock.expectOne('/api/users/registration-trend').flush(MOCK_USER_TREND);

      expect(result).toBeDefined();
      expect(result!.users).toBe(100);
      expect(result!.orders).toBe(100);
      expect(result!.revenue).toBe(50000);
      expect(result!.conversion).toBe(100);
      expect(result!.ordersTrend).toEqual({ value: 20, sign: '+' });
      expect(result!.usersTrend).toEqual({ value: 16.7, sign: '-' });
    });

    it('should calculate conversion as orders/users percentage', () => {
      let result: HomeStats | undefined;

      service.getStats().subscribe(r => result = r);

      httpMock.expectOne('/api/users/count').flush({ count: 200 });
      httpMock.expectOne('/api/orders/count').flush({ count: 50 });
      httpMock.expectOne('/api/products/revenue-stats').flush(MOCK_REVENUE_STATS);
      httpMock.expectOne('/api/orders/trend').flush(MOCK_ORDERS_TREND);
      httpMock.expectOne('/api/users/registration-trend').flush(MOCK_USER_TREND);

      expect(result!.conversion).toBe(25);
    });

    it('should default trend values when growth is missing', () => {
      let result: HomeStats | undefined;

      service.getStats().subscribe(r => result = r);

      httpMock.expectOne('/api/users/count').flush(MOCK_COUNT_RESPONSE);
      httpMock.expectOne('/api/orders/count').flush(MOCK_COUNT_RESPONSE);
      httpMock.expectOne('/api/products/revenue-stats').flush(MOCK_REVENUE_STATS);
      httpMock.expectOne('/api/orders/trend').flush({ currentPeriod: 0, previousPeriod: 0 });
      httpMock.expectOne('/api/users/registration-trend').flush({ currentPeriod: 0, previousPeriod: 0 });

      expect(result!.ordersTrend).toEqual({ value: 0, sign: '+' });
      expect(result!.usersTrend).toEqual({ value: 0, sign: '+' });
    });
  });
});
