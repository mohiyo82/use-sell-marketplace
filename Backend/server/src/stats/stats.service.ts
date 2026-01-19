import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class StatsService {
  private prisma = new PrismaClient();

  async getUserStats() {
    // Total users
    const totalUsers = await this.prisma.user.count();

    // Active users = isActive = true
    const activeUsers = await this.prisma.user.count({
      where: { isActive: true },
    });

    return { totalUsers, activeUsers };
  }
}
