import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    // origin: ['*'], //define as posiiveis origem de requisições
    // methods: ['GET'],//define o tipo de requisição aceita
  });
  app.useGlobalPipes(new ValidationPipe());
  // app.useGlobalInterceptors(new LogInterceptor());
  await app.listen(3000);
}
bootstrap();
