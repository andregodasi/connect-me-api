import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { EventRepository } from './event.repository';
import { GroupModule } from 'src/group/group.module';
import { FileModule } from 'src/file/file.module';
import { MailModule } from 'src/mail/mail.module';
import { EventNotificationModule } from 'src/event-notification/event-notification.module';

@Module({
  imports: [GroupModule, FileModule, MailModule, EventNotificationModule],
  controllers: [EventController],
  providers: [EventService, EventRepository],
  exports: [EventService],
})
export class EventModule {}
