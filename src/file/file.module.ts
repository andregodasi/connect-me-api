import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [FileService],
  exports: [FileService],
})
export class FileModule {}
