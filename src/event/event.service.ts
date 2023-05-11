import { BadRequestException, Injectable } from '@nestjs/common';
import { User, UserEvent } from '@prisma/client';
import { PageOptionsDto } from 'src/common/repository/dto/page-options.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { PageOptionEventDto } from './dto/page-option-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from './entities/event.entity';
import { EventRepository } from './event.repository';
import { FileService } from 'src/file/file.service';
import { GroupService } from 'src/group/group.service';
import { Group } from '../group/entities/group.entity';
import { PageOptionEventCommentDto } from './dto/page-option-event-comment.dto';

@Injectable()
export class EventService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly groupService: GroupService,
    private readonly fileService: FileService,
  ) {}

  async create(
    currentUser: User,
    createEventDto: CreateEventDto,
    coverImage: Express.Multer.File,
  ): Promise<Event> {
    const group: Group = await this.groupService.findByIdentifier(
      createEventDto.uuidGroup,
    );

    //TODO: verificar se o grupo está publicado

    const slugAlreadyExists = await this.eventRepository.findByIdentifier(
      createEventDto.slug,
    );

    if (slugAlreadyExists) {
      throw new BadRequestException(
        `The slug ${createEventDto.slug} already exists`,
      );
    }

    let infoImage: { key: string; url: string };
    if (coverImage) {
      infoImage = await this.fileService.uploadPublicFile(
        coverImage,
        createEventDto.slug,
      );
    }

    delete createEventDto.uuidGroup;

    return this.eventRepository.create(
      currentUser,
      {
        ...createEventDto,
        coverUrl: infoImage.url,
        initialDate: new Date(createEventDto.initialDate),
        finishDate: new Date(createEventDto.finishDate),
        limitParticipants: Number(createEventDto.limitParticipants),
      },
      group,
    );
  }

  async subscribe(currntUser: User, uuid: string): Promise<UserEvent> {
    return this.eventRepository.subscribe(currntUser, uuid);
  }

  async unsubscribe(currntUser: User, uuid: string) {
    return this.eventRepository.unsubscribe(currntUser, uuid);
  }

  findAll() {
    return this.eventRepository.findAll();
  }

  async findByIdentifier(identifier: string) {
    return this.eventRepository.findByIdentifier(identifier);
  }

  async update(id: number, updateEventDto: UpdateEventDto) {
    return `This action updates a #${id} event`;
  }

  async remove(id: number) {
    return `This action removes a #${id} event`;
  }

  async getPaginated(pageOption: PageOptionEventDto, currentUser: User) {
    return this.eventRepository.getPaginated(
      new PageOptionEventDto(
        pageOption.page,
        pageOption.take,
        pageOption.q,
        pageOption.isFollowing,
        pageOption.isSubscribed,
      ),
      currentUser,
    );
  }

  async getMyPaginated(page: number, currentUser: User) {
    return this.eventRepository.getMyPaginated(
      new PageOptionsDto(page),
      currentUser,
    );
  }

  async getEventsByGroup(page: number, uuid: string, currentUser: User) {
    return this.eventRepository.getEventsByGroup(
      new PageOptionsDto(page),
      uuid,
      currentUser,
    );
  }

  async insertComment(
    user: User,
    eventUUID: string,
    text: string,
    starts: number,
  ) {
    const event = await this.eventRepository.findByUUID(eventUUID);
    await this.eventRepository.insertComment(user, event, text, starts);
  }

  async pageComments(
    eventUUID: string,
    pageOptions: PageOptionEventCommentDto,
  ) {
    return this.eventRepository.pageComments(eventUUID, pageOptions);
  }
}
