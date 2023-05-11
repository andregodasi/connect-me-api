import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { GroupModule } from './group/group.module';
import { EventModule } from './event/event.module';
import { FileModule } from './file/file.module';
import { MailModule } from './mail/mail.module';
import { HttpModule } from '@nestjs/axios';
import { RecoveryPasswordModule } from './recovery-password/recovery-password.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    AuthModule,
    GroupModule,
    EventModule,
    FileModule,
    MailModule,
    HttpModule,
    RecoveryPasswordModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
