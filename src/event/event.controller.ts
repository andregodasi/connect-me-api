import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { InsertEventComment } from './dto/insert-event-comment.dto';
import { PageOptionEventCommentDto } from './dto/page-option-event-comment.dto';
import { PageOptionEventDto } from './dto/page-option-event.dto';
import { EventService } from './event.service';

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

  @Delete(':uuid')
  async deleteEvent(
    @CurrentUser() currentUser: User,
    @Param('uuid') uuid: string,
  ) {
    await this.eventService.deleteEvent(currentUser, uuid);
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

  @Put('/:eventUUID/comment/:commentUUID')
  async deleteComment(
    @CurrentUser() user: User,
    @Param('eventUUID') eventUUID: string,
    @Param('commentUUID') commentUUID: string,
    @Body() body: { reasonDeleted: string },
  ) {
    await this.eventService.deleteComment(
      user,
      eventUUID,
      commentUUID,
      body.reasonDeleted,
    );
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('coverImage'))
  update(
    @Param('id') id: string,
    @CurrentUser() currentUser: User,
    @UploadedFile() coverImage: Express.Multer.File,
    @Body() updateEventDto: any,
  ) {
    return this.eventService.update(
      id,
      currentUser,
      coverImage,
      updateEventDto,
    );
  }

  @Get('/:uuid/subscribed')
  getSubscribed(@CurrentUser() user: User, @Param('uuid') uuid: string) {
    return this.eventService.findSubscribed(user, uuid);
  }
}
