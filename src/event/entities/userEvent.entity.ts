import { User } from '@prisma/client';
import { Event } from './event.entity';

export class UserEvent {
  id?: number;
  event: Event;
  user: User;
}
