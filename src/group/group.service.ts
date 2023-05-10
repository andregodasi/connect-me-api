import { BadRequestException, Injectable } from '@nestjs/common';
import { User, UserGroup } from '@prisma/client';
import { FileService } from 'src/file/file.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { PageOptionGroupDto } from './dto/page-option-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from './entities/group.entity';
import { GroupRepository } from './group.repository';
import { PageOptionGroupCommentDto } from './dto/page-option-group-comment.dto';

@Injectable()
export class GroupService {
  constructor(
    private readonly groupRepository: GroupRepository,
    private readonly fileService: FileService,
  ) {}

  async create(
    currentUser: User,
    createGroupDto: CreateGroupDto,
    communityImage: Express.Multer.File,
  ): Promise<Group> {
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
        communityImage.buffer,
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

  async findAll() {
    return this.groupRepository.findAll();
  }

  async findByIdentifier(identifier: string) {
    return this.groupRepository.findByIdentifier(identifier);
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
        communityImage.buffer,
        updateGroupDto.slug,
      );
      updateGroupDto.coverUrl = infoImage.url;
    }

    return this.groupRepository.update(group.uuid, updateGroupDto);
  }

  async delete(id: string) {
    return this.groupRepository.delete(id);
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

  async pageComments(
    eventUUID: string,
    pageOptions: PageOptionGroupCommentDto,
  ) {
    return this.groupRepository.pageComments(eventUUID, pageOptions);
  }
}
