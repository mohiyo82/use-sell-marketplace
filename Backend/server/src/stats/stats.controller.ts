import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
  constructor(private statsService: StatsService) {}

  @Get('users')
  async getUsersStats() {
    try {
      const stats = await this.statsService.getUserStats();
      return { success: true, data: stats };
    } catch (err) {
      console.error(err);
      throw new HttpException({ success: false, error: 'Failed to fetch user stats' }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
