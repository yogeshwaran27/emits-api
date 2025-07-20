import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserDetails } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { Sequelize } from 'sequelize-typescript';
import { Company } from './entities/company.entity';
import * as bcrypt from 'bcrypt';
import { Op, Sequelize as SequelizeLib } from 'sequelize';
import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import configurations from 'src/config';
import * as os from 'os';
import { ResetTokens } from './entities/reset.entity';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserDetails) private userModel: typeof UserDetails,
    @InjectModel(ResetTokens) private resetTokenRepository: typeof ResetTokens,
    @InjectModel(Company) private companyModel: typeof Company,
    private jwtService: JwtService
  ) { }



  async getHostIp(hostname:string): Promise<{ ip: string } | null> {
    if (configurations.NODE_ENV == "production") {
      return {ip:"http://"+hostname}
    }
    return { ip: "http://localhost:5173" }
  }

  async sendEmail(resetLink: string, EmailId: string): Promise<{ status: string; message: string }> {
    return { status: 'success', message: 'Email sent successfully' };
    const payload = {
      email: EmailId,
      resetLink: resetLink,
    };
    try {
      const response = await fetch('https://your-SalesForce-api-url.com/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return { status: 'success', message: data.message || 'Email sent successfully' };
      } else {
        return { status: 'fail', message: data.message || 'Email failed to send' };
      }
    } catch (error) {
      console.error('Error sending email:', (error as Error).message);
      throw new InternalServerErrorException('Failed to trigger email API');
    }
  }
  async createUser(dto: CreateUserDto, Usercompany: string, hostname: string) {
    const userId = dto.PortalPersonUniqueId;
    const companyId = dto.PortalCompanyUniqueId;

    if (Usercompany != companyId) {
      throw new BadRequestException(`User doesn't have Enough permission to create user for Company : ${companyId}`);

    }
    const existingUserById = await this.userModel.findOne({
      where: { UserId: userId, CompanyId: Usercompany },
    });

    if (existingUserById) {
      throw new BadRequestException(`User ID ${userId} already exists`);
    }

    const existingUserByEmail = await this.userModel.findOne({
      where: { EmailId: dto.EmailId },
    });

    if (existingUserByEmail) {
      throw new BadRequestException(`Email ID ${dto.EmailId} already exists`);
    }
    const tempPassword = randomBytes(4).toString('hex');

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(tempPassword, saltRounds);

    await this.userModel.create({
      UserId: userId,
      CompanyId: Usercompany,
      UserType: 'Employee',
      UserName: dto.UserName,
      EmailId: dto.EmailId,
      EmailVerified: false,
      PhoneNumber: dto.PhoneNumber,
      PhoneVerified: false,
      UserPassword: hashedPassword,
      UserStatus: 'Active',
      FirstName: dto.FirstName,
      LastName: dto.LastName,
      CreatedBy: 'SalesForce',
      CreatedDateTime: Sequelize.literal('GETDATE()'),
      ModifiedBy: 'SalesForce',
      ModifiedDateTime: Sequelize.literal('GETDATE()'),
      ForcePasswordReset: true,
    } as any);
    const ip = await this.getHostIp(hostname);
    const token = randomBytes(32).toString('hex');
    await this.resetTokenRepository.create({
      token,
      UserId: userId,
      companyId: Usercompany,
      EmailId: dto.EmailId,
      expires_at: new Date(Date.now() + 3600 * 24 * 1000),
      used: false,
      created_at: new Date(),
    } as any);

    const resetLink = `${ip?.ip}/first-reset-pass?token=${token}`;

    const emailResponse = await this.sendEmail(resetLink, dto.EmailId)
    if (emailResponse.status == "success")
      return { message: 'User created successfully', resetLink: resetLink };
    return { message: 'User creation failed' };
  }
  async updateUserPassword(userId: string, newPassword: string, loggedInUser: { username: string; useremail: string }) {
    const normalizedInput = userId.toLowerCase();

    if (
      normalizedInput !== loggedInUser.username.toLowerCase() &&
      normalizedInput !== loggedInUser.useremail.toLowerCase()
    ) {
      return {
        status: 'Failed',
        reasonForFailure: 'UnauthorizedUser',
      };
    }
    const user = await this.userModel.findOne({
      where: {
        [Op.or]: [
          SequelizeLib.where(
            SequelizeLib.fn('LOWER', SequelizeLib.col('UserId')),
            userId.toLowerCase()
          ),
          SequelizeLib.where(
            SequelizeLib.fn('LOWER', SequelizeLib.col('EmailId')),
            userId.toLowerCase()
          )
        ]
      }
    });

    if (!user) {
      return { status: 'Failed', reasonForFailure: 'UserNotFound' };
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await user.update({
      UserPassword: hashedPassword,
      ForcePasswordReset: false,
      ModifiedBy: 'SalesForce',
      ModifiedDateTime: Sequelize.literal('GETDATE()'),
      EmailVerified: true
    });

    return {
      status: 'Success',
      message: `Password for user ${userId} updated successfully.`,
    };
  }

  async getUserById(userId: string,reqCompanyID:string) {
    const user = await this.userModel.findOne({
      where: { UserId: userId },
      attributes: [
        'UserId',
        'CompanyId',
        'UserName',
        'EmailId',
        'PhoneNumber',
        'FirstName',
        'LastName',
      ],
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    if (user.CompanyId != reqCompanyID)
      throw new BadRequestException(`User doesn't have Enough permission to view details of users from the company : ${user.CompanyId}`);

    return user;
  }

  async getUserPass(userId: string) {
    const user = await this.userModel.findOne({
      where: {
        [Op.or]: [
          SequelizeLib.where(
            SequelizeLib.fn('LOWER', SequelizeLib.col('UserId')),
            userId.toLowerCase()
          ),
          SequelizeLib.where(
            SequelizeLib.fn('LOWER', SequelizeLib.col('EmailId')),
            userId.toLowerCase()
          )
        ]
      },
      attributes: [
        'ForcePasswordReset',
        'UserPassword',
        'UserId',
        'UserType',
        'CompanyId',
        'UserName',
        'EmailId',
        'PhoneNumber',
        'FirstName',
        'LastName',]

    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    return user;
  }

  async activateUser(portalPersonUniqueId: string, reqCompanyID: string) {
    const user = await this.userModel.findOne({ where: { UserId: portalPersonUniqueId } });

    if (!user) {
      return { status: 'Failed', reasonForFailure: 'UserNotFound' };
    }
    if (user.CompanyId != reqCompanyID)
      throw new BadRequestException(`User doesn't have Enough permission to activate user from  : ${user.CompanyId}`);

    user.UserStatus = 'Active'; // or `user.isActive = true` depending on your model
    await user.update({ UserStatus: 'Active' });

    return {
      status: 'Success',
      message: `User ${portalPersonUniqueId} activated.`,
    };
  }

  async deactivateUser(portalPersonUniqueId: string, reqCompanyID: string) {
    const user = await this.userModel.findOne({ where: { UserId: portalPersonUniqueId } });

    if (!user) {
      return { status: 'Failed', reasonForFailure: 'UserNotFound' };
    }
    if (user.CompanyId != reqCompanyID)
      throw new BadRequestException(`User doesn't have Enough permission to deactivate user from : ${user.CompanyId}`);

    user.UserStatus = 'Inactive';
    await user.update({ UserStatus: 'Inactive' });

    return {
      status: 'Success',
      message: `User ${portalPersonUniqueId} deactivated.`,
    };
  }

}
