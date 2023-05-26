import { Injectable } from '@nestjs/common';
import { EventNotificationType, Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EventNotificationService {
  constructor(private readonly prisma: PrismaService) {}

  insert(userIds: number[], eventId: number, type: EventNotificationType) {
    return this.prisma.eventNotification.createMany({
      data: userIds.map((userId) => ({
        type,
        fk_id_user: userId,
        fk_id_event: eventId,
      })),
    });
  }

  findByUserIdAndIsNotRead(userId: number) {
    return this.prisma.eventNotification.findMany({
      where: {
        isRead: false,
        user: {
          id: userId,
        },
      },
      select: {
        type: true,
        uuid: true,
        event: {
          select: {
            uuid: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: Prisma.SortOrder.asc,
      },
    });
  }

  async markAsRead(user: User, uuid: string) {
    await this.prisma.eventNotification.updateMany({
      data: {
        isRead: true,
      },
      where: {
        uuid,
        user: {
          id: user.id,
        },
      },
    });
  }
}
