import { BadRequestException, Injectable } from '@nestjs/common';
import {
  Event,
  Group,
  Prisma,
  User,
  UserEvent,
  UserGroupRole,
} from '@prisma/client';
import { isUUID } from 'class-validator';
import { PageMetaDto } from 'src/common/page/page-meta.dto';
import { PageOptionsDto } from 'src/common/page/page-options.dto';
import { PageDto } from 'src/common/page/page.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { PageOptionEventCommentDto } from './dto/page-option-event-comment.dto';
import { PageOptionEventDto } from './dto/page-option-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    currentUser: User,
    createEventDto: CreateEventDto,
    group: Group,
  ) {
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

    return this.prisma.event.findFirst({
      where: queryEvent,
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        groupId: true,
        uuid: true,
        name: true,
        description: true,
        slug: true,
        address: true,
        coverUrl: true,
        initialDate: true,
        finishDate: true,
        link: true,
        type: true,
        limitParticipants: true,
        isPublised: true,
        group: {
          select: {
            uuid: true,
            name: true,
          },
        },
        users: {
          select: {
            fk_id_user: true,
            user: {
              select: {
                uuid: true,
                name: true,
                nickname: true,
              },
            },
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
    });
  }

  async getPaginated(
    pageOptionEventDto: PageOptionEventDto,
    currentUser: User,
  ) {
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
              uuid: true,
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

    const where: Prisma.EventWhereInput = {
      group: queryGroupUser,
      name: queryEventName,
      users: queryIsSubscribed,
      isPublised: true,
    };

    where.OR = [
      {
        initialDate: {
          gte: new Date(),
        },
      },
      {
        finishDate: {
          gte: new Date(),
        },
      },
    ];

    if (
      pageOptionEventDto.dateInitial &&
      pageOptionEventDto.dateFinal &&
      pageOptionEventDto.dateInitial <= pageOptionEventDto.dateFinal
    ) {
      where.OR = [
        {
          initialDate: {
            gte: pageOptionEventDto.dateInitial,
            lte: pageOptionEventDto.dateFinal,
          },
        },
        {
          finishDate: {
            gte: pageOptionEventDto.dateInitial,
            lte: pageOptionEventDto.dateFinal,
          },
        },
      ];
    } else if (
      pageOptionEventDto.dateInitial &&
      !pageOptionEventDto.dateFinal
    ) {
      where.OR = [
        {
          initialDate: {
            gte: new Date(pageOptionEventDto.dateInitial.setHours(0, 0, 0, 0)),
            lte: new Date(
              pageOptionEventDto.dateInitial.setHours(23, 59, 59, 999),
            ),
          },
        },
        {
          finishDate: {
            gte: new Date(pageOptionEventDto.dateInitial.setHours(0, 0, 0, 0)),
            lte: new Date(
              pageOptionEventDto.dateInitial.setHours(23, 59, 59, 999),
            ),
          },
        },
      ];
    } else if (
      !pageOptionEventDto.dateInitial &&
      pageOptionEventDto.dateFinal
    ) {
      where.OR = [
        {
          initialDate: {
            gte: new Date(pageOptionEventDto.dateFinal.setHours(0, 0, 0, 0)),
            lte: new Date(
              pageOptionEventDto.dateFinal.setHours(23, 59, 59, 999),
            ),
          },
        },
        {
          finishDate: {
            gte: new Date(pageOptionEventDto.dateFinal.setHours(0, 0, 0, 0)),
            lte: new Date(
              pageOptionEventDto.dateFinal.setHours(23, 59, 59, 999),
            ),
          },
        },
      ];
    }

    const itemCount: number = await this.prisma.event.count({
      where,
    });

    const data = await this.prisma.event.findMany({
      take: pageOptionEventDto.take,
      skip: pageOptionEventDto.skip,
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        isPublised: true,
        uuid: true,
        name: true,
        description: true,
        initialDate: true,
        finishDate: true,
        address: true,
        limitParticipants: true,
        link: true,
        type: true,
        coverUrl: true,
        slug: true,
        groupId: true,
        group: {
          select: {
            uuid: true,
            name: true,
            description: true,
            coverUrl: true,
          },
        },
        users: queryUser,
        _count: {
          select: {
            users: true,
          },
        },
      },
      where: where,
      orderBy: [
        {
          initialDate: Prisma.SortOrder.asc,
        },
        {
          users: {
            _count: Prisma.SortOrder.desc,
          },
        },
      ],
    });

    const pageMetaDto = new PageMetaDto(pageOptionEventDto, itemCount);

    return new PageDto(data, pageMetaDto);
  }

  async getMyPaginated(pageOptionsDto: PageOptionsDto, currentUser: User) {
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
                  role: UserGroupRole.ADMIN,
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
        id: true,
        createdAt: true,
        updatedAt: true,
        isPublised: true,
        uuid: true,
        name: true,
        description: true,
        initialDate: true,
        finishDate: true,
        address: true,
        limitParticipants: true,
        coverUrl: true,
        link: true,
        type: true,
        slug: true,
        groupId: true,
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
        users: {
          select: {
            fk_id_user: true,
          },
        },
        _count: {
          select: {
            users: true,
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
  ) {
    const itemCount: number = await this.prisma.event.count({
      where: {
        AND: [
          {
            group: {
              uuid: uuid,
              users: {
                some: {
                  fk_id_user: currentUser.id,
                  role: UserGroupRole.ADMIN,
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
                  role: UserGroupRole.ADMIN,
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        slug: true,
        groupId: true,
        uuid: true,
        name: true,
        description: true,
        initialDate: true,
        finishDate: true,
        address: true,
        limitParticipants: true,
        coverUrl: true,
        isPublised: true,
        link: true,
        type: true,
        group: {
          select: {
            uuid: true,
            name: true,
            description: true,
          },
        },
        users: {
          select: {
            fk_id_user: true,
          },
        },
        _count: {
          select: {
            users: true,
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
          connect: {
            id: user.id,
          },
        },
        event: {
          connect: {
            id: event.id,
          },
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

  async findCommentByUUID(eventUUID: string, commentUUID: string) {
    return this.prisma.eventComment.findFirst({
      where: {
        uuid: commentUUID,
        event: {
          uuid: eventUUID,
        },
        deletedAt: null,
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

  async deleteComment(id: number, reasonDeleted: string) {
    await this.prisma.eventComment.update({
      data: {
        reasonDeleted,
        deletedAt: new Date(),
      },
      where: {
        id,
      },
    });
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    return this.prisma.event.update({
      where: {
        uuid: id,
      },
      data: {
        ...updateEventDto,
      },
    });
  }

  findSubscribed(id: number) {
    return this.prisma.userEvent.findMany({
      select: {
        user: {
          select: {
            uuid: true,
            name: true,
            photoUrl: true,
          },
        },
      },
      where: {
        id,
      },
    });
  }

  findByDate(date: Date) {
    return this.prisma.event.findMany({
      select: {
        id: true,
        users: {
          select: {
            user: {
              select: {
                id: true,
              },
            },
          },
        },
      },
      where: {
        isPublised: true,
        initialDate: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lte: new Date(date.setHours(23, 59, 59, 999)),
        },
      },
    });
  }

  async deleteEvent(id: number) {
    await this.prisma.event.delete({
      where: {
        id,
      },
    });
  }
}
