import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { AuthModule } from '../../auth/auth.module';
import { OrdersService } from './orders.service';
import { OrdersRepository } from './orders.repository';
import { OrdersResolver } from './orders.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), AuthModule],
  providers: [OrdersRepository, OrdersService, OrdersResolver],
})
export class OrdersModule {}
