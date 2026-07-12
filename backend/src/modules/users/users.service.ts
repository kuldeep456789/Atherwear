import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

export type SafeUser = {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  role: string;
};

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async create(name: string, email: string, password: string): Promise<SafeUser> {
    const existingUser = await this.userModel.exists({ email });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const user = await this.userModel.create({ name, email, password });

    return this.toSafeUser(user);
  }

  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).select('+password').exec();
  }

  async findById(id: string): Promise<SafeUser | null> {
    const user = await this.userModel.findById(id).exec();

    return user ? this.toSafeUser(user) : null;
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
      role: 'customer',
    };
  }
}
