
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configurations from './config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { SalesforceModule } from './salesforce/salesforce.module';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      useFactory: async () => {
        return {
        dialect: 'mssql',
        host: configurations.DB_HOST,
        port: 1433,
        username: configurations.DB_USER,
        password: configurations.DB_PASSWORD,
        database: configurations.DB_NAME,
        models: [],
        autoLoadModels: true,
        synchronize: true,
      }
    },
    }),
    UserModule,
    AuthModule,
    SalesforceModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
