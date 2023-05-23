import { User } from '@prisma/client';
import { exclude } from 'src/utils/utils';

export class UserDto {
  static removeBaseFieldsAndPassword(user: User) {
    return exclude(user, ['id', 'createdAt', 'updatedAt', 'password']);
  }
}
