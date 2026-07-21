import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ContactService } from './contact.service';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async createMessage(
    @Body() body: { name: string; email: string; subject: string; message: string }
  ) {
    if (!body.name || !body.email || !body.subject || !body.message) {
      throw new BadRequestException('All fields are required');
    }
    return this.contactService.createContactMessage(body);
  }
}
