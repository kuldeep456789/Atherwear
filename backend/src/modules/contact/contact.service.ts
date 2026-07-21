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
}
