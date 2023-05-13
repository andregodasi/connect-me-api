import { Injectable } from '@nestjs/common';
import { Prisma, User, UserGroup } from '@prisma/client';
import { isUUID } from 'class-validator';
import { PageMetaDto } from 'src/common/repository/dto/page-meta.dto';
import { PageDto } from 'src/common/repository/dto/page.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { PageOptionGroupCommentDto } from './dto/page-option-group-comment.dto';
import { PageOptionGroupDto } from './dto/page-option-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from './entities/group.entity';

@Injectable()
export class GroupRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    currentUser: User,
    createGroupDto: CreateGroupDto,
  ): Promise<Group> {
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

  async findAll() {
    return await this.prisma.group.findMany({
      select: {
        uuid: true,
        name: true,
        description: true,
        coverUrl: true,
      },
    });
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

    return await this.prisma.group.findFirst({
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
        users: {
          select: {
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
      },
    });
  }

  async update(id: string, updateGroupDto: UpdateGroupDto) {
    return await this.prisma.group.update({
      where: {
        uuid: id,
      },
      data: {
        ...updateGroupDto,
      },
    });
  }

  async delete(id: string) {
    return await this.prisma.group.delete({
      where: {
        uuid: id,
      },
    });
  }

  async findAllMyGroups(currentUser: User) {
    return await this.prisma.group.findMany({
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
        users: {
          select: {
            role: true,
            user: {
              select: {
                uuid: true,
                name: true,
                email: true,
                status: true,
              },
            },
          },
        },
      },
    });
  }

  async getPaginated(
    pageOptionGroupDto: PageOptionGroupDto,
    currentUser: User,
  ): Promise<PageDto<Group>> {
    let queryUser: Prisma.UserGroupFindManyArgs | boolean = false;
    let queryIsFollowing: Prisma.UserGroupListRelationFilter;
    if (currentUser) {
      queryUser = {
        select: {
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
                equals: `ADMIN`,
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

    const itemCount: number = await this.prisma.group.count({
      where: {
        users: queryIsFollowing,
      },
    });
    const data = await this.prisma.group.findMany({
      take: pageOptionGroupDto.take,
      skip: pageOptionGroupDto.skip,
      select: {
        uuid: true,
        name: true,
        description: true,
        coverUrl: true,
        createdAt: true,
        updatedAt: true,
        slug: true,
        users: queryUser,
      },
      orderBy: {
        name: pageOptionGroupDto.order,
      },
      where: {
        users: queryIsFollowing,
      },
    });

    const pageMetaDto = new PageMetaDto(pageOptionGroupDto, itemCount);

    return new PageDto(data, pageMetaDto);
  }

  async findByUUID(uuid: string) {
    return this.prisma.group.findUnique({
      where: { uuid },
      include: { users: true },
    });
  }

  async insertComment(user: User, group: Group, text: string, starts: number) {
    await this.prisma.groupComment.create({
      data: {
        text: text,
        starts: starts,
        user: {
          connect: user,
        },
        group: {
          connect: group,
        },
      },
    });
  }

  async pageComments(
    groupUUID: string,
    pageOptions: PageOptionGroupCommentDto,
  ) {
    const itemCount = await this.prisma.groupComment.count({
      where: { group: { uuid: groupUUID } },
    });

    const data = await this.prisma.groupComment.findMany({
      take: pageOptions.take,
      skip: pageOptions.skip,
      where: {
        group: {
          uuid: groupUUID,
        },
      },
      select: {
        uuid: true,
        text: true,
        starts: true,
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
}
