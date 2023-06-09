import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Prisma, User, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PageMetaDto } from 'src/common/repository/dto/page-meta.dto';
import { PageOptionsBaseDto } from 'src/common/repository/dto/page-options-base.dto';
import { PageDto } from 'src/common/repository/dto/page.dto';
import { EventService } from 'src/event/event.service';
import { FileService } from 'src/file/file.service';
import { GroupService } from 'src/group/group.service';
import { exclude } from 'src/utils/utils';
import { MailService } from './../mail/mail.service';
import { CreateUserDto } from './dto/create-user.dto';
import { PageOptionUserGroupDto } from './dto/page-option-user-group.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
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

    const createdUser = await this.userRepository.create(data);

    this.mailService
      .sendConfirmEmail(createdUser.email, createdUser.uuid)
      .catch((e) => console.error(`Error to send confirm email: ${e}`));

    return UserDto.removeBaseFieldsAndPassword(createdUser);
  }

  findByEmailWithPassword(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async findByUUIDWithID(uuid: string) {
    const user = await this.userRepository.findByUUID(uuid);
    return UserService.removePassword(user);
  }

  async setConfirmEmail(uuid: string) {
    await this.userRepository.updateConfirmEmailAndStatus(
      uuid,
      true,
      UserStatus.ACTIVATED,
    );
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

    const { data, itemCount } = await this.userRepository.findByWhere(
      page,
      where,
    );

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

    const { data, itemCount } = await this.userRepository.findByWhere(
      page,
      where,
    );

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

  async updateProfile(user: User, update: UpdateUserDto) {
    await this.userRepository.updateProfile(user.id, update);
    return this.findWithProfileByUUID(user.uuid);
  }

  async findWithProfileByUUID(uuid: string) {
    const ret = await this.userRepository.findWithProfileByUUID(uuid);
    return UserDto.removeBaseFieldsAndPassword(ret);
  }

  async uploadPhoto(user: User, photo: Express.Multer.File) {
    const infoImage = await this.fileService.uploadPublicFile(photo, user.uuid);
    await this.userRepository.updatePhotoUrl(user.id, infoImage.url);
  }
}
