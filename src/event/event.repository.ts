import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { GroupService } from 'src/group/group.service';
import { User } from 'src/user/entities/user.entity';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { Event } from './entities/event.entity';

@Injectable()
export class EventRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly groupService: GroupService,
  ) {}

  async create(
    currentUser: User,
    createEventDto: CreateEventDto,
  ): Promise<Event> {
    const { idGroup, ...createEventData } = createEventDto;

    const data: Prisma.EventCreateInput = {
      ...createEventData,
    };

    const groupData = await this.groupService.findByUuid(idGroup);

    const createdEvent = await this.prisma.event.create({
      data: {
        ...data,
        users: {
          create: [
            {
              user: {
                connect: {
                  id: currentUser.id,
                },
              },
            },
          ],
        },
        group: {
          connect: {
            id: groupData.id,
          },
        },
      },
    });
    
    return createdEvent;
  }
}
