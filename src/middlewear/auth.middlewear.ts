import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        throw new UnauthorizedException('Access denied');
      }

      const secretKey = this.configService.get<string>('JWT_SECRET');

      if (!secretKey) {
        throw new Error('Something went wrong');
      }

      // Verify token
      const decoded = jwt.verify(token, secretKey);
      req['user'] = decoded;

      next(); // Proceed to the next middleware or controller
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message || 'Unauthorized acceess',
      });
    }
  }
}
