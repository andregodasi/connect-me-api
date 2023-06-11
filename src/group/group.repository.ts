import { Injectable } from '@nestjs/common';
import {
  Group,
  Prisma,
  User,
  UserGroup,
  UserGroupRole,
  UserStatus,
} from '@prisma/client';
import { isUUID } from 'class-validator';
import { PageMetaDto } from 'src/common/repository/dto/page-meta.dto';
import { PageDto } from 'src/common/repository/dto/page.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { PageOptionGroupCommentDto } from './dto/page-option-group-comment.dto';
import { PageOptionGroupDto } from './dto/page-option-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(currentUser: User, createGroupDto: CreateGroupDto) {
    const data: Prisma.GroupCreateInput = {
      ...createGroupDto,
    };

    const createdGroup = await this.prisma.group.create({
      data: {
        ...data,
        users: {
          create: [
            {
              role: 'ADMIN',
              status: 'ACTIVATED',
              user: {
                connect: {
                  id: currentUser.id,
                },
              },
            },
          ],
        },
      },
    });

    delete createdGroup.id;

    return {
      ...createdGroup,
    };
  }

  async follow(currentUser: User, uuid: string): Promise<UserGroup> {
    const groupFollowed = await this.findByUUID(uuid);

    const exists = await this.prisma.userGroup.findFirst({
      where: { fk_id_group: groupFollowed.id, fk_id_user: currentUser.id },
    });
    if (exists) {
      return exists;
    }

    const createdGroupFollowed = await this.prisma.userGroup.create({
      data: { fk_id_group: groupFollowed.id, fk_id_user: currentUser.id },
    });

    return createdGroupFollowed;
  }

  async unfollow(currentUser: User, uuid: string) {
    const groupFollowed = await this.findByUUID(uuid);

    const deleteFollowed = await this.prisma.userGroup.deleteMany({
      where: {
        AND: [
          {
            fk_id_group: {
              equals: groupFollowed.id,
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

    return deleteFollowed;
  }

  async findByIdentifier(identifier: string) {
    let queryGroup: Prisma.GroupWhereInput;
    if (isUUID(identifier)) {
      queryGroup = {
        uuid: identifier,
      };
    } else {
      queryGroup = {
        slug: identifier,
      };
    }

    return this.prisma.group.findFirst({
      where: queryGroup,
      select: {
        id: true,
        uuid: true,
        name: true,
        description: true,
        slug: true,
        coverUrl: true,
        createdAt: true,
        updatedAt: true,
        isPublised: true,
        users: {
          select: {
            fk_id_user: true,
            role: true,
            status: true,
            user: {
              select: {
                uuid: true,
                name: true,
                nickname: true,
              },
            },
          },
        },
        events: {
          select: {
            uuid: true,
            name: true,
            description: true,
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

  async update(id: string, updateGroupDto: UpdateGroupDto) {
    return this.prisma.group.update({
      where: {
        uuid: id,
      },
      data: {
        ...updateGroupDto,
      },
    });
  }

  async deleteGroup(id: number) {
    await this.prisma.group.delete({
      where: {
        id,
      },
    });
  }

  async findAllMyGroups(currentUser: User) {
    return this.prisma.group.findMany({
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
        coverUrl: true,
        _count: {
          select: {
            users: true,
          },
        },
      },
    });
  }

  async getPaginated(
    pageOptionGroupDto: PageOptionGroupDto,
    currentUser: User,
  ) {
    let queryUser: Prisma.UserGroupFindManyArgs | boolean = false;
    let queryIsFollowing: Prisma.UserGroupListRelationFilter;

    if (currentUser) {
      queryUser = {
        select: {
          fk_id_user: true,
          role: true,
          user: {
            select: {
              uuid: true,
              name: true,
              nickname: true,
            },
          },
        },
        where: {
          OR: [
            {
              fk_id_user: {
                equals: currentUser.id,
              },
            },
            {
              role: {
                equals: UserGroupRole.ADMIN,
              },
            },
          ],
        },
      };
    }

    if (pageOptionGroupDto.isFollowing) {
      queryIsFollowing = {
        some: {
          fk_id_user: {
            equals: currentUser.id,
          },
        },
      };
    }

    const where: Prisma.GroupWhereInput = {
      isPublised: true,
      users: queryIsFollowing,
    };

    const itemCount = await this.prisma.group.count({
      where,
    });

    const data = await this.prisma.group.findMany({
      take: pageOptionGroupDto.take,
      skip: pageOptionGroupDto.skip,
      select: {
        id: true,
        isPublised: true,
        uuid: true,
        name: true,
        description: true,
        coverUrl: true,
        createdAt: true,
        updatedAt: true,
        slug: true,
        users: queryUser,
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: [
        {
          name: pageOptionGroupDto.order,
        },
        {
          users: {
            _count: Prisma.SortOrder.desc,
          },
        },
      ],
      where,
    });

    const pageMetaDto = new PageMetaDto(pageOptionGroupDto, itemCount);

    return new PageDto(data, pageMetaDto);
  }

  async findByUUID(uuid: string) {
    return this.prisma.group.findUnique({
      where: { uuid },
      include: { users: { include: { user: { select: { uuid: true } } } } },
    });
  }

  async insertComment(user: User, group: Group, text: string, starts: number) {
    await this.prisma.groupComment.create({
      data: {
        text: text,
        starts: starts,
        user: {
          connect: {
            id: user.id,
          },
        },
        group: {
          connect: {
            id: group.id,
          },
        },
      },
    });
  }

  async pageComments(
    groupUUID: string,
    withDeleted: boolean,
    pageOptions: PageOptionGroupCommentDto,
  ) {
    const where: any = { group: { uuid: groupUUID } };
    if (!withDeleted) {
      where.deletedAt = null;
    }

    const itemCount = await this.prisma.groupComment.count({
      where,
    });

    const data = await this.prisma.groupComment.findMany({
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
    await this.prisma.group.update({
      data: {
        isPublised: isPublised,
      },
      where: {
        uuid: uuid,
      },
    });
  }

  findCommentByUUID(groupUUID: string, commentUUID: string) {
    return this.prisma.groupComment.findFirst({
      where: {
        uuid: commentUUID,
        group: {
          uuid: groupUUID,
        },
        deletedAt: null,
      },
      include: {
        user: true,
        group: {
          include: {
            users: true,
          },
        },
      },
    });
  }

  async deleteComment(commentID: number, reasonDeleted: string) {
    await this.prisma.groupComment.update({
      data: {
        reasonDeleted,
        deletedAt: new Date(),
      },
      where: {
        id: commentID,
      },
    });
  }

  findFollowers(id: number) {
    return this.prisma.userGroup.findMany({
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
        group: {
          id,
        },
        user: {
          status: UserStatus.ACTIVATED,
        },
      },
    });
  }

  findEvents(id: number, onlyPublished: boolean) {
    const where: any = {
      group: {
        id,
      },
    };

    if (onlyPublished) {
      where.isPublised = true;
    }

    return this.prisma.event.findMany({
      where,
    });
  }
}
