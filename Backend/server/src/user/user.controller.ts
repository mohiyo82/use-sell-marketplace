import { Body, Controller, Post, Get, Patch, Delete, Param, HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from '../auth/dtos/create-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // GET /users - return all users
  @Get()
  async findAll() {
    try {
      const users = await this.userService.findAll();
      return { success: true, data: users };
    } catch (err) {
      console.error(err);
      throw new HttpException({ success: false, error: 'Failed to fetch users' }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    try {
      const user = await this.userService.createUser(dto);
      return { success: true, data: { message: 'User registered successfully', userId: user.id } };
    } catch (err) {
      console.error(err);
      throw new HttpException({ success: false, error: 'Failed to register user' }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body('active') active: boolean) {
    try {
      const updated = await this.userService.updateActive(id, active);
      return { success: true, data: updated };
    } catch (err) {
      console.error(err);
      throw new HttpException({ success: false, error: 'Failed to update user' }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.userService.deleteUser(id);
      return { success: true, data: { message: 'User deleted' } };
    } catch (err) {
      console.error(err);
      throw new HttpException({ success: false, error: 'Failed to delete user' }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
