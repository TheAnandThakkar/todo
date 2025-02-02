import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  // Create hashed password
  async createHashedPassword(password: string) {
    try {
      const saltOrRounds = Number(this.configService.get<number>('SALT')) || 10;
      return await bcrypt.hash(password, saltOrRounds);
    } catch (error) {
      console.error('Error hashing password:', error);
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Generate JWT Token
  generateToken(user: { id: number; email: string }) {
    try {
      return this.jwtService.sign(user, {
        expiresIn: '1h',
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch (error) {
      console.error('Error generating JWT token:', error);
      throw new HttpException(
        'Could not generate token',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async create(body: UserDto, response: Response) {
    try {
      // Check if email already exists
      const existingEmail = await this.userRepository.findOne({
        where: { email: body.email },
      });

      if (existingEmail) {
        return response.status(400).json({
          success: false,
        });
      }

      // Create user
      const user = new User();
      user.email = body.email;
      user.password = await this.createHashedPassword(body.password); // Hash password

      // Save user
      const userData = await this.userRepository.save(user);

      // Generate token
      const token = this.generateToken({
        id: userData.id,
        email: userData.email,
      });

      return response.status(200).json({
        success: true,
        token,
      });
    } catch (error) {
      console.error('Error in create method:', error);
      return response.status(500).json({
        message: 'Internal server error',
      });
    }
  }

  async login(body: UserDto, response: Response) {
    try {
      // Check if user exists
      const user = await this.userRepository.findOne({
        where: { email: body.email },
      });

      if (!user) {
        return response.status(400).json({
          success: false,
        });
      }

      // Compare password
      const isPasswordMatch = await bcrypt.compare(
        body.password,
        user.password,
      );
      if (!isPasswordMatch) {
        return response.status(400).json({
          success: false,
        });
      }

      // Generate token
      const token = this.generateToken({ id: user.id, email: user.email });

      return response.status(200).json({
        success: true,
        token,
      });
    } catch (error) {
      console.error('Error in login method:', error);
      return response.status(500).json({
        message: 'Internal server error',
      });
    }
  }
}
