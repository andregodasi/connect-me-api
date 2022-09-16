import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PageOptionsDto } from 'src/common/repository/dto/page-options.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from 'src/user/entities/user.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from './entities/group.entity';
import { GroupRepository } from './group.repository';

@Injectable()
export class GroupService {
  constructor(private readonly grouprepository: GroupRepository) {}

  async create(
    currentUser: User,
    createGroupDto: CreateGroupDto,
  ): Promise<Group> {
    return this.grouprepository.create(currentUser, createGroupDto);
  }

  async findAll() {
    return this.grouprepository.findAll();
  }

  async findByIdentifier(identifier: string) {
    return this.grouprepository.findByIdentifier(identifier);
  }

  async update(id: string, updateGroupDto: UpdateGroupDto) {
    return this.grouprepository.update(id, updateGroupDto);
  }

  async delete(id: string) {
    return this.grouprepository.delete(id);
  }

  async findAllMyGroups(currentUser: User) {
    return this.grouprepository.findAllMyGroups(currentUser);
  }

  async findPaginated(page: number) {
    return this.grouprepository.findPaginated(new PageOptionsDto(page));
  }
}
