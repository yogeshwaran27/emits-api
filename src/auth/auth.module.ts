
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import configurations from 'src/config';
import { ResetTokens } from 'src/user/entities/reset.entity';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      global: true,
      secret: configurations.JWT_CONSTANT,
      signOptions: { expiresIn: '3600s' },
    }),
    SequelizeModule.forFeature([ResetTokens]),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
