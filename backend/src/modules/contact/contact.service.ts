import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contact } from './schemas/contact.schema';

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(Contact.name) private contactModel: Model<Contact>
  ) {}

  async createContactMessage(data: { name: string; email: string; subject: string; message: string }) {
    try {
      const newContact = new this.contactModel(data);
      await newContact.save();
      return { success: true, message: 'Message sent successfully' };
    } catch (error) {
      throw new InternalServerErrorException('Failed to save contact message');
    }
  }

  async findAll() {
    try {
      return await this.contactModel.find().sort({ createdAt: -1 }).exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch contact messages');
    }
  }

  async findByEmail(email: string) {
    try {
      const clean = (email || '').trim();
      if (!clean) return [];
      return await this.contactModel.find({
        email: { $regex: new RegExp(`^${clean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      }).sort({ createdAt: -1 }).exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch user messages');
    }
  }

  async updateStatus(id: string, status: string) {
    try {
      const updated = await this.contactModel.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      ).exec();
      return updated;
    } catch (error) {
      throw new InternalServerErrorException('Failed to update message status');
    }
  }

  async replyMessage(id: string, adminReply: string, status = 'resolved') {
    try {
      const updated = await this.contactModel.findByIdAndUpdate(
        id,
        { adminReply, repliedAt: new Date(), status },
        { new: true }
      ).exec();
      return updated;
    } catch (error) {
      throw new InternalServerErrorException('Failed to save reply');
    }
  }
}
