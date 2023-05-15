import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { EventComment, GroupComment, User } from '@prisma/client';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendConfirmEmail(email: string, uuid: string) {
    const url = `${process.env.API_URL}/user/confirm-email/${uuid}`;
    await this.mailerService.sendMail({
      to: email,
      subject: 'Confirm email',
      template: 'confirm_email',
      context: {
        url,
      },
    });
  }

  async sendRecoveryPassword(email: string, uuid: string) {
    const url = `${process.env.FRONTEND_URL}/recovery-password/${uuid}`;
    await this.mailerService.sendMail({
      to: email,
      subject: 'Recovery Password',
      template: 'recovery_password',
      context: {
        url,
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
}
