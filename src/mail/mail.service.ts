import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { EventComment, GroupComment, User } from '@prisma/client';
import { UserWithoutPassword } from 'src/common/types/user-wtihout-password.type';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendConfirmEmail(email: string, uuid: string, name: string) {
    const url = `${process.env.FRONTEND_URL}/confirm-email/${uuid}`;
    await this.mailerService.sendMail({
      to: email,
      subject: 'Confirmação de e-mail!',
      template: 'confirm_email',
      context: {
        url,
        name,
      },
    });
  }

  async sendRecoveryPassword(email: string, name: string, uuid: string) {
    const url = `${process.env.FRONTEND_URL}/recovery-password/${uuid}`;
    await this.mailerService.sendMail({
      to: email,
      subject: 'Solicitação de recuperação de senha.',
      template: 'recovery_password',
      context: {
        url,
        name,
      },
    });
  }

  async sendReasonEventCommentDeleted(
    eventComment: EventComment & { user: User },
    reasonDeleted: string,
  ) {
    await this.mailerService.sendMail({
      to: eventComment.user.email,
      subject: 'Event Comment Deleted',
      template: 'reason_event_comment_deleted',
      context: {
        reason: reasonDeleted,
      },
    });
  }

  async sendReasonGroupCommentDeleted(
    groupComment: GroupComment & { user: User },
    reasonDeleted: string,
  ) {
    await this.mailerService.sendMail({
      to: groupComment.user.email,
      subject: 'Group Comment Deleted',
      template: 'reason_group_comment_deleted',
      context: {
        reason: reasonDeleted,
      },
    });
  }

  async sendMessage(
    fromUser: UserWithoutPassword,
    toUser: UserWithoutPassword,
    message: string,
  ) {
    await this.mailerService.sendMail({
      to: toUser.email,
      cc: fromUser.email,
      text: message,
    });
  }
}
