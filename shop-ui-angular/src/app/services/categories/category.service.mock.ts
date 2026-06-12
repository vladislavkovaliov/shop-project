import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import type { Observable } from 'rxjs';
import type { Category, CategoryRevenue, CategoryStats } from '@app/models/category.types';
import type { PaginatedResponse } from '@app/models/order.types';

const MOCK_CATEGORIES: Category[] = [
  { id: 1, title: 'Electronics', slug: 'electronics', createdAt: '2026-05-31T04:32:44Z' },
  { id: 2, title: 'Apparel', slug: 'apparel', createdAt: '2026-05-22T22:35:51Z' },
  { id: 3, title: 'Books', slug: 'books', createdAt: '2026-05-24T04:45:12Z' },
];

const MOCK_REVENUE: CategoryRevenue[] = [
  { category: 'Electronics', products: 45, revenue: 324500, orders: 1245, growth: { value: 15.2, sign: '+' } },
  { category: 'Clothing', products: 78, revenue: 289100, orders: 1098, growth: { value: 12.8, sign: '+' } },
  { category: 'Sports & Outdoors', products: 56, revenue: 198400, orders: 756, growth: { value: 18.3, sign: '+' } },
  { category: 'Books', products: 67, revenue: 156200, orders: 892, growth: { value: 9.7, sign: '+' } },
  { category: 'Accessories', products: 41, revenue: 145800, orders: 523, growth: { value: 11.4, sign: '+' } },
  { category: 'Home Appliances', products: 22, revenue: 134600, orders: 412, growth: { value: 7.6, sign: '+' } },
  { category: 'Footwear', products: 34, revenue: 112300, orders: 389, growth: { value: 14.1, sign: '+' } },
  { category: 'Beauty & Health', products: 29, revenue: 98700, orders: 345, growth: { value: 10.5, sign: '+' } },
  { category: 'Furniture', products: 18, revenue: 89200, orders: 267, growth: { value: 6.2, sign: '+' } },
  { category: 'Toys & Games', products: 38, revenue: 76500, orders: 298, growth: { value: 13.9, sign: '+' } },
];

@Injectable()
export class MockCategoryService {
  getCategories(page: number, pageSize: number): Observable<PaginatedResponse<Category>> {
    const start = page * pageSize;
    const items = MOCK_CATEGORIES.slice(start, start + pageSize);
    return of({ items, total: MOCK_CATEGORIES.length, page, pageSize });
  }

  getCategoryRevenue(page: number, pageSize: number): Observable<PaginatedResponse<CategoryRevenue>> {
    const start = page * pageSize;
    const items = MOCK_REVENUE.slice(start, start + pageSize);
    return of({ items, total: MOCK_REVENUE.length, page, pageSize });
  }

  getCategoryStats(): Observable<CategoryStats> {
    return of({
      totalCategories: 14,
      totalProducts: 518,
      topCategory: { title: 'Electronics', revenue: 324500 },
    });
  }
}
