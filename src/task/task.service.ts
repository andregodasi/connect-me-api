import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { EventNotificationType } from '@prisma/client';
import { EventNotificationService } from 'src/event-notification/event-notification.service';
import { EventService } from 'src/event/event.service';

@Injectable()
export class TaskService {
  constructor(
    private readonly eventService: EventService,
    private readonly eventNotificationService: EventNotificationService,
  ) {}

  @Cron('0 0 8 * * *')
  async handleCronEventNotificationEventDay() {
    const today = new Date();
    const events = await this.eventService.findByDate(today);

    for (const event of events) {
      await this.eventNotificationService.insert(
        event.users.map((u) => u.user.id),
        event.id,
        EventNotificationType.EVENT_DAY,
      );
    }
  }
}
