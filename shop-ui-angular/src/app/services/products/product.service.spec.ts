import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ProductService } from './product.service';
import type { Product, ProductRevenue } from '@app/models/product.types';
import type { PaginatedResponse } from '@app/models/order.types';

const RAW_PRODUCTS_RESPONSE = {
  data: [
    { id: 1, title: 'Smartphone Alpha', price: 100, category: 'Electronics' },
    { id: 2, title: 'Wireless Headphones', price: 50, category: 'Electronics' },
    { id: 3, title: 'Winter Jacket', price: 25, category: 'Apparel' },
    { id: 4, title: 'Running Shoes', price: 1000, category: 'Apparel' },
    { id: 5, title: 'SQL for Beginners Book', price: 10, category: 'Books' },
  ],
  total: 5,
};

const EXPECTED_PRODUCTS: Product[] = [
  { id: 1, title: 'Smartphone Alpha', price: 100, category: 'Electronics' },
  { id: 2, title: 'Wireless Headphones', price: 50, category: 'Electronics' },
  { id: 3, title: 'Winter Jacket', price: 25, category: 'Apparel' },
  { id: 4, title: 'Running Shoes', price: 1000, category: 'Apparel' },
  { id: 5, title: 'SQL for Beginners Book', price: 10, category: 'Books' },
];

const RAW_REVENUE_RESPONSE = {
  data: [
    { title: 'Running Shoes', revenue: 45000, growth: { value: 12.5, sign: '+' } },
    { title: 'Smartphone Alpha', revenue: 32400, growth: { value: 8.3, sign: '+' } },
  ],
  total: 2,
};

const EXPECTED_REVENUE: ProductRevenue[] = [
  { title: 'Running Shoes', revenue: 45000, growth: { value: 12.5, sign: '+' } },
  { title: 'Smartphone Alpha', revenue: 32400, growth: { value: 8.3, sign: '+' } },
];

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProductService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getProducts', () => {
    it('should make GET request with limit and offset params', () => {
      service.getProducts(0, 10).subscribe();
      const req = httpMock.expectOne('/api/products?limit=10&offset=0');
      expect(req.request.method).toBe('GET');
      req.flush({ data: [], total: 0 });
    });

    it('should compute offset for page 2', () => {
      service.getProducts(2, 5).subscribe();
      const req = httpMock.expectOne('/api/products?limit=5&offset=10');
      expect(req.request.method).toBe('GET');
      req.flush({ data: [], total: 0 });
    });

    it('should map DtoProductResponse to Product (snake_case → camelCase)', () => {
      let result: PaginatedResponse<Product> | undefined;

      service.getProducts(0, 10).subscribe(r => result = r);
      httpMock.expectOne('/api/products?limit=10&offset=0').flush(RAW_PRODUCTS_RESPONSE);

      expect(result!.items).toEqual(EXPECTED_PRODUCTS);
      expect(result!.total).toBe(5);
      expect(result!.page).toBe(0);
      expect(result!.pageSize).toBe(10);
    });

    it('should handle empty data', () => {
      let result: PaginatedResponse<Product> | undefined;

      service.getProducts(0, 10).subscribe(r => result = r);
      httpMock.expectOne('/api/products?limit=10&offset=0').flush({ data: [], total: 0 });

      expect(result!.items).toEqual([]);
      expect(result!.total).toBe(0);
    });

    it('should propagate HTTP error', () => {
      let error: unknown;

      service.getProducts(0, 10).subscribe({ error: e => error = e });
      httpMock.expectOne('/api/products?limit=10&offset=0').flush(
        { message: 'Server error' },
        { status: 500, statusText: 'Internal Server Error' },
      );

      expect(error).toBeTruthy();
    });
  });

  describe('getProductRevenue', () => {
    it('should make GET request with limit and offset params', () => {
      service.getProductRevenue(0, 10).subscribe();
      const req = httpMock.expectOne('/api/products/revenue?limit=10&offset=0');
      expect(req.request.method).toBe('GET');
      req.flush({ data: [], total: 0 });
    });

    it('should compute offset for page 2', () => {
      service.getProductRevenue(2, 5).subscribe();
      const req = httpMock.expectOne('/api/products/revenue?limit=5&offset=10');
      expect(req.request.method).toBe('GET');
      req.flush({ data: [], total: 0 });
    });

    it('should map DtoTotalRevenueResponse to ProductRevenue', () => {
      let result: PaginatedResponse<ProductRevenue> | undefined;

      service.getProductRevenue(0, 10).subscribe(r => result = r);
      httpMock.expectOne('/api/products/revenue?limit=10&offset=0').flush(RAW_REVENUE_RESPONSE);

      expect(result!.items).toEqual(EXPECTED_REVENUE);
      expect(result!.total).toBe(2);
      expect(result!.page).toBe(0);
      expect(result!.pageSize).toBe(10);
    });

    it('should handle empty data', () => {
      let result: PaginatedResponse<ProductRevenue> | undefined;

      service.getProductRevenue(0, 10).subscribe(r => result = r);
      httpMock.expectOne('/api/products/revenue?limit=10&offset=0').flush({ data: [], total: 0 });

      expect(result!.items).toEqual([]);
      expect(result!.total).toBe(0);
    });

    it('should propagate HTTP error', () => {
      let error: unknown;

      service.getProductRevenue(0, 10).subscribe({ error: e => error = e });
      httpMock.expectOne('/api/products/revenue?limit=10&offset=0').flush(
        { message: 'Server error' },
        { status: 500, statusText: 'Internal Server Error' },
      );

      expect(error).toBeTruthy();
    });
  });
});
