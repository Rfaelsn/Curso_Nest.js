import { Module, forwardRef } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';

@Module({
  imports: [
    ConfigModule.forRoot(), //faz a config e da acesso as var de ambiente na api
    ThrottlerModule.forRoot({
      //ignoreUserAgents // para bloquear o acesso dealgum user agent à api
      // limit: 10000, // limite de consumo de recursos
      ttl: 60, //intervalo de tempo da config
      limit: 10, // limite de requisições no intervalo de tempo config acima
    }),
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: 'alfreda48@ethereal.email',
          pass: 'AVf47suWs77Qzey9He',
        },
      },
      defaults: {
        from: '"Hcode" <alfreda48@ethereal.email>',
      },
      template: {
        dir: __dirname + '/templates',
        adapter: new PugAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  controllers: [AppController],
  //para aplicar o throttler para a aplicação inteira
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [AppService],
})
export class AppModule {}
