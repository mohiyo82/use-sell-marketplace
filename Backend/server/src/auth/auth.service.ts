import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService
  ) {}

  async register(data: { name: string; email: string; password: string }) {
    const { name, email, password } = data;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user) throw new BadRequestException('Email already registered');

    const hashed = await bcrypt.hash(password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
      },
    });

    const token = this.jwt.sign({ id: newUser.id, role: (newUser as any).role });

    const { password: _password, ...userNoPassword } = newUser as any;

    return { user: userNoPassword, token };
  }

  async login(data: { email: string; password: string }) {
    const { email, password } = data;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    // Mark user as active on successful login
    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: { isActive: true },
    });

    const token = this.jwt.sign({ id: updatedUser.id, role: (updatedUser as any).role });

    const { password: _password, ...userNoPassword } = updatedUser as any;

    return { user: userNoPassword, token };
  }

  async logout(userId: number) {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    const { password: _password, ...userNoPassword } = updatedUser as any;

    return { user: userNoPassword };
  }
}
