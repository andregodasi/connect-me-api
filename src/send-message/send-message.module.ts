import { Module } from '@nestjs/common';
import { SendMessageController } from './send-message.controller';
import { SendMessageService } from './send-message.service';
import { MailModule } from 'src/mail/mail.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [MailModule, UserModule],
  controllers: [SendMessageController],
  providers: [SendMessageService],
})
export class SendMessageModule {}
