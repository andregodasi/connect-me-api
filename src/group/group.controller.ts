import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { User } from 'src/user/entities/user.entity';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  create(
    @CurrentUser() currentUser: User,
    @Body() createGroupDto: CreateGroupDto,
  ) {
    return this.groupService.create(currentUser, createGroupDto);
  }

  @Get()
  findAll() {
    return this.groupService.findAll();
  }

  @Get('paginated')
  getPaginated(@Query('page') page: string) {
    return this.groupService.findPaginated(+page);
  }

  @Get('my')
  findAllMyGroups(@CurrentUser() currentUser: User) {
    return this.groupService.findAllMyGroups(currentUser);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupService.findByIdentifier(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
    return this.groupService.update(id, updateGroupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupService.delete(id);
  }
}
