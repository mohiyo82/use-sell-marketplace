import { Body, Controller, Post, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    try {
      const result = await this.authService.register(body as any);
      return { success: true, data: result };
    } catch (err) {
      console.error(err);
      throw new HttpException({ success: false, error: 'Failed to register' }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    try {
      const result = await this.authService.login(body as any);
      return { success: true, data: result };
    } catch (err) {
      console.error(err);
      throw new HttpException({ success: false, error: 'Failed to login' }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  @Post('logout')
  async logout(@Body('userId') userId: number) {
    try {
      if (!userId) throw new BadRequestException('Missing userId');
      const result = await this.authService.logout(userId);
      return { success: true, data: result };
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      console.error(err);
      throw new HttpException({ success: false, error: 'Failed to logout' }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
