import { Body, Controller, Post, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import configurations from 'src/config';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body() signInDto: Record<string, any>,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.signIn(signInDto.username, signInDto.password);

    if ('access_token' in result) {
      res.cookie('access_token', result.access_token, {
        httpOnly: configurations.NODE_ENV=="production",
        secure: configurations.NODE_ENV=="production",
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000,
        path: '/',
      });
      res.cookie('mail', result.mail, {
        httpOnly: configurations.NODE_ENV=="production",
        secure: configurations.NODE_ENV=="production",
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000,
        path: '/',
      });

      const { access_token, ...rest } = result;
      return rest;
    } else {
      return result;
    }
  }
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('mail'); 
    return { message: 'Logged out successfully' };
  }

}
