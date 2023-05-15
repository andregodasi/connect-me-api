import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { GroupRepository } from './group.repository';
import { FileModule } from 'src/file/file.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [FileModule, MailModule],
  controllers: [GroupController],
  providers: [GroupService, GroupRepository],
  exports: [GroupService],
})
export class GroupModule {}
