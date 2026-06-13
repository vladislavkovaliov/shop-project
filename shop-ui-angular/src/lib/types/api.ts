/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface DtoCategoryAveragePrice {
  avg_price: number;
  category: string;
}

export interface DtoCategoryResponse {
  /** @example "2025-01-01T00:00:00Z" */
  created_at: string;
  /** @example 1 */
  id: number;
  /** @example "keyboard" */
  slug: string;
  /** @example "Keyboard" */
  title: string;
}

export interface DtoCategoryRevenueResponse {
  category: string;
  growth: DtoGrowthResponse;
  orders: number;
  products: number;
  revenue: number;
}

export interface DtoCreateOrderItem {
  product_id?: number;
  quantity?: number;
}

export interface DtoCreateOrderRequest {
  items?: DtoCreateOrderItem[];
  /** @example 1 */
  user_id?: number;
}

export interface DtoCreateOrderResponse {
  created_at: string;
  id: number;
  items: DtoOrderItemResponse[];
  user_id: number;
}

export interface DtoCreateProductRequest {
  category_id?: number;
  /** @example 150 */
  price?: number;
  /** @example "Keyboard" */
  title?: string;
}

export interface DtoCursorProductsResponse {
  next_cursor: number;
  products: DtoProductResponse[];
}

export interface DtoCursorUserResponse {
  next_cursor: number;
  users: DtoUserResponse[];
}

export interface DtoDailyPurchases {
  order_date: string;
  purchases: number;
}

export interface DtoDailyStatResponse {
  /** @example "2026-05-11 01:45:24.864701" */
  date: string;
  /** @example 1 */
  orders: number;
  /** @example 120 */
  revenue: number;
}

export interface DtoGrowthResponse {
  sign: string;
  value: number;
}

export interface DtoListCategoryAvaragePriceResponse {
  data: DtoCategoryAveragePrice[];
  total: number;
}

export interface DtoListCategoryResponse {
  data: DtoCategoryResponse[];
  total: number;
}

export interface DtoListCategoryRevenueResponse {
  data: DtoCategoryRevenueResponse[];
  total: number;
}

export interface DtoListDailyPurchasesResponse {
  data: DtoDailyPurchases[];
  total: number;
}

export interface DtoListDailyStatResponse {
  data: DtoDailyStatResponse[];
  total: number;
}

export interface DtoListOrderResponse {
  data: DtoOrderResponse[];
  total: number;
}

export interface DtoListProductResponse {
  data: DtoProductResponse[];
  total: number;
}

export interface DtoListRevenueReportResponse {
  data: DtoRevenueReportResponse[];
  total: number;
}

export interface DtoListUserByMostExpensiveProductResponse {
  data: DtoUserByMostExpensiveProduct[];
  total: number;
}

export interface DtoListUserResponse {
  data: DtoUserResponse[];
  total: number;
}

export interface DtoListUserWithPurchasesResponse {
  data: DtoUserWithPurchases[];
  total: number;
}

export interface DtoOrderItemResponse {
  price: number;
  product_id: number;
  quantity: number;
  title: string;
}

export interface DtoOrderResponse {
  /** @example "2026-05-11 01:45:24.864701" */
  created_at: string;
  /** @example 1 */
  id: number;
  /** @example 1 */
  user_id: number;
}

export interface DtoProductResponse {
  /** @example "Electoronics" */
  category: string;
  /** @example 1 */
  id: number;
  /** @example 150 */
  price: number;
  /** @example "Keyboard" */
  title: string;
}

export interface DtoRevenueReportResponse {
  growth: DtoGrowthResponse;
  revenue: number;
  title: string;
}

export interface DtoStatsOrderResponse {
  /** @example 1.3 */
  averageCheck: number;
  /** @example 1 */
  total: number;
  /** @example 4.2 */
  totalThisMonth: number;
}

export interface DtoTopCategoryResponse {
  revenue?: number;
  title?: string;
}

export interface DtoUserByMostExpensiveProduct {
  /** @example "text@gmail.com" */
  email: string;
  /** @example 1 */
  id: number;
  /** @example "username" */
  name: string;
}

export interface DtoUserResponse {
  /** @example "text@gmail.com" */
  email: string;
  /** @example 1 */
  id: number;
  /** @example "username" */
  name: string;
}

export interface DtoUserWithPurchases {
  /** @example "text@gmail.com" */
  email: string;
  /** @example 1 */
  id: number;
  /** @example "username" */
  name: string;
  /** @example 1 */
  purchases: number;
}

export interface DtoWidgetStatsResponse {
  topCategory?: DtoTopCategoryResponse;
  totalCategories?: number;
  totalProducts?: number;
}

export interface CategoriesListParams {
  /** Number of categories to return (default 10) */
  limit?: number;
  /** Number of categories to skip (default 0) */
  offset?: number;
}

export type CategoriesListData = DtoListCategoryResponse;

export type AvaragePriceListData = DtoListCategoryAvaragePriceResponse;

export interface RevenueListParams {
  /** Number of categories to return (default 10) */
  limit?: number;
  /** Number of categories to skip (default 0) */
  offset?: number;
}

export type RevenueListData = DtoListCategoryRevenueResponse;

export type StatsListData = DtoWidgetStatsResponse;

export interface OrdersListParams {
  /** Number of products to return (default 10) */
  limit?: number;
  /** Number of products to skip (default 0) */
  offset?: number;
}

export type OrdersListData = DtoListOrderResponse;

export type OrdersCreateData = DtoCreateOrderResponse;

export type DailyPurchasesListData = DtoListDailyPurchasesResponse;

export interface DailyStatsListParams {
  /** Number of products to return (default 10) */
  limit?: number;
  /** Number of products to skip (default 0) */
  offset?: number;
}

export type DailyStatsListData = DtoListDailyStatResponse;

export type StatsListResult = DtoStatsOrderResponse;

export interface ItemsListParams {
  /** Order ID */
  orderId: number;
}

export type ItemsListData = DtoOrderItemResponse[];

export interface ProductsListParams {
  /** Number of products to return (default 10) */
  limit?: number;
  /** Number of products to skip (default 0) */
  offset?: number;
}

export type ProductsListData = DtoListProductResponse;

export type ProductsCreateData = DtoProductResponse;

export interface CursorListParams {
  /** Number of products to return (default 10) */
  limit?: number;
  /** Last product ID from previous page */
  cursor?: number;
}

export type CursorListData = DtoCursorProductsResponse;

export interface RevenueReportListParams {
  /** Number of products to return (default 10) */
  limit?: number;
  /** Number of products to skip (default 0) */
  offset?: number;
}

export type RevenueReportListData = DtoListRevenueReportResponse;

export interface UsersListParams {
  /** Number of users to return (default 10) */
  limit?: number;
  /** Number of users to skip (default 0) */
  offset?: number;
}

export type UsersListData = DtoListUserResponse;

export type ByMostExpensiveProductListData =
  DtoListUserByMostExpensiveProductResponse;

export interface CursorListParams2 {
  /** Number of users to return (default 10) */
  limit?: number;
  /** Last users ID from previous page */
  cursor?: number;
}

export type CursorListResult = DtoCursorUserResponse;

export interface SearchListParams {
  /** Field to search by */
  field: "email" | "name";
  /** Value to search for */
  value: string;
}

export type SearchListData = DtoListUserResponse;

export type Top3UsersListData = DtoListUserWithPurchasesResponse;
