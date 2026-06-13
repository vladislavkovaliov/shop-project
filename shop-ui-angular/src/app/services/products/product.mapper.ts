import type { Product, ProductRevenue } from '@app/models/product.types';
import type { DtoProductResponse, DtoListRevenueReportResponse, DtoRevenueReportResponse } from 'src/lib/types/api';

export function mapProduct(raw: DtoProductResponse): Product {
  return {
    id: raw.id,
    title: raw.title,
    price: raw.price,
    category: raw.category,
  };
}

export function mapProducts(raw: DtoProductResponse[]): Product[] {
  return raw.map(mapProduct);
}

export function mapProductRevenue(raw: DtoRevenueReportResponse): ProductRevenue {
  return {
    title: raw.title,
    revenue: raw.revenue,
    growth: {
      value: raw.growth.value,
      sign: raw.growth.sign,
    },
  };
}
