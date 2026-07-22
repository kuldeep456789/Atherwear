import { Controller, Post, Body, BadRequestException, Get, Patch, Param } from '@nestjs/common';
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

  @Get()
  async getMessages() {
    return this.contactService.findAll();
  }

  @Get('user/:email')
  async getUserMessages(@Param('email') email: string) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }
    return this.contactService.findByEmail(email);
  }

  @Patch(':id/status')
  @Post(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string }
  ) {
    if (!body.status) {
      throw new BadRequestException('Status is required');
    }
    return this.contactService.updateStatus(id, body.status);
  }

  @Patch(':id/reply')
  @Post(':id/reply')
  async replyMessage(
    @Param('id') id: string,
    @Body() body: { adminReply: string; status?: string }
  ) {
    if (!body.adminReply) {
      throw new BadRequestException('Reply text is required');
    }
    return this.contactService.replyMessage(id, body.adminReply, body.status || 'resolved');
  }
}
