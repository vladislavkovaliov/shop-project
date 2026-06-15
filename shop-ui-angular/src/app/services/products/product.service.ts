import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import type { Observable } from 'rxjs';
import type { Product, ProductRevenue, RevenueStats } from '@app/models/product.types';
import type { PaginatedResponse } from '@app/models/order.types';
import type { DtoListProductResponse, DtoListRevenueReportResponse, DtoRevenueStatsResponse } from 'src/lib/types/api';
import { mapProducts, mapProductRevenue } from './product.mapper';

@Injectable()
export class ProductService {
  private http = inject(HttpClient);

  static getProductsUrl = '/api/products';
  static getRevenueUrl = '/api/products/revenue-report';
  static getRevenueStatsUrl = '/api/products/revenue-stats';

  getProducts(page: number, pageSize: number): Observable<PaginatedResponse<Product>> {
    const offset = page * pageSize;

    return this.http.get<DtoListProductResponse>(ProductService.getProductsUrl, {
      params: { limit: pageSize, offset },
    }).pipe(
      map(response => {
        const { data, total } = response;
        const items = mapProducts(data);
        return { items, total, page, pageSize };
      }),
    );
  }

  getProductRevenue(page: number, pageSize: number): Observable<PaginatedResponse<ProductRevenue>> {
    const offset = page * pageSize;

    return this.http.get<DtoListRevenueReportResponse>(ProductService.getRevenueUrl, {
      params: { limit: pageSize, offset },
    }).pipe(
      map(response => {
        const { data, total } = response;
        const items = data.map(mapProductRevenue);
        return { items, total, page, pageSize };
      }),
    );
  }

  getRevenueStats(): Observable<RevenueStats> {
    return this.http.get<DtoRevenueStatsResponse>(ProductService.getRevenueStatsUrl);
  }
}
