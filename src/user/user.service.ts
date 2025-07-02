import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { UserContactDetails } from './entities/user-contact.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(UserContactDetails) private contactModel: typeof UserContactDetails,
  ) {}

  async createUser(dto: CreateUserDto) {
    const userId = dto.PortalPersonUniqueId;
    const companyId = dto.PortalCompanyUniqueId;

    await this.userModel.create({
                UserId: userId,
                CompanyId: companyId,
                UserType: 'Employee',
                UserName: dto.EmailId,
                UserPassword: 'hashedDefaultPwd',
                UserStatus: 'Active',
                FirstName: dto.FirstName,
                LastName: dto.LastName,
                CreatedBy: 'Admin',
                CreatedDateTime: Sequelize.literal('GETDATE()'), 
                ModifiedBy: 'Admin',
                ModifiedDateTime: Sequelize.literal('GETDATE()'), 
              } as any); 

    await this.contactModel.create({
                UserId: userId,
                EmailId: dto.EmailId,
                EmailVerified: false,
                PhoneNumber: dto.PhoneNumber,
                PhoneVerified: false,
              } as any);

    return { message: 'User created successfully' };
  }
  async activateUser(portalPersonUniqueId: string) {
  const user = await this.userModel.findOne({ where: { UserId: portalPersonUniqueId } });

  if (!user) {
    return { status: 'Failed', reasonForFailure: 'UserNotFound' };
  }

  user.UserStatus = 'Active'; // or `user.isActive = true` depending on your model
  await user.save();

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

  user.UserStatus = 'Inactive'; // or `user.isActive = false` depending on your model
  await user.save();

  return {
    status: 'Success',
    message: `User ${portalPersonUniqueId} deactivated.`,
  };
}

}
