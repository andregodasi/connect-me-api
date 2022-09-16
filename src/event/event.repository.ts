import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PageMetaDto } from 'src/common/repository/dto/page-meta.dto';
import { PageOptionsDto } from 'src/common/repository/dto/page-options.dto';
import { PageDto } from 'src/common/repository/dto/page.dto';
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

    const groupData = await this.groupService.findByIdentifier(idGroup);

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

  async paginateMyGroups(currentUser: User) {
    return await this.prisma.group.findMany({
      take: 10,
      skip: 10,
      where: {
        users: {
          some: {
            fk_id_user: currentUser.id,
          },
        },
      },
      select: {
        uuid: true,
        name: true,
        description: true,
      },
    });
  }

  async findAll() {
    return await this.prisma.event.findMany({
      select: {
        uuid: true,
        name: true,
        description: true,
        initialDate: true,
        finishDate: true,
        address: true,
        limitParticipants: true,
        group: {
          select: {
            uuid: true,
            name: true,
            description: true,
          },
        },
      },
    });
  }

  async getPaginated(pageOptionsDto: PageOptionsDto): Promise<PageDto<Event>> {
    const itemCount: number = await this.prisma.event.count();
    const data = await this.prisma.event.findMany({
      take: pageOptionsDto.take,
      skip: pageOptionsDto.skip,
      select: {
        uuid: true,
        name: true,
        description: true,
        initialDate: true,
        finishDate: true,
        address: true,
        limitParticipants: true,
        group: {
          select: {
            uuid: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: {
        name: pageOptionsDto.order,
      },
    });

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageDto(data, pageMetaDto);
  }

  async getMyPaginated(
    pageOptionsDto: PageOptionsDto,
    currentUser: User,
  ): Promise<PageDto<Event>> {
    const itemCount: number = await this.prisma.event.count({
      where: {
        AND: [
          {
            group: {
              users: {
                some: {
                  fk_id_user: currentUser.id,
                  role: 'ADMIN',
                },
              },
            },
          },
        ],
      },
    });
    const data = await this.prisma.event.findMany({
      take: pageOptionsDto.take,
      skip: pageOptionsDto.skip,
      where: {
        AND: [
          {
            group: {
              users: {
                some: {
                  fk_id_user: currentUser.id,
                  role: 'ADMIN',
                },
              },
            },
          },
        ],
      },
      select: {
        uuid: true,
        name: true,
        description: true,
        initialDate: true,
        finishDate: true,
        address: true,
        limitParticipants: true,
        group: {
          select: {
            uuid: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: {
        name: pageOptionsDto.order,
      },
    });

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageDto(data, pageMetaDto);
  }
}
