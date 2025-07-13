import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Request, Response, NextFunction  } from 'express';
import configurations from "./config"
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  if (configurations.NODE_ENV === 'production') {
    app.use((req: Request, res: Response, next: NextFunction) => {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
      next();
    });
  }
  app.use(cookieParser());
  app.enableCors({
    origin: '*',
    credentials: true,              
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
  });
  app.setGlobalPrefix('api')
  const config = new DocumentBuilder()
    .setTitle('User Management API')
    .setDescription('APIs for creating, activating, and deactivating users in the portal')
    .setVersion('1.0')
    .addTag('user')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);
  await app.listen(configurations.APP_PORT ?? 3000);
}
bootstrap();
