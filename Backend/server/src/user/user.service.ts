
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../auth/dtos/create-user.dto';

@Injectable()
export class UserService {

  constructor(private prisma: PrismaService) {}

  async createUser(dto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingUser) throw new Error('User already exists');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: { name: dto.name, email: dto.email, password: hashedPassword },
    });
  }

  async findAll() {
    // Only return safe fields and normalize `isActive` -> `active` for frontend
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { id: 'desc' },
    });

    return users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      active: u.isActive,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));
  }

  async updateActive(id: number | string, active: boolean) {
    const uid = Number(id);
    const updated = await this.prisma.user.update({
      where: { id: uid },
      data: { isActive: active },
      select: { id: true, isActive: true },
    });

    return { id: updated.id, active: updated.isActive };
  }

  async deleteUser(id: number | string) {
    const uid = Number(id);
    return this.prisma.user.delete({ where: { id: uid } });
  }
}
