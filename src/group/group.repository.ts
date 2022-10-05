import { Injectable } from '@nestjs/common';
import { Group, Prisma } from '@prisma/client';
import { PageMetaDto } from 'src/common/repository/dto/page-meta.dto';
import { PageOptionsDto } from 'src/common/repository/dto/page-options.dto';
import { PageDto } from 'src/common/repository/dto/page.dto';
import { GroupService } from 'src/group/group.service';
import { User } from 'src/user/entities/user.entity';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

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

  async findAll() {
    return await this.prisma.group.findMany({
      select: {
        uuid: true,
        name: true,
        description: true,
      },
    });
  }

  async findByIdentifier(identifier: string) {
    return await this.prisma.group.findFirst({
      where: {
        OR: [
          {
            uuid: {
              equals: identifier,
            },
          },
          {
            slug: {
              equals: identifier,
            },
          },
        ],
      },
      select: {
        id: true,
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
    console.log(id, updateGroupDto);
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
      },
    });
  }

  async findPaginated(pageOptionsDto: PageOptionsDto) {
    const itemCount: number = await this.prisma.group.count();
    const data = await this.prisma.group.findMany({
      take: pageOptionsDto.take,
      skip: pageOptionsDto.skip,
      select: {
        uuid: true,
        name: true,
        description: true,
        users: {
          where: {
            role: 'ADMIN',
          },
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
      orderBy: {
        name: pageOptionsDto.order,
      },
    });

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageDto(data, pageMetaDto);
  }
}
