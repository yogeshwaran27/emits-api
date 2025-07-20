
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ResetTokens } from 'src/user/entities/reset.entity';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectModel(ResetTokens)
    private resetTokensModel: typeof ResetTokens,

  ) { }

  async signIn(
    username: string,
    password: string,
  ): Promise<{ access_token: string, requiresPasswordReset: boolean, mail: string, message: string, name: string, company: string } | { requiresPasswordReset: boolean, message: string }> {
    const user = await this.usersService.getUserPass(username);
    const passwordMatch = await bcrypt.compare(password, user?.UserPassword);
    if (!passwordMatch) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.dataValues.UserId, username: user.dataValues.UserName, useremail: user.dataValues.EmailId, phone: user.dataValues.PhoneNumber, companyId: user.dataValues.CompanyId, UserType: user.dataValues.UserType };
    return {
      access_token: await this.jwtService.signAsync(payload),
      requiresPasswordReset: user.dataValues.ForcePasswordReset,
      mail: user.dataValues.EmailId,
      name: user.dataValues.FirstName,
      company: user.dataValues.CompanyId,
      message: "success"
    };
  }
  async findByToken(token: string): Promise<{ access_token: string; mail: string; name: string; company: string }> {
    const resetRecord = await this.resetTokensModel.findOne({ where: { token } });

    if (!resetRecord) {
      throw new BadRequestException('Invalid reset token');
    }

    if (resetRecord.used) {
      throw new BadRequestException('Reset token already used');
    }

    if (resetRecord.expires_at < new Date()) {
      throw new BadRequestException('Reset token expired');
    }

    await this.resetTokensModel.update(
      { used: true },
      { where: { token } }
    );

    const user = await this.usersService.getUserById(resetRecord.UserId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const payload = {
      sub: user.dataValues.UserId,
      username: user.dataValues.UserName,
      useremail: user.dataValues.EmailId,
      phone: user.dataValues.PhoneNumber,
      companyId: user.dataValues.CompanyId,
      UserType: user.dataValues.UserType,
    };

    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      mail: user.dataValues.EmailId,
      name: user.dataValues.FirstName,
      company: user.dataValues.CompanyId,
    };
  }

}
