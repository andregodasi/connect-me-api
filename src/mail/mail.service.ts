import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

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
}
