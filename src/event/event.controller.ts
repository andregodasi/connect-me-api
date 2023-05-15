import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  Put,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PageOptionEventDto } from './dto/page-option-event.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from '@prisma/client';
import { InsertEventComment } from './dto/insert-event-comment.dto';
import { PageOptionEventCommentDto } from './dto/page-option-event-comment.dto';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @UseInterceptors(FileInterceptor('coverImage'))
  createWithFile(
    @CurrentUser() currentUser: User,
    @UploadedFile() coverImage: Express.Multer.File,
    @Body() createEventDto: any,
  ) {
    return this.eventService.create(currentUser, createEventDto, coverImage);
  }

  @Post('subscribe')
  subscribe(
    @CurrentUser() currentUser: User,
    @Body() dataSubscribe: { uuid: string },
  ) {
    return this.eventService.subscribe(currentUser, dataSubscribe.uuid);
  }

  @Delete('unsubscribe/:uuid')
  unsubscribe(@CurrentUser() currentUser: User, @Param('uuid') uuid: string) {
    return this.eventService.unsubscribe(currentUser, uuid);
  }

  @Get()
  findAll() {
    return this.eventService.findAll();
  }

  @Get('my/group/:uuid')
  getEventsByGroup(
    @CurrentUser() currentUser: User,
    @Param('uuid') uuid: string,
    @Query('page')
    page: string,
  ) {
    return this.eventService.getEventsByGroup(+page, uuid, currentUser);
  }

  @Get('my/paginated')
  getMyPaginated(
    @CurrentUser() currentUser: User,
    @Query('page') page: string,
  ) {
    return this.eventService.getMyPaginated(+page, currentUser);
  }

  @Get('paginated')
  getPaginated(
    @Query() pageOption: PageOptionEventDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.eventService.getPaginated(pageOption, currentUser);
  }

  @Get(':identifier')
  findByIdentifier(@Param('identifier') identifier: string) {
    return this.eventService.findByIdentifier(identifier);
  }

  @Post('/:uuid/comment')
  async insertComment(
    @Param('uuid') uuid: string,
    @CurrentUser() currentUser: User,
    @Body() body: InsertEventComment,
  ) {
    await this.eventService.insertComment(
      currentUser,
      uuid,
      body.text,
      body.starts,
    );
  }

  @Get('/:uuid/comment/public-paginated')
  getPaginatedPublicComments(
    @Param('uuid') uuid: string,
    @Query() pageOption: PageOptionEventCommentDto,
  ) {
    return this.eventService.pageCommentsPublic(uuid, pageOption);
  }

  @Get('/:uuid/comment/paginated')
  getPaginatedComments(
    @CurrentUser() user: User,
    @Param('uuid') uuid: string,
    @Query() pageOption: PageOptionEventCommentDto,
  ) {
    return this.eventService.pageComments(user, uuid, pageOption);
  }

  @Put('/:uuid/publish')
  async publish(@CurrentUser() user: User, @Param('uuid') uuid: string) {
    await this.eventService.publish(user, uuid);
  }

  @Put('/comment/:uuid')
  async deleteComment(
    @CurrentUser() user: User,
    @Param('uuid') uuid: string,
    @Body() body: { reasonDeleted: string },
  ) {
    await this.eventService.deleteComment(user, uuid, body.reasonDeleted);
  }
}
