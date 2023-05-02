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
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { PageOptionEventDto } from './dto/page-option-event.dto';
import { FileInterceptor } from '@nestjs/platform-express';

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

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventService.update(+id, updateEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventService.remove(+id);
  }
}
