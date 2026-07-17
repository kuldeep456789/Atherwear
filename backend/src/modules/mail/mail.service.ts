import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private resend: any = null;
  private fromEmail = '';

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@vastra.com';
    
    if (apiKey) {
      import('resend').then(({ Resend }) => {
        this.resend = new Resend(apiKey);
      }).catch(err => {
        this.logger.error('Failed to import resend SDK', err);
      });
    } else {
      this.logger.warn('Resend API key not found. Emails will be logged to console in dev mode.');
    }
  }

  private getTemplatePath(templateName: string): string {
    return path.join(process.cwd(), 'src', 'modules', 'mail', 'templates', `${templateName}.html`);
  }

  private loadTemplate(templateName: string, variables: Record<string, any>): string {
    try {
      let html = fs.readFileSync(this.getTemplatePath(templateName), 'utf-8');
      for (const [key, value] of Object.entries(variables)) {
        html = html.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
      }
      return html;
    } catch (err) {
      this.logger.error(`Error loading template ${templateName}`, err);
      return '';
    }
  }

  private async sendEmail(to: string, subject: string, html: string) {
    if (!this.resend) {
      this.logger.log(`[DEV EMAIL] To: ${to} | Subject: ${subject}`);
      return;
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html,
      });
      if (error) {
        this.logger.error(`Resend API Error: ${error.message}`);
      } else {
        this.logger.log(`Email successfully sent to ${to} (ID: ${data?.id})`);
      }
    } catch (err) {
      this.logger.error('Exception while sending email via Resend', err);
    }
  }

  async sendOtp(name: string, email: string, otp: string, expiry: string = '10') {
    const html = this.loadTemplate('otp', { name, otp, expiry });
    if (!html) return;
    await this.sendEmail(email, 'Your VASTRA Verification Code', html);
  }

  async sendWelcome(name: string, email: string) {
    const html = this.loadTemplate('welcome', { name });
    if (!html) return;
    await this.sendEmail(email, 'Welcome to VASTRA!', html);
  }

  async sendForgotPassword(name: string, email: string, otp: string, expiry: string = '10') {
    const html = this.loadTemplate('forgot-password', { name, otp, expiry });
    if (!html) return;
    await this.sendEmail(email, 'Reset your VASTRA password', html);
  }

  async sendOrderConfirmation(name: string, email: string, orderId: string, amount: string) {
    const html = this.loadTemplate('order-confirmation', { name, orderId, amount });
    if (!html) return;
    await this.sendEmail(email, `Order Confirmation - #${orderId}`, html);
  }

  async sendPaymentSuccess(name: string, email: string, orderId: string, amount: string) {
    const html = this.loadTemplate('payment-success', { name, orderId, amount });
    if (!html) return;
    await this.sendEmail(email, `Payment Received - #${orderId}`, html);
  }

  async sendOrderShipped(name: string, email: string, orderId: string, trackingLink: string) {
    const html = this.loadTemplate('shipped', { name, orderId, trackingLink });
    if (!html) return;
    await this.sendEmail(email, `Your order #${orderId} has shipped!`, html);
  }

  async sendOrderDelivered(name: string, email: string, orderId: string) {
    const html = this.loadTemplate('delivered', { name, orderId });
    if (!html) return;
    await this.sendEmail(email, `Your order #${orderId} has been delivered`, html);
  }

  async sendRefund(name: string, email: string, orderId: string, amount: string) {
    const html = this.loadTemplate('refund', { name, orderId, amount });
    if (!html) return;
    await this.sendEmail(email, `Refund Processed - #${orderId}`, html);
  }
}
