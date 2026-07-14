import { Body, Controller, Get, Headers, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('send-mobile-otp')
  sendMobileOtp(@Body() body: { phone: string }) {
    return this.authService.sendMobileOtp(body.phone);
  }

  @Post('verify-mobile-otp')
  verifyMobileOtp(@Body() body: { phone: string; code: string }) {
    return this.authService.verifyMobileOtp(body.phone, body.code);
  }

  @Post('send-email-otp')
  sendEmailOtp(@Body() body: { email: string }) {
    return this.authService.sendEmailOtp(body.email);
  }

  @Post('verify-email-otp')
  verifyEmailOtp(@Body() body: { email: string; code: string }) {
    return this.authService.verifyEmailOtp(body.email, body.code);
  }

  @Post('reset-password')
  resetPassword(@Body() body: { email: string; password: string }) {
    return this.authService.resetPassword(body.email, body.password);
  }

  @Get('me')
  me(@Headers('authorization') authorization?: string) {
    const token = authorization?.replace(/^Bearer\s+/i, '');
    if (!token) throw new UnauthorizedException('Bearer token is required');
    return this.authService.me(token);
  }
}
