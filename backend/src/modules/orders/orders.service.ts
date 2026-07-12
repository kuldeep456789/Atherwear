import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model, Types } from 'mongoose';
import { UsersService } from '../users/users.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './schemas/order.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async getOrders(token: string) {
    const user = await this.resolveUser(token);
    const orders = await this.orderModel
      .find({ userId: new Types.ObjectId(user.id) })
      .sort({ createdAt: -1 })
      .exec();

    return { orders };
  }

  async getOrder(token: string, id: string) {
    const user = await this.resolveUser(token);
    const order = await this.orderModel
      .findOne({ _id: id, userId: new Types.ObjectId(user.id) })
      .exec();

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    return { order };
  }

  async createOrder(token: string, dto: CreateOrderDto) {
    const user = await this.resolveUser(token);

    if (!dto.items?.length) {
      throw new BadRequestException('items are required');
    }

    if (dto.totalAmount == null || dto.totalAmount < 0) {
      throw new BadRequestException('totalAmount is required');
    }

    const paymentMethod = dto.paymentMethod === 'COD' ? 'COD' : 'Razorpay';
    const paymentStatus = paymentMethod === 'COD' ? 'pending' : 'unpaid';

    const order = await this.orderModel.create({
      userId: new Types.ObjectId(user.id),
      items: dto.items,
      totalAmount: dto.totalAmount,
      status: 'pending',
      paymentProvider: paymentMethod,
      paymentStatus,
    });

    return {
      order,
      payment: {
        provider: paymentMethod,
        status: paymentStatus,
      },
    };
  }

  private async resolveUser(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(token);
      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User no longer exists');
      }

      return user;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
