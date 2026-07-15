import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { ReturnRequest, ReturnRequestSchema } from '../returns/schemas/return.schema';
import { UsersModule } from '../users/users.module';
import { AdminController } from './admin.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Order.name, schema: OrderSchema },
      { name: ReturnRequest.name, schema: ReturnRequestSchema },
    ]),
    JwtModule,
    UsersModule,
  ],
  controllers: [AdminController],
})
export class AdminModule {}
