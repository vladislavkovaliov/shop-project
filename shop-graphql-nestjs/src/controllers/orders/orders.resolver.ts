import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { AuthGuard } from '../../guards/auth.guard';
import { OrderItemResponse } from './dto/order-item-response';
import { DailyPurchasesResponse } from './dto/daily-purchases-response';
import { DailyStatsResponse } from './dto/daily-stats-response';
import { StatsOrderResponse } from './dto/stats-order-response';
import { OrdersTrendResponse } from './dto/orders-trend-response';
import { PaginatedOrdersResponse } from './dto/paginated-orders-response';
import { PaginatedDailyStatsResponse } from './dto/paginated-daily-stats-response';

@Resolver(() => Order)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  @Query(() => Int)
  async orderCount(): Promise<number> {
    return this.ordersService.count();
  }

  @Query(() => OrdersTrendResponse)
  async ordersTrend(): Promise<OrdersTrendResponse> {
    return this.ordersService.getOrdersTrend();
  }

  @UseGuards(AuthGuard)
  @Query(() => StatsOrderResponse)
  async orderStats(): Promise<StatsOrderResponse> {
    const stats = await this.ordersService.getStats();
    
    return stats;
  }

  @UseGuards(AuthGuard)
  @Query(() => PaginatedOrdersResponse)
  async orders(
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
    @Args('offset', { type: () => Int, defaultValue: 0 }) offset: number,
  ): Promise<PaginatedOrdersResponse> {
    return this.ordersService.list(limit, offset);
  }

  @UseGuards(AuthGuard)
  @Query(() => [OrderItemResponse])
  async orderItems(
    @Args('orderId', { type: () => Int }) orderId: number,
  ): Promise<OrderItemResponse[]> {
    return this.ordersService.getOrderItems(orderId);
  }

  @UseGuards(AuthGuard)
  @Query(() => [DailyPurchasesResponse])
  async dailyPurchases(): Promise<DailyPurchasesResponse[]> {
    return this.ordersService.listDailyPurchases();
  }

  @UseGuards(AuthGuard)
  @Query(() => PaginatedDailyStatsResponse)
  async dailyStats(
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
    @Args('offset', { type: () => Int, defaultValue: 0 }) offset: number,
  ): Promise<PaginatedDailyStatsResponse> {
    return this.ordersService.getDailyStats(limit, offset);
  }
}
