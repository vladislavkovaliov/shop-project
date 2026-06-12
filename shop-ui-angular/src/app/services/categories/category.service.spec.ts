import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { CategoryService } from './category.service';
import type { Category, CategoryRevenue } from '@app/models/category.types';
import type { PaginatedResponse } from '@app/models/order.types';

const RAW_RESPONSE = {
  data: [
    { id: 1, title: 'Electronics', slug: 'electronics', created_at: '2026-05-31T04:32:44Z' },
    { id: 2, title: 'Apparel', slug: 'apparel', created_at: '2026-05-22T22:35:51Z' },
    { id: 3, title: 'Books', slug: 'books', created_at: '2026-05-24T04:45:12Z' },
  ],
  total: 3,
};

const EXPECTED: Category[] = [
  { id: 1, title: 'Electronics', slug: 'electronics', createdAt: '2026-05-31T04:32:44Z' },
  { id: 2, title: 'Apparel', slug: 'apparel', createdAt: '2026-05-22T22:35:51Z' },
  { id: 3, title: 'Books', slug: 'books', createdAt: '2026-05-24T04:45:12Z' },
];

const RAW_REVENUE_RESPONSE = {
  data: [
    { category: 'Electronics', products: 45, revenue: 324500, orders: 1245, growth: { value: 15.2, sign: '+' } },
    { category: 'Clothing', products: 78, revenue: 289100, orders: 1098, growth: { value: 12.8, sign: '+' } },
  ],
  total: 2,
};

const EXPECTED_REVENUE: CategoryRevenue[] = [
  { category: 'Electronics', products: 45, revenue: 324500, orders: 1245, growth: { value: 15.2, sign: '+' } },
  { category: 'Clothing', products: 78, revenue: 289100, orders: 1098, growth: { value: 12.8, sign: '+' } },
];

describe('CategoryService', () => {
  let service: CategoryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CategoryService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(CategoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getCategories', () => {
    it('should make GET request with limit and offset params', () => {
      service.getCategories(0, 10).subscribe();
      const req = httpMock.expectOne('/api/categories?limit=10&offset=0');
      expect(req.request.method).toBe('GET');
      req.flush({ data: [], total: 0 });
    });

    it('should compute offset for page 2', () => {
      service.getCategories(2, 5).subscribe();
      const req = httpMock.expectOne('/api/categories?limit=5&offset=10');
      expect(req.request.method).toBe('GET');
      req.flush({ data: [], total: 0 });
    });

    it('should map DtoCategoryResponse to Category (snake_case → camelCase)', () => {
      let result: PaginatedResponse<Category> | undefined;

      service.getCategories(0, 10).subscribe(r => result = r);
      httpMock.expectOne('/api/categories?limit=10&offset=0').flush(RAW_RESPONSE);

      expect(result!.items).toEqual(EXPECTED);
      expect(result!.total).toBe(3);
      expect(result!.page).toBe(0);
      expect(result!.pageSize).toBe(10);
    });

    it('should handle empty data', () => {
      let result: PaginatedResponse<Category> | undefined;

      service.getCategories(0, 10).subscribe(r => result = r);
      httpMock.expectOne('/api/categories?limit=10&offset=0').flush({ data: [], total: 0 });

      expect(result!.items).toEqual([]);
      expect(result!.total).toBe(0);
    });

    it('should propagate HTTP error', () => {
      let error: unknown;

      service.getCategories(0, 10).subscribe({ error: e => error = e });
      httpMock.expectOne('/api/categories?limit=10&offset=0').flush(
        { message: 'Server error' },
        { status: 500, statusText: 'Internal Server Error' },
      );

      expect(error).toBeTruthy();
    });
  });

  describe('getCategoryRevenue', () => {
    it('should make GET request with limit and offset params', () => {
      service.getCategoryRevenue(0, 10).subscribe();
      const req = httpMock.expectOne('/api/categories/revenue?limit=10&offset=0');
      expect(req.request.method).toBe('GET');
      req.flush({ data: [], total: 0 });
    });

    it('should compute offset for page 2', () => {
      service.getCategoryRevenue(2, 5).subscribe();
      const req = httpMock.expectOne('/api/categories/revenue?limit=5&offset=10');
      expect(req.request.method).toBe('GET');
      req.flush({ data: [], total: 0 });
    });

    it('should map DtoCategoryRevenueResponse to CategoryRevenue', () => {
      let result: PaginatedResponse<CategoryRevenue> | undefined;

      service.getCategoryRevenue(0, 10).subscribe(r => result = r);
      httpMock.expectOne('/api/categories/revenue?limit=10&offset=0').flush(RAW_REVENUE_RESPONSE);

      expect(result!.items).toEqual(EXPECTED_REVENUE);
      expect(result!.total).toBe(2);
      expect(result!.page).toBe(0);
      expect(result!.pageSize).toBe(10);
    });

    it('should handle empty data', () => {
      let result: PaginatedResponse<CategoryRevenue> | undefined;

      service.getCategoryRevenue(0, 10).subscribe(r => result = r);
      httpMock.expectOne('/api/categories/revenue?limit=10&offset=0').flush({ data: [], total: 0 });

      expect(result!.items).toEqual([]);
      expect(result!.total).toBe(0);
    });

    it('should propagate HTTP error', () => {
      let error: unknown;

      service.getCategoryRevenue(0, 10).subscribe({ error: e => error = e });
      httpMock.expectOne('/api/categories/revenue?limit=10&offset=0').flush(
        { message: 'Server error' },
        { status: 500, statusText: 'Internal Server Error' },
      );

      expect(error).toBeTruthy();
    });
  });
});
