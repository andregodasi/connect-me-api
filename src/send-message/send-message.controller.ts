import { Body, Controller, Post } from '@nestjs/common';
import { SendMessageService } from './send-message.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { MessageDTO } from './dto/message.dto';

@Controller('send-message')
export class SendMessageController {
  constructor(private readonly sendMessageService: SendMessageService) {}

  @Post()
  async sendMessage(
    @CurrentUser() currentUser: User,
    @Body() messageDto: MessageDTO,
  ) {
    const { toUserUUID, message } = messageDto;
    await this.sendMessageService.sendMessage(currentUser, toUserUUID, message);
  }
}
