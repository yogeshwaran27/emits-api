import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import configurations from 'src/config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromCookies(request);

    if (!token) {
      throw new UnauthorizedException('No access token found in cookies');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: configurations.JWT_CONSTANT,
      });
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }

    return true;
  }

  private extractTokenFromCookies(request: Request): string | undefined {
    return request.cookies?.access_token;
  }
}
