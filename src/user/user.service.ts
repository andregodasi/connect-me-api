import { Injectable } from '@nestjs/common';
import { Prisma, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PageMetaDto } from 'src/common/repository/dto/page-meta.dto';
import { PageDto } from 'src/common/repository/dto/page.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from './../mail/mail.service';
import { CreateUserDto } from './dto/create-user.dto';
import { PageOptionUserEventDto } from './dto/page-option-user-event.dto';
import { PageOptionUserGroupDto } from './dto/page-option-user-group.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  static encryptPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  async create(createUserDto: CreateUserDto) {
    const data: Prisma.UserCreateInput = {
      ...createUserDto,
      password: await UserService.encryptPassword(createUserDto.password),
      status: UserStatus.PENDING,
    };

    const createdUser = await this.prisma.user.create({ data });

    this.mailService
      .sendConfirmEmail(createdUser.email, createdUser.uuid)
      .catch((e) => console.error(`Error to send confirm email: ${e}`));

    return {
      ...createdUser,
      password: undefined,
    };
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findByUUID(uuid: string) {
    return this.prisma.user.findUnique({ where: { uuid } });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  async setConfirmEmail(uuid: string) {
    await this.prisma.user.update({
      data: { confirmEmail: true, status: UserStatus.ACTIVATED },
      where: { uuid },
    });
  }

  async paginateByGroup(page: PageOptionUserGroupDto) {
    const where = {
      groups: {
        some: {
          group: {
            uuid: page.groupUUID,
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
      select: {
        id: false,
        uuid: true,
        createdAt: false,
        updatedAt: false,
        email: true,
        nickname: true,
        name: true,
        password: false,
        confirmEmail: false,
        status: false,
      },
      orderBy: {
        name: page.order,
      },
      where,
    });

    const pageMetaDto = new PageMetaDto(page, itemCount);

    return new PageDto(data, pageMetaDto);
  }

  async paginateByEvent(page: PageOptionUserEventDto) {
    const where = {
      events: {
        some: {
          event: {
            uuid: page.eventUUID,
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
      select: {
        id: false,
        uuid: true,
        createdAt: false,
        updatedAt: false,
        email: true,
        nickname: true,
        name: true,
        password: false,
        confirmEmail: false,
        status: false,
      },
      orderBy: {
        name: page.order,
      },
      where,
    });

    const pageMetaDto = new PageMetaDto(page, itemCount);

    return new PageDto(data, pageMetaDto);
  }
}
