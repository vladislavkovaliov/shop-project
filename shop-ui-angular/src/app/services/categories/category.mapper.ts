import type { Category, CategoryRevenue } from '@app/models/category.types';
import type { DtoListCategoryResponse, DtoCategoryResponse, DtoCategoryRevenueResponse } from 'src/lib/types/api';

export function mapCategory(raw: DtoCategoryResponse): Category {
  return {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    createdAt: raw.created_at,
  };
}

export function mapCategories(raw: DtoListCategoryResponse['data']): Category[] {
  return raw.map(mapCategory);
}

export function mapCategoryRevenue(raw: DtoCategoryRevenueResponse): CategoryRevenue {
  return {
    category: raw.category,
    products: raw.products,
    revenue: raw.revenue,
    orders: raw.orders,
    growth: {
      value: raw.growth.value,
      sign: raw.growth.sign,
    },
  };
}
