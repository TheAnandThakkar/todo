import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from './dto/user.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: UserDto, @Res() response: Response) {
    return this.authService.create(body, response);
  }

  @Post('login')
  async login(@Body() body: UserDto, @Res() response: Response) {
    return this.authService.login(body, response);
  }
}
