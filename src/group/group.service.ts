import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from 'src/user/entities/user.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from './entities/group.entity';

@Injectable()
export class GroupService {
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

  async findOne(uuid: string) {
    return await this.prisma.group.findUnique({
      where: {
        uuid: uuid,
      },
      select: {
        uuid: true,
        name: true,
        description: true,
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

  async remove(id: string) {
    return await this.prisma.group.delete({
      where: {
        uuid: id,
      },
    });
  }
}
