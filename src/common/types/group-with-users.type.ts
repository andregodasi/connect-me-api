import { Group, UserGroup } from '@prisma/client';

export type GroupWithUsers = Group & {
  users: Partial<UserGroup>[];
  _count: { users: number };
};
