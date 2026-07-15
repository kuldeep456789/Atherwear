import { Controller, Get, Post, Headers, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/schemas/user.schema';
import { Order } from '../orders/schemas/order.schema';
import { ReturnRequest } from '../returns/schemas/return.schema';

@Controller('admin')
export class AdminController {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    @InjectModel(ReturnRequest.name) private readonly returnModel: Model<ReturnRequest>,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  @Post('seed')
  async seedAdmin(@Headers('authorization') authorization?: string) {
    const existingAdmin = await this.userModel.findOne({ role: 'admin' }).exec();
    if (existingAdmin) {
      throw new ConflictException('An admin user already exists');
    }
    const token = authorization?.replace(/^Bearer\s+/i, '');
    if (!token) throw new UnauthorizedException('Bearer token is required');
    const payload = await this.jwtService.verifyAsync<{ sub: string }>(token);
    await this.userModel.findByIdAndUpdate(payload.sub, { role: 'admin' }).exec();
    return { message: 'You are now an admin. Please log in again.' };
  }

  @Get('dashboard')
  async getDashboard(@Headers('authorization') authorization?: string) {
    await this.requireAdmin(authorization);

    const totalUsers = await this.userModel.countDocuments().exec();
    const totalOrders = await this.orderModel.countDocuments().exec();
    const pendingReturns = await this.returnModel.countDocuments({ status: 'pending' }).exec();
    const totalRevenue = await this.orderModel
      .aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ])
      .exec();
    const revenue = totalRevenue[0]?.total || 0;

    const recentOrders = await this.orderModel
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name email')
      .lean()
      .exec();

    return {
      stats: { totalUsers, totalOrders, pendingReturns, totalRevenue: revenue },
      recentOrders,
    };
  }

  @Get('users')
  async getUsers(@Headers('authorization') authorization?: string) {
    await this.requireAdmin(authorization);
    const users = await this.userModel.find().sort({ createdAt: -1 }).lean().exec();
    return { users };
  }

  @Get('orders')
  async getOrders(@Headers('authorization') authorization?: string) {
    await this.requireAdmin(authorization);
    const orders = await this.orderModel.find().sort({ createdAt: -1 }).populate('userId', 'name email').lean().exec();
    return { orders };
  }

  @Get('returns')
  async getReturns(@Headers('authorization') authorization?: string) {
    await this.requireAdmin(authorization);
    const returns = await this.returnModel.find().sort({ createdAt: -1 }).lean().exec();
    return { returns };
  }

  private async requireAdmin(authorization?: string) {
    const token = authorization?.replace(/^Bearer\s+/i, '');
    if (!token) throw new UnauthorizedException('Bearer token is required');
    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(token);
      const user = await this.usersService.findById(payload.sub);
      if (!user || user.role !== 'admin') throw new UnauthorizedException('Admin access required');
      return user;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
