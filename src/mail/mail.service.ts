import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { CreateMailDto } from './dto/create-mail.dto';
import { UpdateMailDto } from './dto/update-mail.dto';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  create(createMailDto: CreateMailDto) {
    return 'This action adds a new mail';
  }

  findAll() {
    return `This action returns all mail`;
  }

  findOne(id: number) {
    return `This action returns a #${id} mail`;
  }

  update(id: number, updateMailDto: UpdateMailDto) {
    return `This action updates a #${id} mail`;
  }

  remove(id: number) {
    return `This action removes a #${id} mail`;
  }

  async sendMail(email: string, name: string) {
    console.log(email);
    console.log(join(__dirname, 'utils', 'emails', 'templates'));
    await this.mailerService.sendMail({
      to: email,
      /* from: 'andre.godasi@hotmail.com', */
      subject: 'Teste 2',
      template: 'email',
      context: {
        name: name,
      },
    });
  }
}
