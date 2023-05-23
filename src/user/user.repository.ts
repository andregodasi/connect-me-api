import { Injectable } from '@nestjs/common';
import { PageMetaDto } from 'src/common/repository/dto/page-meta.dto';
import { PageOptionsBaseDto } from 'src/common/repository/dto/page-options-base.dto';
import { PageDto } from 'src/common/repository/dto/page.dto';
import { PrismaService } from 'src/prisma/prisma.service';
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
}
