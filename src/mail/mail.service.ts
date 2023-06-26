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
      subject: 'Confirmação de e-mail! | Connect me',
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
      subject: 'Solicitação de recuperação de senha. | Connect me',
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
      subject: 'Seu comentáro foi arquivado! | Connect me',
      template: 'reason_event_comment_deleted',
      context: {
        eventName: eventComment['event']['name'],
        reason: reasonDeleted,
        comment: eventComment['text'],
      },
    });
  }

  async sendReasonGroupCommentDeleted(
    groupComment: GroupComment & { user: User },
    reasonDeleted: string,
  ) {
    await this.mailerService.sendMail({
      to: groupComment.user.email,
      subject: 'Seu comentáro foi arquivado! | Connect me',
      template: 'reason_group_comment_deleted',
      context: {
        communityName: groupComment['group']['name'],
        reason: reasonDeleted,
        comment: groupComment.text,
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
      subject: 'Você recebeu um salve ! | Connect me',
      template: 'send_hail',
      context: {
        message,
        fromName: fromUser.name,
        toName: toUser.name,
        fromProfileUrl: `${process.env.FRONTEND_URL}/profile/${fromUser.uuid}`,
      },
    });
  }
}
