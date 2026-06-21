import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItemResponse } from './dto/order-item-response';
import { DailyPurchasesResponse } from './dto/daily-purchases-response';
import { DailyStatsResponse } from './dto/daily-stats-response';

@Injectable()
export class OrdersRepository {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async count(): Promise<number> {
    return this.orderRepository.count();
  }

  async list(limit: number, offset: number): Promise<{ items: Order[]; total: number }> {
    const [items, total] = await this.orderRepository.findAndCount({
      skip: offset,
      take: limit,
      order: { id: 'ASC' },
    });

    return { items, total };
  }

  async getOrderItems(orderId: number): Promise<OrderItemResponse[]> {
    const rows = await this.dataSource.query(
      `SELECT * FROM get_order_items_by_order_id($1)`,
      [orderId],
    );

    return rows.map((r: any) => ({
      productId: r.product_id,
      title: r.title,
      price: Number(r.price),
      quantity: r.quantity,
    }));
  }

  async getTotalThisMonth(): Promise<number> {
    const row = await this.dataSource.query(
      `SELECT COALESCE(SUM(p.price), 0) as total
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       JOIN orders o ON oi.order_id = o.id
       WHERE o.created_at >= date_trunc('month', CURRENT_DATE)
         AND o.created_at < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'`,
    );

    return Number(row[0]?.total ?? 0);
  }

  async getAverageCheck(): Promise<number> {
    const row = await this.dataSource.query(
      `SELECT COALESCE(SUM(p.price * oi.quantity), 0) / NULLIF(COUNT(DISTINCT o.id), 0) as avg_check
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       JOIN products p ON p.id = oi.product_id`,
    );
    
    return Math.round(Number(row[0]?.avg_check ?? 0) * 100) / 100;
  }

  async getOrdersTrend(): Promise<{ currentPeriod: number; previousPeriod: number }> {
    const rows = await this.dataSource.query(
      `SELECT
         COALESCE(SUM(CASE WHEN created_at >= NOW() - INTERVAL '14 days' THEN 1 ELSE 0 END), 0) AS current_period,
         COALESCE(SUM(CASE WHEN created_at >= NOW() - INTERVAL '28 days'
                           AND created_at < NOW() - INTERVAL '14 days' THEN 1 ELSE 0 END), 0) AS previous_period
       FROM orders
       WHERE created_at >= NOW() - INTERVAL '28 days'`,
    );

    return {
      currentPeriod: Number(rows[0]?.current_period ?? 0),
      previousPeriod: Number(rows[0]?.previous_period ?? 0),
    };
  }

  async listDailyPurchases(): Promise<DailyPurchasesResponse[]> {
    const rows = await this.dataSource.query(
      `SELECT order_date, purchases FROM daily_purchases ORDER BY order_date`,
    );

    return rows.map((r: any) => ({
      orderDate: r.order_date,
      purchases: r.purchases,
    }));
  }

  async getDailyStats(limit: number, offset: number): Promise<{ items: DailyStatsResponse[]; total: number }> {
    const countRow = await this.dataSource.query(
      `SELECT COUNT(*) AS total FROM (
         SELECT o.created_at
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         JOIN orders o ON oi.order_id = o.id
         GROUP BY o.created_at
       ) AS sub`,
    );
    const total = Number(countRow[0]?.total ?? 0);

    const rows = await this.dataSource.query(
      `SELECT o.created_at as "date",
              COUNT(DISTINCT o.id) as "orders",
              SUM(p.price) as "revenue"
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       JOIN orders o ON oi.order_id = o.id
       GROUP BY o.created_at
       ORDER BY o.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    const items = rows.map((r: any) => ({
      date: r.date,
      orders: Number(r.orders),
      revenue: Number(r.revenue),
    }));

    return { items, total };
  }
}
