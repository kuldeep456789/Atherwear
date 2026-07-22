import { ConflictException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

export type SafeUser = {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  avatar?: string;
  gender?: string;
  dateOfBirth?: Date;
};

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) { }

  async create(name: string, email: string, password: string, phone?: string, role: string = 'customer'): Promise<SafeUser> {
    const existingUser = await this.userModel.exists({ email });
    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }
    const user = await this.userModel.create({ name, email, password, role, ...(phone ? { phone } : {}) });
    return this.toSafeUser(user);
  }

  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).select('+password').exec();
  }

  async findByPhone(phone: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ phone }).exec();
  }

  async findById(id: string): Promise<SafeUser | null> {
    const user = await this.userModel.findById(id).exec();
    return user ? this.toSafeUser(user) : null;
  }

  async findByEmail(email: string): Promise<SafeUser | null> {
    const user = await this.userModel.findOne({ email }).exec();
    return user ? this.toSafeUser(user) : null;
  }

  async updatePassword(id: string, password: string): Promise<void> {
    const hash = await bcrypt.hash(password, 12);
    await this.userModel.findByIdAndUpdate(id, { password: hash }).exec();
  }

  toSafeUser(user: UserDocument): SafeUser {
    const trimmedName = (user.name || '').trim();
    const [firstName, ...rest] = trimmedName.split(/\s+/);
    return {
      id: user.id,
      firstName: firstName || trimmedName,
      lastName: rest.join(' '),
      name: trimmedName,
      email: user.email,
      phone: user.phone,
      role: user.role || 'customer',
      avatar: user.avatar,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
    };
  }

  async updateProfile(userId: string, data: UpdateProfileDto): Promise<SafeUser> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');

    if (data.email && data.email !== user.email) {
      const normalizedEmail = data.email.toLowerCase().trim();
      const existing = await this.userModel.findOne({ email: normalizedEmail }).exec();
      if (existing) throw new ConflictException('Email is already in use');
      user.email = normalizedEmail;
    }

    if (data.name !== undefined) user.name = data.name.trim();
    if (data.phone !== undefined && data.phone !== user.phone) {
      const trimmedPhone = data.phone.trim();
      if (trimmedPhone) {
        const existingPhone = await this.userModel.findOne({ phone: trimmedPhone }).exec();
        if (existingPhone && existingPhone.id !== userId) {
          throw new ConflictException('Phone number is already in use');
        }
      }
      user.phone = trimmedPhone || undefined;
    }
    if (data.avatar !== undefined) user.avatar = data.avatar || undefined;
    if (data.gender !== undefined) user.gender = data.gender || undefined;
    if (data.dateOfBirth !== undefined) user.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : undefined;

    await user.save();
    return this.toSafeUser(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.userModel.findById(userId).select('+password').exec();
    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch) throw new BadRequestException('Current password is incorrect');

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(dto.newPassword)) {
      throw new BadRequestException(
        'Password must contain at least 8 char',
      );
    }

    if (dto.newPassword !== dto.confirmNewPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const hash = await bcrypt.hash(dto.newPassword, 12);
    user.password = hash;
    await user.save();
  }
}
