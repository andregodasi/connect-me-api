import { Event, UserEvent } from '@prisma/client';

export type EventWithUsers = Event & {
  users: Partial<UserEvent>[];
  _count: { users: number };
};
