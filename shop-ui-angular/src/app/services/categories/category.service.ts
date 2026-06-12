import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import type { Observable } from 'rxjs';
import type { Category, CategoryRevenue, CategoryStats } from '@app/models/category.types';
import type { PaginatedResponse } from '@app/models/order.types';
import { mapCategories, mapCategoryRevenue } from './category.mapper';
import type { DtoListCategoryResponse, DtoListCategoryRevenueResponse, DtoWidgetStatsResponse } from 'src/lib/types/api';

@Injectable()
export class CategoryService {
  private http = inject(HttpClient);

  static getCategoriesUrl = '/api/categories';
  static getCategoryRevenueUrl = '/api/categories/revenue';
  static getCategoryStatsUrl = '/api/categories/stats';

  getCategories(page: number, pageSize: number): Observable<PaginatedResponse<Category>> {
    const offset = page * pageSize;

    return this.http.get<DtoListCategoryResponse>(CategoryService.getCategoriesUrl, {
      params: { limit: pageSize, offset },
    }).pipe(
      map(response => {
        const { data, total } = response;
        const items = mapCategories(data);
        return { items, total, page, pageSize };
      }),
    );
  }

  getCategoryRevenue(page: number, pageSize: number): Observable<PaginatedResponse<CategoryRevenue>> {
    const offset = page * pageSize;

    return this.http.get<DtoListCategoryRevenueResponse>(CategoryService.getCategoryRevenueUrl, {
      params: { limit: pageSize, offset },
    }).pipe(
      map(response => {
        const { data, total } = response;
        const items = data.map(mapCategoryRevenue);
        return { items, total, page, pageSize };
      }),
    );
  }

  getCategoryStats(): Observable<CategoryStats> {
    return this.http.get<DtoWidgetStatsResponse>(CategoryService.getCategoryStatsUrl).pipe(
      map(response => ({
        totalCategories: response.totalCategories,
        totalProducts: response.totalProducts,
        topCategory: {
          title: response.topCategory.title,
          revenue: response.topCategory.revenue,
        },
      })),
    );
  }
}
