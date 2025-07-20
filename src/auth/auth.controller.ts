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
        secure: false,
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000,
        path: '/',
      });
      res.cookie('name', result.name, {
        httpOnly: configurations.NODE_ENV=="production",
        secure: false,
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000,
        path: '/',
      });
      res.cookie('mail', result.mail, {
        httpOnly: configurations.NODE_ENV=="production",
        secure: false,
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000,
        path: '/',
      });
      res.cookie('company', result.company, {
        httpOnly: configurations.NODE_ENV=="production",
        secure: false,
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000,
        path: '/',
      });
      res.cookie('companyURL', result.companyURL, {
        httpOnly: configurations.NODE_ENV=="production",
        secure: false,
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000,
        path: '/',
      });

      const { access_token,mail,name,companyURL,company, ...rest } = result;
      return rest;
    } else {
      return result;
    }
  }
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('name');
    res.clearCookie('company');
    res.clearCookie('companyURL');   
    res.clearCookie('mail'); 
    return { message: 'Logged out successfully' };
  }

  @Post('reset-token-store')
  @HttpCode(HttpStatus.OK)
  async setResetToken(
    @Body() tokenDto: Record<string, any>,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (tokenDto.token) {
      const resetRecord = await this.authService.findByToken(tokenDto.token);
      res.cookie('access_token', resetRecord.access_token, {
        httpOnly: configurations.NODE_ENV=="production",
        secure: false,
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000,
        path: '/',
      });
      res.cookie('mail', resetRecord.mail, {
        httpOnly: configurations.NODE_ENV=="production",
        secure: false,
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000,
        path: '/',
      });
      res.cookie('name', resetRecord.name, {
        httpOnly: configurations.NODE_ENV=="production",
        secure: false,
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000,
        path: '/',
      });
      res.cookie('company', resetRecord.company, {
        httpOnly: configurations.NODE_ENV=="production",
        secure: false,
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000,
        path: '/',
      });
      res.cookie('companyURL', resetRecord.companyURL, {
        httpOnly: configurations.NODE_ENV=="production",
        secure: false,
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000,
        path: '/',
      });
      return {"message":"success",company:resetRecord.company};
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
      company: req.cookies.company,
      companyURL:req.cookies.companyURL
    };
  }

}
