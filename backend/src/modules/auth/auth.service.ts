import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    this.validateRegisterDto(registerDto);

    const passwordHash = await bcrypt.hash(registerDto.password, 12);
    const user = await this.usersService.create(
      registerDto.name,
      registerDto.email.toLowerCase(),
      passwordHash,
    );

    return this.authResponse(user);
  }

  async login(loginDto: LoginDto) {
    this.validateLoginDto(loginDto);

    const user = await this.usersService.findByEmailWithPassword(
      loginDto.email.toLowerCase(),
    );

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(loginDto.password, user.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.authResponse(this.usersService.toSafeUser(user));
  }

  async me(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(token);
      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User no longer exists');
      }

      return { user: this.toClientUser(user) };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private authResponse(user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  }) {
    return {
      user: this.toClientUser(user),
      accessToken: this.jwtService.sign({
        sub: user.id,
        email: user.email,
      }),
    };
  }

  private toClientUser(user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  }) {
    return {
      _id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    };
  }

  private validateRegisterDto(registerDto: RegisterDto) {
    if (!registerDto.name || !registerDto.email || !registerDto.password) {
      throw new BadRequestException('name, email, and password are required');
    }

    if (registerDto.password.length < 6) {
      throw new BadRequestException('password must be at least 6 characters');
    }
  }

  private validateLoginDto(loginDto: LoginDto) {
    if (!loginDto.email || !loginDto.password) {
      throw new BadRequestException('email and password are required');
    }
  }
}
