import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { IsPublic } from 'src/auth/decorators/is-public.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { PageOptionUserGroupDto } from './dto/page-option-user-group.dto';
import { PageOptionUserEventDto } from './dto/page-option-user-event.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { PageOptionsBaseDto } from 'src/common/page/page-options-base.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @IsPublic()
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get('/page/group')
  paginateByGroup(@Query() page: PageOptionUserGroupDto) {
    return this.userService.paginateByGroup(page);
  }

  @Get('/page/event/:eventIdentifier')
  paginateByEvent(
    @Param('eventIdentifier') eventIdentifier: string,
    @Query() page: PageOptionsBaseDto,
  ) {
    return this.userService.paginateByEvent(eventIdentifier, page);
  }

  @Get('/my-event/:eventUUID/paginated')
  paginateByMyEvent(
    @CurrentUser() currentUser: User,
    @Param('eventUUID') eventUUID: string,
    @Query() page: PageOptionsBaseDto,
  ) {
    return this.userService.paginateByMyEvent(eventUUID, currentUser, page);
  }

  @Get('/my-group/:groupUUID/paginated')
  paginateByMyGroup(
    @CurrentUser() currentUser: User,
    @Param('groupUUID') groupUUID: string,
    @Query() page: PageOptionsBaseDto,
  ) {
    return this.userService.paginateByMyGroup(groupUUID, currentUser, page);
  }

  @IsPublic()
  @Put('/confirm-email/:uuid')
  async confirmEmail(@Param('uuid') uuid: string) {
    const data = await this.userService.setConfirmEmail(uuid);
    return data;
  }

  @Put('/current/profile')
  async updateCurrentProfile(
    @CurrentUser() currentUser: User,
    @Body() updateDto: UpdateUserDto,
  ) {
    return this.userService.updateProfile(currentUser, updateDto);
  }

  @Get('/current/profile')
  async getCurrentProfile(@CurrentUser() currentUser: User) {
    return this.userService.findWithProfileByUUID(currentUser.uuid);
  }

  @Get('/:uuid/profile')
  async getProfileByUUID(@Param('uuid') uuid: string) {
    return this.userService.findWithProfileByUUID(uuid);
  }

  @Post('/photo')
  @UseInterceptors(FileInterceptor('photo'))
  async uploadPhoto(
    @CurrentUser() currentUser: User,
    @UploadedFile() photo: Express.Multer.File,
  ) {
    await this.userService.uploadPhoto(currentUser, photo);
  }
}
