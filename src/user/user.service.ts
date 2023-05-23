import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Prisma, User, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PageMetaDto } from 'src/common/repository/dto/page-meta.dto';
import { PageDto } from 'src/common/repository/dto/page.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from './../mail/mail.service';
import { CreateUserDto } from './dto/create-user.dto';
import { PageOptionUserEventDto } from './dto/page-option-user-event.dto';
import { PageOptionUserGroupDto } from './dto/page-option-user-group.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { exclude } from 'src/utils/utils';
import { FileService } from 'src/file/file.service';
import { PageOptionsBaseDto } from 'src/common/repository/dto/page-options-base.dto';
import { EventService } from 'src/event/event.service';
import { GroupService } from 'src/group/group.service';
import { UserDto } from './dto/user.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly fileService: FileService,
    private readonly userRepository: UserRepository,
    private readonly eventService: EventService,
    private readonly groupService: GroupService,
  ) {}

  private static removePassword(user: User) {
    return exclude(user, ['password']);
  }

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

    return UserDto.removeBaseFieldsAndPassword(createdUser);
  }

  findByEmailWithPassword(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByUUIDWithID(uuid: string) {
    const user = await this.prisma.user.findUnique({ where: { uuid } });
    return UserService.removePassword(user);
  }

  async findAll() {
    const users = await this.prisma.user.findMany();
    return users.map((u) => UserDto.removeBaseFieldsAndPassword(u));
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

  async paginateByEvent(eventIdentifier: string, page: PageOptionsBaseDto) {
    const where = {
      events: {
        some: {
          event: {
            uuid: eventIdentifier,
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

  async paginateByMyEvent(
    eventUUID: string,
    currentUser: User,
    page: PageOptionsBaseDto,
  ) {
    const event = await this.eventService.findByUUID(eventUUID);

    const group = await this.groupService.findByUUID(event.group.uuid);

    const userIsAdmin = GroupService.userIsAdmin(currentUser, group);
    if (!userIsAdmin) {
      throw new UnauthorizedException('you are not admin');
    }

    return this.userRepository.paginateByMyEvent(eventUUID, page);
  }

  async paginateByMyGroup(
    groupUUID: string,
    currentUser: User,
    page: PageOptionsBaseDto,
  ) {
    const group = await this.groupService.findByUUID(groupUUID);

    const userIsAdmin = GroupService.userIsAdmin(currentUser, group);
    if (!userIsAdmin) {
      throw new UnauthorizedException('you are not admin');
    }

    return this.userRepository.paginateByMyGroup(groupUUID, page);
  }

  async update(user: User, update: UpdateUserDto) {
    await this.prisma.$transaction([
      this.prisma.knowledge.deleteMany({ where: { fk_id_user: user.id } }),
      this.prisma.socialNetwork.deleteMany({ where: { fk_id_user: user.id } }),
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
          id: user.id,
        },
      }),
    ]);

    return this.findWithProfileByUUID(user.uuid);
  }

  async findWithProfileByUUID(uuid: string) {
    const ret = await this.prisma.user.findUnique({
      where: { uuid },
      include: {
        knowledge: { select: { name: true, description: true } },
        socialNetworks: { select: { type: true, link: true } },
      },
    });

    return UserDto.removeBaseFieldsAndPassword(ret);
  }

  async uploadPhoto(user: User, photo: Express.Multer.File) {
    const infoImage = await this.fileService.uploadPublicFile(photo, user.uuid);

    await this.prisma.user.update({
      data: {
        photoUrl: infoImage.url,
      },
      where: {
        id: user.id,
      },
    });
  }
}
