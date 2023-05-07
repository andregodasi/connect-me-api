import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { PageOptionGroupDto } from './dto/page-option-group.dto';
import { GroupService } from './group.service';
import { User } from '@prisma/client';

@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @UseInterceptors(FileInterceptor('coverImage'))
  createWithFile(
    @CurrentUser() currentUser: User,
    @UploadedFile() coverImage: Express.Multer.File,
    @Body() createGroupDto: any,
  ) {
    return this.groupService.create(currentUser, createGroupDto, coverImage);
  }

  @Post('follow')
  subscribe(
    @CurrentUser() currentUser: User,
    @Body() dataSubscribe: { uuid: string },
  ) {
    return this.groupService.follow(currentUser, dataSubscribe.uuid);
  }

  @Delete('unfollow/:uuid')
  unsubscribe(@CurrentUser() currentUser: User, @Param('uuid') uuid: string) {
    return this.groupService.unfollow(currentUser, uuid);
  }

  @Get()
  findAll() {
    return this.groupService.findAll();
  }

  @Get('paginated')
  getPaginated(
    @Query() pageOption: PageOptionGroupDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.groupService.getPaginated(pageOption, currentUser);
  }

  @Get('my')
  findAllMyGroups(@CurrentUser() currentUser: User) {
    return this.groupService.findAllMyGroups(currentUser);
  }

  @Get(':identifier')
  findByIdentifier(@Param('identifier') identifier: string) {
    return this.groupService.findByIdentifier(identifier);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('coverImage'))
  update(
    @Param('id') id: string,
    @CurrentUser() currentUser: User,
    @UploadedFile() coverImage: Express.Multer.File,
    @Body() updateGroupDto: any,
  ) {
    return this.groupService.update(
      id,
      currentUser,
      coverImage,
      updateGroupDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupService.delete(id);
  }
}
