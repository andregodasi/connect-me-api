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
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from 'src/user/entities/user.entity';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  create(
    @CurrentUser() currentUser: User,
    @Body() createEventDto: CreateEventDto,
  ) {
    return this.eventService.create(currentUser, createEventDto);
  }

  @Get()
  findAll() {
    return this.eventService.findAll();
  }

  @Get('my/paginated')
  getMyPaginated(
    @CurrentUser() currentUser: User,
    @Query('page') page: string,
  ) {
    return this.eventService.getMyPaginated(+page, currentUser);
  }

  @Get('paginated')
  getPaginated(@Query('page') page: string) {
    return this.eventService.getPaginated(+page);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventService.findOne(+id);
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
