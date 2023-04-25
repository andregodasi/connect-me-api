import { UserService } from 'src/user/user.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RecoveryPasswordService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async insert(userEmail: string) {
    const user = await this.prismaService.user.findUniqueOrThrow({
      where: { email: userEmail },
    });

    const recoveryPassword = await this.prismaService.recoveryPassword.create({
      data: { user: { connect: { id: user.id } } },
    });

    this.mailService
      .sendRecoveryPassword(user.email, recoveryPassword.uuid)
      .catch((e) => console.error(`Error to send recovery password: ${e}`));
  }

  async validateByUUID(uuid: string) {
    const recoveryPassword =
      await this.prismaService.recoveryPassword.findUniqueOrThrow({
        where: { uuid },
      });

    if (recoveryPassword.isUsed) {
      throw new BadRequestException('Recovery password is already used');
    }
  }

  async updatePassword(uuid: string, newPassword: string) {
    await this.prismaService.recoveryPassword.update({
      data: {
        isUsed: true,
        user: {
          update: { password: await UserService.encryptPassword(newPassword) },
        },
      },
      where: { uuid },
    });
  }
}
