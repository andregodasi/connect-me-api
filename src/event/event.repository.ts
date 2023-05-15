import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, User, UserEvent } from '@prisma/client';
import { isUUID } from 'class-validator';
import { PageMetaDto } from 'src/common/repository/dto/page-meta.dto';
import { PageOptionsDto } from 'src/common/repository/dto/page-options.dto';
import { PageDto } from 'src/common/repository/dto/page.dto';
import { Group } from '../group/entities/group.entity';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { PageOptionEventCommentDto } from './dto/page-option-event-comment.dto';
import { PageOptionEventDto } from './dto/page-option-event.dto';
import { Event } from './entities/event.entity';
import { group } from 'console';

@Injectable()
export class EventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    currentUser: User,
    createEventDto: CreateEventDto,
    group: Group,
  ): Promise<Event> {
    const data: Prisma.EventCreateInput = {
      ...createEventDto,
    };

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
            id: group.id,
          },
        },
      },
    });

    return createdEvent;
  }

  async subscribe(currentUser: User, uuid: string): Promise<UserEvent> {
    const eventSubscribe = await this.findByUUID(uuid);

    const exists = await this.prisma.userEvent.findFirst({
      where: { fk_id_event: eventSubscribe.id, fk_id_user: currentUser.id },
    });
    if (exists) {
      return exists;
    }

    const now = new Date();
    if (eventSubscribe.initialDate < now) {
      throw new BadRequestException('Event already started');
    }

    const count = await this.prisma.userEvent.count({
      where: { fk_id_event: eventSubscribe.id },
    });
    if (count >= eventSubscribe.limitParticipants) {
      throw new BadRequestException('Limit participants was exceeded');
    }

    const createdEventSubscribe = await this.prisma.userEvent.create({
      data: { fk_id_event: eventSubscribe.id, fk_id_user: currentUser.id },
    });

    return createdEventSubscribe;
  }

  async unsubscribe(currentUser: User, uuid: string) {
    const eventSubscribe = await this.findByUUID(uuid);

    const deleteSubscription = await this.prisma.userEvent.deleteMany({
      where: {
        AND: [
          {
            fk_id_event: {
              equals: eventSubscribe.id,
            },
          },
          {
            fk_id_user: {
              equals: currentUser.id,
            },
          },
        ],
      },
    });

    return deleteSubscription;
  }

  async findByIdentifier(identifier: string) {
    let queryEvent: Prisma.EventWhereInput;
    if (isUUID(identifier)) {
      queryEvent = {
        uuid: identifier,
      };
    } else {
      queryEvent = {
        slug: identifier,
      };
    }

    return await this.prisma.event.findFirst({
      where: queryEvent,
      select: {
        uuid: true,
        name: true,
        description: true,
        slug: true,
        users: {
          select: {
            user: {
              select: {
                uuid: true,
                name: true,
                nickname: true,
              },
            },
          },
        },
      },
    });
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

  async getPaginated(
    pageOptionEventDto: PageOptionEventDto,
    currentUser: User,
  ): Promise<PageDto<Event>> {
    let queryUser: Prisma.UserEventFindManyArgs | boolean = false;
    let queryGroupUser:
      | (Prisma.Without<Prisma.GroupRelationFilter, Prisma.GroupWhereInput> &
          Prisma.GroupWhereInput)
      | (Prisma.Without<Prisma.GroupWhereInput, Prisma.GroupRelationFilter> &
          Prisma.GroupRelationFilter);
    let queryEventName: string | Prisma.StringFilter;
    let queryIsSubscribed: Prisma.UserEventListRelationFilter;

    if (currentUser) {
      queryUser = {
        select: {
          user: {
            select: {
              name: true,
            },
          },
        },
        where: {
          fk_id_user: {
            equals: currentUser.id,
          },
        },
      };
    }

    if (pageOptionEventDto.isFollowing) {
      queryGroupUser = {
        users: {
          some: {
            fk_id_user: {
              equals: currentUser.id,
            },
          },
        },
      };
    }

    if (pageOptionEventDto.q) {
      queryEventName = {
        contains: pageOptionEventDto.q,
        mode: 'insensitive',
      };
    }

    if (pageOptionEventDto.isSubscribed) {
      queryIsSubscribed = {
        some: {
          fk_id_user: currentUser.id,
        },
      };
    }

    const itemCount: number = await this.prisma.event.count({
      where: {
        group: queryGroupUser,
        name: queryEventName,
        users: queryIsSubscribed,
      },
    });
    const data = await this.prisma.event.findMany({
      take: pageOptionEventDto.take,
      skip: pageOptionEventDto.skip,
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
        users: queryUser,
      },
      where: {
        group: queryGroupUser,
        name: queryEventName,
        users: queryIsSubscribed,
      },
      orderBy: {
        name: pageOptionEventDto.order,
      },
    });

    const pageMetaDto = new PageMetaDto(pageOptionEventDto, itemCount);

    return new PageDto(data, pageMetaDto);
  }

  async getMyPaginated(
    pageOptionsDto: PageOptionsDto,
    currentUser: User,
  ): Promise<PageDto<Event>> {
    const itemCount: number = await this.prisma.event.count({
      where: {
        OR: [
          {
            users: {
              some: {
                fk_id_user: currentUser.id,
              },
            },
          },
          {
            group: {
              users: {
                some: {
                  fk_id_user: currentUser.id,
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
        OR: [
          {
            users: {
              some: {
                fk_id_user: currentUser.id,
              },
            },
          },
          {
            group: {
              users: {
                some: {
                  fk_id_user: currentUser.id,
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
            users: {
              where: {
                fk_id_user: currentUser.id,
              },
            },
          },
        },
      },
      orderBy: {
        name: pageOptionsDto.order,
      },
    });

    const pageMetaDto = new PageMetaDto(pageOptionsDto, itemCount);

    return new PageDto(data, pageMetaDto);
  }

  async getEventsByGroup(
    pageOptionsDto: PageOptionsDto,
    uuid: string,
    currentUser: User,
  ): Promise<PageDto<Event>> {
    const itemCount: number = await this.prisma.event.count({
      where: {
        AND: [
          {
            group: {
              uuid: uuid,
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
              uuid: uuid,
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

    const pageMetaDto = new PageMetaDto(pageOptionsDto, itemCount);

    return new PageDto(data, pageMetaDto);
  }

  async findByUUID(uuid: string) {
    return this.prisma.event.findUnique({
      where: { uuid },
      include: { group: { include: { users: true } } },
    });
  }

  async insertComment(user: User, event: Event, text: string, starts: number) {
    await this.prisma.eventComment.create({
      data: {
        text: text,
        starts: starts,
        user: {
          connect: user,
        },
        event: {
          connect: event,
        },
      },
    });
  }

  async pageComments(
    eventUUID: string,
    withDeleted: boolean,
    pageOptions: PageOptionEventCommentDto,
  ) {
    const where: any = { event: { uuid: eventUUID } };
    if (!withDeleted) {
      where.deletedAt = null;
    }

    const itemCount = await this.prisma.eventComment.count({
      where,
    });

    const data = await this.prisma.eventComment.findMany({
      take: pageOptions.take,
      skip: pageOptions.skip,
      where,
      select: {
        uuid: true,
        text: true,
        starts: true,
        reasonDeleted: true,
        user: {
          select: {
            uuid: true,
            name: true,
            photoUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: Prisma.SortOrder.desc,
      },
    });

    const pageMetaDto = new PageMetaDto(pageOptions, itemCount);

    return new PageDto(data, pageMetaDto);
  }

  async setPublised(uuid: string, isPublised: boolean) {
    await this.prisma.event.update({
      data: {
        isPublised: isPublised,
      },
      where: {
        uuid: uuid,
      },
    });
  }

  async findCommentByUUID(uuid: string) {
    return this.prisma.eventComment.findUniqueOrThrow({
      where: {
        uuid,
      },
      include: {
        event: {
          include: {
            group: {
              include: {
                users: true,
              },
            },
          },
        },
        user: true,
      },
    });
  }

  async deleteComment(uuid: string, reasonDeleted: string) {
    await this.prisma.eventComment.update({
      data: {
        reasonDeleted,
        deletedAt: new Date(),
      },
      where: {
        uuid,
      },
    });
  }
}
