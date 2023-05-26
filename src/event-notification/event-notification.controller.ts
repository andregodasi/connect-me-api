import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { EventNotificationService } from './event-notification.service';
import { Controller, Get, Param, Put } from '@nestjs/common';
import { User } from '@prisma/client';

@Controller('event-notification')
export class EventNotificationController {
  constructor(
    private readonly eventNotificationService: EventNotificationService,
  ) {}

  @Get()
  findByUserIdAndIsNotRead(@CurrentUser() user: User) {
    return this.eventNotificationService.findByUserIdAndIsNotRead(user.id);
  }

  @Put('/:uuid/read')
  async markAsRead(@CurrentUser() user: User, @Param('uuid') uuid: string) {
    await this.eventNotificationService.markAsRead(user, uuid);
  }
}
