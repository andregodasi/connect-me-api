import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { User, UserEvent } from '@prisma/client';
import { PageOptionsDto } from 'src/common/repository/dto/page-options.dto';
import { FileService } from 'src/file/file.service';
import { GroupService } from 'src/group/group.service';
import { MailService } from 'src/mail/mail.service';
import { CreateEventDto } from './dto/create-event.dto';
import { PageOptionEventCommentDto } from './dto/page-option-event-comment.dto';
import { PageOptionEventDto } from './dto/page-option-event.dto';
import { EventRepository } from './event.repository';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly groupService: GroupService,
    private readonly fileService: FileService,
    private readonly mailService: MailService,
  ) {}

  async create(
    currentUser: User,
    createEventDto: CreateEventDto,
    coverImage: Express.Multer.File,
  ) {
    const group = await this.groupService.findByIdentifier(
      createEventDto.uuidGroup,
    );

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

  findAll() {
    return this.eventRepository.findAll();
  }

  findByIdentifier(identifier: string) {
    return this.eventRepository.findByIdentifier(identifier);
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
    const event = await this.findByIdentifier(uuid);
    if (!event) {
      throw new BadRequestException(`Event not found.`);
    }

    const group = await this.groupService.findByIdentifier(event.group.uuid);
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
}
