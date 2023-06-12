import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Event, EventNotificationType, User, UserEvent } from '@prisma/client';
import { PageOptionsDto } from 'src/common/page/page-options.dto';
import { FileService } from 'src/file/file.service';
import { GroupService } from 'src/group/group.service';
import { MailService } from 'src/mail/mail.service';
import { EventNotificationService } from './../event-notification/event-notification.service';
import { CreateEventDto } from './dto/create-event.dto';
import { PageOptionEventCommentDto } from './dto/page-option-event-comment.dto';
import { PageOptionEventDto } from './dto/page-option-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventRepository } from './event.repository';
import { PageDto } from 'src/common/page/page.dto';
import { EventWithUsers } from 'src/common/types/event-with-users.type';

@Injectable()
export class EventService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly groupService: GroupService,
    private readonly fileService: FileService,
    private readonly mailService: MailService,
    private readonly eventNotificationService: EventNotificationService,
  ) {}

  private static userIsFollowed(event: any, user: User) {
    return event.users.some((u) => user.uuid === u.user.uuid);
  }

  private static prepareEntity(event: EventWithUsers, user: User) {
    const isSubscribed = this.userIsFollowed(event, user);

    event['isSubscribed'] = isSubscribed;
    event['countUsers'] = event._count.users;

    delete event._count;
    delete event.id;
    delete event.groupId;

    return event;
  }

  async create(
    currentUser: User,
    createEventDto: CreateEventDto,
    coverImage: Express.Multer.File,
  ) {
    const group = await this.groupService.findByUUID(createEventDto.uuidGroup);

    if (!group.isPublised) {
      throw new BadRequestException('Group is not publised');
    }

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

  async findByIdentifier(currentUser: User, identifier: string) {
    const event = await this.eventRepository.findByIdentifier(identifier);
    return EventService.prepareEntity(event, currentUser);
  }

  async findByUUID(uuid: string) {
    const event = await this.eventRepository.findByUUID(uuid);
    if (!event) {
      throw new UnprocessableEntityException('event not found');
    }
    return event;
  }

  async getPaginated(pageOption: PageOptionEventDto, currentUser: User) {
    const paged = await this.eventRepository.getPaginated(
      pageOption,
      currentUser,
    );
    const events = paged.data.map((e) =>
      EventService.prepareEntity(e, currentUser),
    );
    return new PageDto(events, paged.meta);
  }

  async getMyPaginated(page: number, currentUser: User) {
    const paged = await this.eventRepository.getMyPaginated(
      new PageOptionsDto(page),
      currentUser,
    );
    const events = paged.data.map((e) =>
      EventService.prepareEntity(e, currentUser),
    );
    return new PageDto(events, paged.meta);
  }

  async getEventsByGroup(page: number, uuid: string, currentUser: User) {
    const group = await this.groupService.findByUUID(uuid);

    const userIsAdmin = GroupService.userIsAdmin(currentUser, group);
    if (!userIsAdmin) {
      throw new UnauthorizedException('you are not admin');
    }

    const paged = await this.eventRepository.getEventsByGroup(
      new PageOptionsDto(page),
      uuid,
      currentUser,
    );

    const events = paged.data.map((e) =>
      EventService.prepareEntity(e, currentUser),
    );
    return new PageDto(events, paged.meta);
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

  async pageCommentsPublic(
    eventUUID: string,
    pageOptions: PageOptionEventCommentDto,
  ) {
    return this.eventRepository.pageComments(eventUUID, false, pageOptions);
  }

  async pageComments(
    user: User,
    eventUUID: string,
    pageOptions: PageOptionEventCommentDto,
  ) {
    const event = await this.eventRepository.findByUUID(eventUUID);

    const userIsAdmin = GroupService.userIsAdmin(user, event.group);
    if (!userIsAdmin) {
      throw new UnauthorizedException('you are not admin');
    }

    return this.eventRepository.pageComments(eventUUID, true, pageOptions);
  }

  async publish(user: User, uuid: string) {
    const event = await this.eventRepository.findByUUID(uuid);

    if (!event.group.isPublised) {
      throw new UnprocessableEntityException('Group is not publised');
    }

    const userIsAdmin = GroupService.userIsAdmin(user, event.group);
    if (!userIsAdmin) {
      throw new UnauthorizedException('you are not admin');
    }

    if (event.isPublised) {
      return;
    }

    await this.eventRepository.setPublised(uuid, true);

    await this.eventNotificationService.insert(
      event.group.users.map((u) => u.fk_id_user),
      event.id,
      EventNotificationType.NEW_EVENT,
    );
  }

  async deleteComment(
    user: User,
    eventUUID: string,
    commentUUID: string,
    reasonDeleted: string,
  ) {
    const comment = await this.eventRepository.findCommentByUUID(
      eventUUID,
      commentUUID,
    );

    if (!comment?.id) {
      throw new NotFoundException();
    }

    const userIsAdmin = GroupService.userIsAdmin(user, comment.event.group);
    if (!userIsAdmin) {
      throw new UnauthorizedException('you are not admin');
    }

    await this.eventRepository.deleteComment(comment.id, reasonDeleted);

    await this.mailService.sendReasonEventCommentDeleted(
      comment,
      reasonDeleted,
    );
  }

  async update(
    uuid: string,
    currentUser: User,
    eventImage: Express.Multer.File,
    updateEventDto: UpdateEventDto,
  ) {
    const event = await this.eventRepository.findByUUID(uuid);
    if (!event) {
      throw new BadRequestException(`Event not found.`);
    }

    const group = await this.groupService.findByUUID(event.group.uuid);
    if (!group) {
      throw new BadRequestException(`Group not found.`);
    }

    const isCheckUserAdmin = group.users.find(
      (data) =>
        data.user.uuid === currentUser.uuid &&
        data.role === 'ADMIN' &&
        data.status === 'ACTIVATED',
    );

    if (!isCheckUserAdmin) {
      throw new BadRequestException(
        `User must be an admin of a community to be able to make a change.`,
      );
    }

    if (!eventImage && !updateEventDto.coverUrl) {
      throw new BadRequestException(`Mandatory cover image.`);
    }

    let infoImage: { key: string; url: string };
    if (eventImage) {
      infoImage = await this.fileService.uploadPublicFile(
        eventImage,
        updateEventDto.slug,
      );
      updateEventDto.coverUrl = infoImage.url;
    }

    if (updateEventDto.limitParticipants < event.limitParticipants) {
      throw new BadRequestException(
        `Update limit participants must be greater than ${event.limitParticipants}`,
      );
    }

    delete updateEventDto.uuidGroup;

    return this.eventRepository.update(event.uuid, {
      ...updateEventDto,
      coverUrl: updateEventDto.coverUrl,
      initialDate: new Date(updateEventDto.initialDate),
      finishDate: new Date(updateEventDto.finishDate),
      limitParticipants: Number(updateEventDto.limitParticipants),
    });
  }

  async findSubscribed(user: User, uuid: string) {
    const event = await this.eventRepository.findByUUID(uuid);

    const userIsAdmin = GroupService.userIsAdmin(user, event.group);
    if ((!event.isPublised || !event.group.isPublised) && !userIsAdmin) {
      throw new BadRequestException('event is not found');
    }

    return this.eventRepository.findSubscribed(event.id);
  }

  findByDate(date: Date) {
    return this.eventRepository.findByDate(date);
  }

  async deleteEvent(user: User, uuid: string) {
    const event = await this.findByUUID(uuid);
    if (!GroupService.userIsAdmin(user, event.group)) {
      throw new UnauthorizedException();
    }
    await this.eventRepository.deleteEvent(event.id);
  }
}
