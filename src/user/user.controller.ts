import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { IsPublic } from 'src/auth/decorators/is-public.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { PageOptionUserGroupDto } from './dto/page-option-user-group.dto';
import { PageOptionUserEventDto } from './dto/page-option-user-event.dto';

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
  async paginateByGroup(@Query() page: PageOptionUserGroupDto) {
    await this.userService.paginateByGroup(page);
  }

  @Get('/page/event')
  async paginateByEvent(@Query() page: PageOptionUserEventDto) {
    await this.userService.paginateByEvent(page);
  }

  @Get('/confirm-email/:uuid')
  async confirmEmail(@Param('uuid') uuid: string) {
    await this.userService.setConfirmEmail(uuid);
  }
}
