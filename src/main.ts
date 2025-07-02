import { NestFactory } from '@nestjs/core';
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
    origin:[configurations.FRONTEND_REDIRECT],
    credentials: true, 
  });
  await app.listen(configurations.APP_PORT ?? 1433);
}
bootstrap();
