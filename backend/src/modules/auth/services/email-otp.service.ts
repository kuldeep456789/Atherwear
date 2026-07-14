import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailOtpService {
  private readonly logger = new Logger(EmailOtpService.name);
  private enabled = false;
  private resendApiKey = '';
  private fromEmail = '';

  constructor() {
    this.resendApiKey = process.env.RESEND_API_KEY || '';
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@vastra.com';
    if (this.resendApiKey && this.resendApiKey.length > 0) {
      this.enabled = true;
    } else {
      this.logger.warn('Resend not configured — email OTPs will be logged to console in dev mode');
    }
  }

  async sendOTP(email: string, code: string): Promise<void> {
    if (!this.enabled) {
      this.logger.log(`[DEV] Email OTP for ${email}: ${code}`);
      return;
    }
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(this.resendApiKey!);
      await resend.emails.send({
        from: this.fromEmail ?? 'noreply@vastra.com',
        to: email,
        subject: 'Your VASTRA OTP Code',
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="font-size: 24px; margin-bottom: 8px;">VASTRA</h2>
            <p style="color: #555; font-size: 14px;">Use the following OTP to reset your password:</p>
            <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 12px; margin: 16px 0;">${code}</div>
            <p style="color: #999; font-size: 12px;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
          </div>
        `,
      });
    } catch (err) {
      this.logger.error('Failed to send email OTP', err);
    }
  }
}
