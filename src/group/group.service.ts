import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  Group,
  User,
  UserGroup,
  UserGroupRole,
  UserGroupStatus,
} from '@prisma/client';
import { FileService } from 'src/file/file.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { PageOptionGroupCommentDto } from './dto/page-option-group-comment.dto';
import { PageOptionGroupDto } from './dto/page-option-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupRepository } from './group.repository';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class GroupService {
  constructor(
    private readonly groupRepository: GroupRepository,
    private readonly fileService: FileService,
    private readonly mailService: MailService,
  ) {}

  public static userIsAdmin(user: User, group: Group & { users: UserGroup[] }) {
    if (!group) {
      throw new UnprocessableEntityException();
    }
    return (
      group.users.filter(
        (u) =>
          u.fk_id_user === user.id &&
          u.status == UserGroupStatus.ACTIVATED &&
          u.role == UserGroupRole.ADMIN,
      )?.length > 0
    );
  }

  async create(
    currentUser: User,
    createGroupDto: CreateGroupDto,
    communityImage: Express.Multer.File,
  ) {
    const slugAlreadyExists = await this.groupRepository.findByIdentifier(
      createGroupDto.slug,
    );

    if (slugAlreadyExists) {
      throw new BadRequestException(
        `The slug ${createGroupDto.slug} already exists`,
      );
    }
    let infoImage: { key: string; url: string };
    if (communityImage) {
      infoImage = await this.fileService.uploadPublicFile(
        communityImage,
        createGroupDto.slug,
      );
    }
    return this.groupRepository.create(currentUser, {
      ...createGroupDto,
      coverUrl: infoImage.url,
    });
  }

  async follow(currntUser: User, uuid: string): Promise<UserGroup> {
    return this.groupRepository.follow(currntUser, uuid);
  }

  async unfollow(currntUser: User, uuid: string) {
    return this.groupRepository.unfollow(currntUser, uuid);
  }

  async findByIdentifier(identifier: string) {
    return this.groupRepository.findByIdentifier(identifier);
  }

  async findByUUID(uuid: string) {
    const group = await this.groupRepository.findByUUID(uuid);
    if (!group) {
      throw new UnprocessableEntityException('group not found');
    }
    return group;
  }

  async update(
    uuid: string,
    currentUser: User,
    communityImage: Express.Multer.File,
    updateGroupDto: UpdateGroupDto,
  ) {
    const group = await this.findByIdentifier(uuid);
    if (!group) {
      throw new BadRequestException(`Group not found.`);
    }

    const isCheckUserAdmin = group.users.find(
      (data) =>
        data.user.uuid === currentUser.uuid &&
        data.role === 'ADMIN' &&
        data.status === 'ACTIVATED',
    );

    if (!isCheckUserAdmin) {
      throw new BadRequestException(
        `User must be an admin of a community to be able to make a change.`,
      );
    }

    if (!communityImage && !updateGroupDto.coverUrl) {
      throw new BadRequestException(`Mandatory cover image.`);
    }

    let infoImage: { key: string; url: string };
    if (communityImage) {
      infoImage = await this.fileService.uploadPublicFile(
        communityImage,
        updateGroupDto.slug,
      );
      updateGroupDto.coverUrl = infoImage.url;
    }

    return this.groupRepository.update(group.uuid, updateGroupDto);
  }

  async deleteGroup(user: User, uuid: string) {
    const group = await this.findByUUID(uuid);
    if (!GroupService.userIsAdmin(user, group)) {
      throw new UnauthorizedException();
    }
    await this.groupRepository.deleteGroup(group.id);
  }

  async findAllMyGroups(currentUser: User) {
    return this.groupRepository.findAllMyGroups(currentUser);
  }

  async getPaginated(pageOption: PageOptionGroupDto, currentUser: User) {
    return this.groupRepository.getPaginated(
      new PageOptionGroupDto(
        pageOption.page,
        pageOption.take,
        pageOption.q,
        pageOption.isFollowing,
      ),
      currentUser,
    );
  }

  async insertComment(
    user: User,
    groupUUID: string,
    text: string,
    starts: number,
  ) {
    const event = await this.groupRepository.findByUUID(groupUUID);
    await this.groupRepository.insertComment(user, event, text, starts);
  }

  async pageCommentsPublic(
    groupUUID: string,
    pageOptions: PageOptionGroupCommentDto,
  ) {
    return this.groupRepository.pageComments(groupUUID, false, pageOptions);
  }

  async pageComments(
    user: User,
    groupUUID: string,
    pageOptions: PageOptionGroupCommentDto,
  ) {
    const event = await this.groupRepository.findByUUID(groupUUID);

    const userIsAdmin = GroupService.userIsAdmin(user, event);
    if (!userIsAdmin) {
      throw new UnauthorizedException('you are not admin');
    }

    return this.groupRepository.pageComments(groupUUID, true, pageOptions);
  }

  async publish(user: User, uuid: string) {
    const group = await this.groupRepository.findByUUID(uuid);

    const userIsAdmin = GroupService.userIsAdmin(user, group);
    if (!userIsAdmin) {
      throw new UnauthorizedException('you are not admin');
    }

    if (group.isPublised) {
      return;
    }

    await this.groupRepository.setPublised(uuid, true);
  }

  async deleteComment(
    user: User,
    groupUUID: string,
    commentUUID: string,
    reasonDeleted: string,
  ) {
    const comment = await this.groupRepository.findCommentByUUID(
      groupUUID,
      commentUUID,
    );
    if (!comment?.id) {
      throw new NotFoundException();
    }

    const userIsAdmin = GroupService.userIsAdmin(user, comment.group);
    if (!userIsAdmin) {
      throw new UnauthorizedException('you are not admin');
    }

    await this.groupRepository.deleteComment(comment.id, reasonDeleted);

    await this.mailService.sendReasonGroupCommentDeleted(
      comment,
      reasonDeleted,
    );
  }

  async findFollowers(user: User, uuid: string) {
    const group = await this.groupRepository.findByUUID(uuid);
    if (!group.isPublised && !GroupService.userIsAdmin(user, group)) {
      throw new BadRequestException('group not found');
    }
    return this.groupRepository.findFollowers(group.id);
  }

  async findEvents(user: User, uuid: string) {
    const group = await this.groupRepository.findByUUID(uuid);
    const userIsAdmin = GroupService.userIsAdmin(user, group);
    if (!group.isPublised && !userIsAdmin) {
      throw new BadRequestException('group not found');
    }
    return this.groupRepository.findEvents(group.id, !userIsAdmin);
  }

  findAllIsPublised() {
    return this.groupRepository.findAllIsPublised();
  }
}
