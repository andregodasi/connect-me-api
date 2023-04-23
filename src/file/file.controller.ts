import {
  Controller,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileDTO } from './file.dto';
import { FileService } from './file.service';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  /* @Post()
  async create(@Req() request, @Res() response) {
    console.log(request);
    try {
      return this.fileService.fileupload(request, response);
    } catch (error) {
      return response
        .status(500)
        .json(`Failed to upload image file: ${error.message}`);
    }
  } */

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ): Promise<any> {
    console.log('file', file);
    console.log('req', req.Body);
    /* const result = await this.fileService.uploadPublicFile(
      file.buffer,
      file.originalname,
    );

    return new FileDTO(result); */
  }
}
