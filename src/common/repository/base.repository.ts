import { PrismaService } from 'src/prisma/prisma.service';
/* import { PageOptionsDto } from './dto/page-options.dto';
import { PageDto } from './dto/page.dto'; */
interface PaginateData {
  page: number;
}
export abstract class Base<T> {
  private entity: string;
  private repository: PrismaService;

  constructor(entity: string, repository: PrismaService) {
    this.entity = entity;
    this.repository = repository;
  }

  async create(data): Promise<any> {
    return this.repository[this.entity].create({ data: { ...data } });
  }

  async findAll(fields?: []): Promise<any[]> {
    let query = fields
      ? {
          select: {
            ...fields,
          },
        }
      : {};
    return this.repository[this.entity].findMany({ ...query });
  }

  async findByIdentifier(identifier: string, fields?: []) {
    let query: any = {
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
    };

    if (Array.isArray(fields) && fields.length > 0) {
      query = { ...query, select: { ...fields } };
    }

    return this.repository[this.entity].findFirst({ ...query });
  }

  async update(id: string, data: any) {
    return await this.repository[this.entity].update({
      where: {
        uuid: id,
      },
      data: {
        ...data,
      },
    });
  }

  async delete(id: string) {
    return await this.repository[this.entity].group.delete({
      where: {
        uuid: id,
      },
    });
  }
}

/*  TODO: 
 async paginate({ page = 1, skip }: PageOptionsDto): Promise<PageDto<T>> {
    const take = 15;

    const data = await this.repository[this.entity].findMany({
      take,
      skip,
    });

    return {
      data: data,
      meta: {},
    };
  }
} */

/* example
public async getUsers(
  pageOptionsDto: PageOptionsDto
): Promise<PageDto<UserDto>> {
  const queryBuilder = this._userRepository.createQueryBuilder("user");

  queryBuilder
    .orderBy("user.createdAt", pageOptionsDto.order)
    .skip(pageOptionsDto.skip)
    .take(pageOptionsDto.take);

  const itemCount = await queryBuilder.getCount();
  const { entities } = await queryBuilder.getRawAndEntities();

  const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

  return new PageDto(entities, pageMetaDto);
} */
