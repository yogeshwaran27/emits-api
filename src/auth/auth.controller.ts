import { Body, Controller, Post, Res, HttpCode, HttpStatus, Get, UseGuards, Req } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import configurations from 'src/config';
import { AuthGuard } from './auth.gaurd';

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
      res.cookie('name', result.name, {
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

      const { access_token,mail,name, ...rest } = result;
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

  @Post('reset-token-store')
  @HttpCode(HttpStatus.OK)
  async setResetToken(
    @Body() tokenDto: Record<string, any>,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (tokenDto.token && tokenDto.email) {
      res.cookie('access_token', tokenDto.token, {
        httpOnly: configurations.NODE_ENV=="production",
        secure: configurations.NODE_ENV=="production",
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000,
        path: '/',
      });
      res.cookie('mail', tokenDto.email, {
        httpOnly: configurations.NODE_ENV=="production",
        secure: configurations.NODE_ENV=="production",
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000,
        path: '/',
      });
      res.cookie('name', tokenDto.name, {
        httpOnly: configurations.NODE_ENV=="production",
        secure: configurations.NODE_ENV=="production",
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000,
        path: '/',
      });
      return {"message":"success"};
    } else {
      return {"message":"fail"}
    }
  }

  @Get('/me')
  @UseGuards(AuthGuard)
  getProfile(@Req() req) {
    return {
      mail: req.cookies.mail,
      name: req.cookies.name,
    };
  }

}
