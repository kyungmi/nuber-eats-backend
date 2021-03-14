import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrderResolver } from './orders.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  providers: [OrdersService, OrderResolver],
})
export class OrdersModule {}
