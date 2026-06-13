import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import type { Observable } from 'rxjs';
import type { Product, ProductRevenue } from '@app/models/product.types';
import type { PaginatedResponse } from '@app/models/order.types';

const MOCK_PRODUCTS: Product[] = [
  { id: 1, title: 'Smartphone Alpha', price: 100, category: 'Electronics' },
  { id: 2, title: 'Wireless Headphones', price: 50, category: 'Electronics' },
  { id: 3, title: 'Winter Jacket', price: 25, category: 'Apparel' },
  { id: 4, title: 'Running Shoes', price: 1000, category: 'Apparel' },
  { id: 5, title: 'SQL for Beginners Book', price: 10, category: 'Books' },
];

const MOCK_REVENUE: ProductRevenue[] = [
  { title: 'Running Shoes', revenue: 45000, growth: { value: 12.5, sign: '+' } },
  { title: 'Smartphone Alpha', revenue: 32400, growth: { value: 8.3, sign: '+' } },
  { title: 'Wireless Headphones', revenue: 15200, growth: { value: 5.1, sign: '+' } },
  { title: 'Winter Jacket', revenue: 8900, growth: { value: 3.2, sign: '-' } },
  { title: 'SQL for Beginners Book', revenue: 4500, growth: { value: 15.7, sign: '+' } },
];

@Injectable()
export class MockProductService {
  getProducts(page: number, pageSize: number): Observable<PaginatedResponse<Product>> {
    const start = page * pageSize;
    const items = MOCK_PRODUCTS.slice(start, start + pageSize);
    return of({ items, total: MOCK_PRODUCTS.length, page, pageSize });
  }

  getProductRevenue(page: number, pageSize: number): Observable<PaginatedResponse<ProductRevenue>> {
    const start = page * pageSize;
    const items = MOCK_REVENUE.slice(start, start + pageSize);
    return of({ items, total: MOCK_REVENUE.length, page, pageSize });
  }
}
