import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { User } from '@prisma/client';
import { MailService } from 'src/mail/mail.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class SendMessageService {
  constructor(
    private readonly userService: UserService,
    private readonly mailService: MailService,
  ) {}

  async sendMessage(currentUser: User, toUserUUID: string, message: string) {
    const toUser = await this.userService.findByUUIDWithID(toUserUUID);
    if (!toUser) {
      throw new UnprocessableEntityException('User not found');
    }

    await this.mailService.sendMessage(currentUser, toUser, message);
  }
}
