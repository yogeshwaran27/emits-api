import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersController } from './user.controller';
import { UsersService } from './user.service';
import { User } from './entities/user.entity';
import { UserContactDetails } from './entities/user-contact.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([User, UserContactDetails]) 
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UserModule {}
