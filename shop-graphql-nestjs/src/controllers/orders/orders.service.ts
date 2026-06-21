import { Injectable } from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { Order } from './entities/order.entity';
import { OrderItemResponse } from './dto/order-item-response';
import { DailyPurchasesResponse } from './dto/daily-purchases-response';
import { DailyStatsResponse } from './dto/daily-stats-response';
import { OrdersTrendResponse } from './dto/orders-trend-response';
import { GrowthResponse } from '../users/dto/growth-response';

@Injectable()
export class OrdersService {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async count(): Promise<number> {
    return this.ordersRepository.count();
  }

  async list(limit: number, offset: number): Promise<{ items: Order[]; total: number }> {
    return this.ordersRepository.list(limit, offset);
  }

  async getOrderItems(orderId: number): Promise<OrderItemResponse[]> {
    return this.ordersRepository.getOrderItems(orderId);
  }

  async getStats(): Promise<{ total: number; totalThisMonth: number; averageCheck: number }> {
    const total = await this.ordersRepository.count();
    const totalThisMonth = await this.ordersRepository.getTotalThisMonth();
    const averageCheck = await this.ordersRepository.getAverageCheck();
    
    return { total, totalThisMonth, averageCheck };
  }

  async getOrdersTrend(): Promise<OrdersTrendResponse> {
    const { currentPeriod, previousPeriod } = await this.ordersRepository.getOrdersTrend();

    const rawGrowth = previousPeriod > 0
      ? ((currentPeriod - previousPeriod) / previousPeriod) * 100
      : 0;

    const value = Math.round(Math.abs(rawGrowth) * 10) / 10;
    const sign = rawGrowth >= 0 ? '+' : '-';

    return {
      currentPeriod,
      previousPeriod,
      growth: { value, sign } as GrowthResponse,
    };
  }

  async listDailyPurchases(): Promise<DailyPurchasesResponse[]> {
    return this.ordersRepository.listDailyPurchases();
  }

  async getDailyStats(limit: number, offset: number): Promise<{ items: DailyStatsResponse[]; total: number }> {
    return this.ordersRepository.getDailyStats(limit, offset);
  }
}
