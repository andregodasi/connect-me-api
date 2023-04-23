import { Injectable } from '@nestjs/common';
import { UserGroup } from '@prisma/client';
import { FileService } from 'src/file/file.service';
import { User } from 'src/user/entities/user.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { PageOptionGroupDto } from './dto/page-option-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from './entities/group.entity';
import { GroupRepository } from './group.repository';

@Injectable()
export class GroupService {
  constructor(
    private readonly groupRepository: GroupRepository,
    private readonly fileService: FileService,
  ) {}

  async create(
    currentUser: User,
    createGroupDto: CreateGroupDto,
  ): Promise<Group> {
    if (createGroupDto.newCoverName && createGroupDto.newCoverUrl) {
      const cover = await this.fileService.uploadPublicFileFromUrl(
        createGroupDto.newCoverUrl,
        createGroupDto.newCoverName,
      );

      createGroupDto.coverUrl = cover.url;
      delete createGroupDto.newCoverUrl;
      delete createGroupDto.newCoverName;
    }
    return this.groupRepository.create(currentUser, createGroupDto);
  }

  async createWithFile(
    currentUser: User,
    createGroupDto: any,
    communityImage: Express.Multer.File,
  ) /* : Promise<Group> */ {
    if (communityImage) {
      const infoImage = await this.fileService.uploadPublicFile(
        communityImage.buffer,
        communityImage.originalname,
      );
    }
    return this.groupRepository.create(currentUser, createGroupDto);
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

  async update(id: string, updateGroupDto: UpdateGroupDto) {
    if (updateGroupDto.newCoverName && updateGroupDto.newCoverUrl) {
      const cover = await this.fileService.uploadPublicFileFromUrl(
        updateGroupDto.newCoverUrl,
        updateGroupDto.newCoverName,
      );

      updateGroupDto.coverUrl = cover.url;
      delete updateGroupDto.newCoverUrl;
      delete updateGroupDto.newCoverName;
    }

    return this.groupRepository.update(id, updateGroupDto);
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
}
