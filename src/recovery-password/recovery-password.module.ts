import { Module } from '@nestjs/common';
import { MailModule } from 'src/mail/mail.module';
import { RecoveryPasswordService } from './recovery-password.service';
import { RecoveryPasswordController } from './recovery-password.controller';

@Module({
  imports: [MailModule],
  providers: [RecoveryPasswordService],
  controllers: [RecoveryPasswordController],
})
export class RecoveryPasswordModule {}
