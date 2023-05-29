import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { EventNotificationModule } from './event-notification/event-notification.module';
import { EventModule } from './event/event.module';
import { FileModule } from './file/file.module';
import { GroupModule } from './group/group.module';
import { MailModule } from './mail/mail.module';
import { PrismaModule } from './prisma/prisma.module';
import { RecoveryPasswordModule } from './recovery-password/recovery-password.module';
import { TaskService } from './task/task.service';
import { UserModule } from './user/user.module';
import { PrismaClientExceptionFilter } from './prisma-client-exception.filter';

@Module({
  imports: [
    PrismaModule,
    ScheduleModule.forRoot(),
    UserModule,
    AuthModule,
    GroupModule,
    EventModule,
    FileModule,
    MailModule,
    HttpModule,
    RecoveryPasswordModule,
    EventNotificationModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaClientExceptionFilter,
    },
    TaskService,
  ],
})
export class AppModule {}
