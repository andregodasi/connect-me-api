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

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @IsPublic()
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('/page/group')
  paginateByGroup(@Query() page: PageOptionUserGroupDto) {
    return this.userService.paginateByGroup(page);
  }

  @Get('/page/event')
  paginateByEvent(@Query() page: PageOptionUserEventDto) {
    return this.userService.paginateByEvent(page);
  }

  @IsPublic()
  @Get('/confirm-email/:uuid')
  async confirmEmail(@Param('uuid') uuid: string) {
    await this.userService.setConfirmEmail(uuid);
  }

  @Put('/:uuid')
  async update(@Param('uuid') uuid: string, @Body() updateDto: UpdateUserDto) {
    return this.userService.update(uuid, updateDto);
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
