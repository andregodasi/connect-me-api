import { Injectable } from '@nestjs/common';
import { Prisma, UserStatus } from '@prisma/client';
import { PageMetaDto } from 'src/common/repository/dto/page-meta.dto';
import { PageOptionsBaseDto } from 'src/common/repository/dto/page-options-base.dto';
import { PageDto } from 'src/common/repository/dto/page.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async paginateByMyEvent(eventUUID: string, page: PageOptionsBaseDto) {
    const where = {
      events: {
        some: {
          event: {
            uuid: eventUUID,
          },
        },
      },
    };

    const itemCount: number = await this.prisma.user.count({
      where,
    });
    const data = await this.prisma.user.findMany({
      take: page.take,
      skip: page.skip,
      orderBy: {
        name: page.order,
      },
      where,
    });

    const pageMetaDto = new PageMetaDto(page, itemCount);

    return new PageDto(
      data.map((d) => UserDto.removeBaseFieldsAndPassword(d)),
      pageMetaDto,
    );
  }

  async paginateByMyGroup(groupUUID: string, page: PageOptionsBaseDto) {
    const where = { groups: { some: { group: { uuid: groupUUID } } } };

    const itemCount: number = await this.prisma.user.count({
      where,
    });
    const data = await this.prisma.user.findMany({
      take: page.take,
      skip: page.skip,
      orderBy: {
        name: page.order,
      },
      where,
    });

    const pageMetaDto = new PageMetaDto(page, itemCount);

    return new PageDto(
      data.map((d) => UserDto.removeBaseFieldsAndPassword(d)),
      pageMetaDto,
    );
  }

  create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findByUUID(uuid: string) {
    return this.prisma.user.findUnique({ where: { uuid } });
  }

  updateConfirmEmailAndStatus(
    uuid: string,
    confirmEmail: boolean,
    status: UserStatus,
  ) {
    return this.prisma.user.update({
      data: { confirmEmail, status },
      where: { uuid },
    });
  }

  updateProfile(userId: number, update: UpdateUserDto) {
    return this.prisma.$transaction([
      this.prisma.knowledge.deleteMany({ where: { fk_id_user: userId } }),
      this.prisma.socialNetwork.deleteMany({ where: { fk_id_user: userId } }),
      this.prisma.user.update({
        data: {
          ...update,
          knowledge: {
            createMany: {
              data: update.knowledge,
            },
          },
          socialNetworks: {
            createMany: {
              data: update.socialNetworks,
            },
          },
        },
        where: {
          id: userId,
        },
      }),
    ]);
  }

  findWithProfileByUUID(uuid: string) {
    return this.prisma.user.findUnique({
      where: { uuid },
      include: {
        knowledge: { select: { name: true, description: true } },
        socialNetworks: { select: { type: true, link: true } },
      },
    });
  }

  updatePhotoUrl(userId: number, photoUrl: string) {
    return this.prisma.user.update({
      data: {
        photoUrl,
      },
      where: {
        id: userId,
      },
    });
  }

  async findByWhere(page: PageOptionsBaseDto, where: Prisma.UserWhereInput) {
    const itemCount: number = await this.prisma.user.count({
      where,
    });
    const data = await this.prisma.user.findMany({
      take: page.take,
      skip: page.skip,
      orderBy: {
        name: page.order,
      },
      where,
    });

    return {
      data,
      itemCount,
    };
  }
}
