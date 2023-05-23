import { Module } from '@nestjs/common';
import { GroupModule } from 'src/group/group.module';
import { EventModule } from 'src/event/event.module';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MailModule } from 'src/mail/mail.module';
import { FileModule } from 'src/file/file.module';
import { UserRepository } from './user.repository';

@Module({
  imports: [EventModule, GroupModule, MailModule, FileModule],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
