import { Module } from '@nestjs/common';
import { EventNotificationController } from './event-notification.controller';
import { EventNotificationService } from './event-notification.service';

@Module({
  controllers: [EventNotificationController],
  providers: [EventNotificationService],
  exports: [EventNotificationService],
})
export class EventNotificationModule {}
