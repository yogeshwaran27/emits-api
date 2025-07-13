import { Module } from '@nestjs/common';
import { UsersService } from './user.service';
import { UsersController } from './user.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserDetails } from './entities/user.entity';
import { Company } from './entities/company.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([UserDetails, Company],)
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UserModule {}
