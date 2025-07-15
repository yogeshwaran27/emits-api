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
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserDetails) private userModel: typeof UserDetails,
    @InjectModel(Company) private companyModel: typeof Company,
    private jwtService: JwtService
  ) { }



  async getHostIp(): Promise<{ ip: string } | null> {
    if (configurations.NODE_ENV == "production") {
      const result = await fetch("http://checkip.amazonaws.com");
      if (result.status === 200) {
        const ip = (await result.text()).trim();
        return { ip };
      }
      return null
    }
    return {ip:"localhost:5173"}
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
  async createUser(dto: CreateUserDto) {
    const userId = dto.PortalPersonUniqueId;
    const companyId = dto.PortalCompanyUniqueId;
    const company = await this.companyModel.findByPk(companyId);
    if (!company) {
      throw new BadRequestException(`Company with ID ${companyId} does not exist`);
    }
    const existingUserById = await this.userModel.findOne({
      where: { UserId: userId },
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
      CompanyId: companyId,
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
    const payload = { sub: userId, username: dto.UserName, useremail: dto.EmailId, phone: dto.PhoneNumber, companyId: companyId, UserType: 'Employee' };
    const access_token = await this.jwtService.signAsync(payload, { expiresIn: '1d' })
    const ip = await this.getHostIp();
    const resetLink = `http://${ip?.ip}/first-reset-pass?token=${access_token}&email=${dto.EmailId}&name=${dto.FirstName}`;

    console.log(resetLink, dto.EmailId)
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

  async getUserById(userId: string) {
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
      return { error: `User with ID ${userId} not found` };
    }

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

  async activateUser(portalPersonUniqueId: string) {
    const user = await this.userModel.findOne({ where: { UserId: portalPersonUniqueId } });

    if (!user) {
      return { status: 'Failed', reasonForFailure: 'UserNotFound' };
    }

    user.UserStatus = 'Active'; // or `user.isActive = true` depending on your model
    await user.update({ UserStatus: 'Active' });

    return {
      status: 'Success',
      message: `User ${portalPersonUniqueId} activated.`,
    };
  }

  async deactivateUser(portalPersonUniqueId: string) {
    const user = await this.userModel.findOne({ where: { UserId: portalPersonUniqueId } });

    if (!user) {
      return { status: 'Failed', reasonForFailure: 'UserNotFound' };
    }

    user.UserStatus = 'Inactive';
    await user.update({ UserStatus: 'Inactive' });

    return {
      status: 'Success',
      message: `User ${portalPersonUniqueId} deactivated.`,
    };
  }

}
