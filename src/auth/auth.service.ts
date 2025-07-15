
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) { }

    async signIn(
        username: string,
        password: string,
    ): Promise<{ access_token: string, requiresPasswordReset: boolean, mail: string, message:string, name:string } | { requiresPasswordReset: boolean, message: string }> {
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
            message:"success"
        };
    }
}
