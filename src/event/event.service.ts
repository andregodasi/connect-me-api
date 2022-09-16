import { Injectable } from '@nestjs/common';
import { PageOptionsDto } from 'src/common/repository/dto/page-options.dto';
import { User } from '../user/entities/user.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from './entities/event.entity';
import { EventRepository } from './event.repository';

@Injectable()
export class EventService {
  constructor(private readonly eventRepository: EventRepository) {}

  async create(
    currntUser: User,
    createEventDto: CreateEventDto,
  ): Promise<Event> {
    return await this.eventRepository.create(currntUser, createEventDto);
  }

  findAll() {
    return this.eventRepository.findAll();
  }

  findOne(id: number) {
    return `This action returns a #${id} event`;
  }

  update(id: number, updateEventDto: UpdateEventDto) {
    return `This action updates a #${id} event`;
  }

  remove(id: number) {
    return `This action removes a #${id} event`;
  }

  async getPaginated(page: number) {
    return this.eventRepository.getPaginated(new PageOptionsDto(page));
  }

  async getMyPaginated(page: number, currentUser: User) {
    return this.eventRepository.getMyPaginated(
      new PageOptionsDto(page),
      currentUser,
    );
  }
}
