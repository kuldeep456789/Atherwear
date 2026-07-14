import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model, Types } from 'mongoose';
import { UsersService } from '../users/users.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { ReturnRequest } from './schemas/return.schema';

@Injectable()
export class ReturnsService {
  constructor(
    @InjectModel(ReturnRequest.name) private readonly returnModel: Model<ReturnRequest>,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async create(token: string, dto: CreateReturnDto) {
    const user = await this.resolveUser(token);
    if (!dto.orderId || !dto.productId || !dto.reason) {
      throw new BadRequestException('orderId, productId, and reason are required');
    }
    const ret = await this.returnModel.create({
      userId: new Types.ObjectId(user.id),
      orderId: dto.orderId,
      productId: dto.productId,
      productName: dto.productName,
      productImage: dto.productImage,
      productSize: dto.productSize,
      productColor: dto.productColor,
      reason: dto.reason,
      description: dto.description,
      images: dto.images || [],
      exchangeSize: dto.exchangeSize,
      pickupAddress: dto.pickupAddress,
    });
    return { return: ret };
  }

  async getMyReturns(token: string) {
    const user = await this.resolveUser(token);
    const returns = await this.returnModel
      .find({ userId: new Types.ObjectId(user.id) })
      .sort({ createdAt: -1 })
      .exec();
    return { returns };
  }

  async getById(token: string, id: string) {
    const user = await this.resolveUser(token);
    const ret = await this.returnModel
      .findOne({ _id: id, userId: new Types.ObjectId(user.id) })
      .exec();
    if (!ret) throw new BadRequestException('Return request not found');
    return { return: ret };
  }

  async getAll(token: string) {
    await this.resolveUser(token);
    const returns = await this.returnModel.find().sort({ createdAt: -1 }).exec();
    return { returns };
  }

  async updateStatus(token: string, id: string, body: { status: string; adminRemarks?: string }) {
    await this.resolveUser(token);
    const ret = await this.returnModel.findByIdAndUpdate(
      id,
      { $set: { status: body.status, ...(body.adminRemarks ? { adminRemarks: body.adminRemarks } : {}) } },
      { new: true },
    ).exec();
    if (!ret) throw new BadRequestException('Return request not found');
    return { return: ret };
  }

  private async resolveUser(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(token);
      const user = await this.usersService.findById(payload.sub);
      if (!user) throw new UnauthorizedException('User no longer exists');
      return user;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
