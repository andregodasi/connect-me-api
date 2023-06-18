import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailService } from './mail.service';

const maiilModuleEnvironment =
  process.env.ENVIRONMENT === 'local'
    ? MailerModule.forRoot({
        transport: {
          host: process.env.EMAIL_HOST,
          port: Number(process.env.EMAIL_PORT),
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
        },
        defaults: {
          from: 'connect.me.develop@gmail.com',
        },
        preview: true,
        template: {
          dir: join(__dirname, '..', 'utils', 'emails', 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      })
    : MailerModule.forRoot({
        transport: {
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
        },
        defaults: {
          from: 'connect.me.develop@gmail.com',
        },
        preview: true,
        template: {
          dir: join(__dirname, '..', 'utils', 'emails', 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      });

@Module({
  imports: [maiilModuleEnvironment],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
