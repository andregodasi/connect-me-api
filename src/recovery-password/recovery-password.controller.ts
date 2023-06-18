import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { IsPublic } from 'src/auth/decorators/is-public.decorator';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { RecoveryPasswordService } from './recovery-password.service';

@Controller('recovery-password')
export class RecoveryPasswordController {
  constructor(
    private readonly recoveryPasswordService: RecoveryPasswordService,
  ) {}

  @IsPublic()
  @Post()
  async insert(
    @Query('user_email') userEmail: string,
    @Res() response: Response,
  ) {
    await this.recoveryPasswordService.insert(userEmail);
    return response.status(204).send();
  }

  @IsPublic()
  @Get('/validate/:uuid')
  async validateByUUID(@Param('uuid') uuid, @Res() response: Response) {
    await this.recoveryPasswordService.validateByUUID(uuid);
    return response.status(204).send();
  }

  @IsPublic()
  @Put(':uuid')
  async updatePassword(
    @Param('uuid') uuid: string,
    @Body() body: UpdatePasswordDto,
    @Res() response: Response,
  ) {
    await this.recoveryPasswordService.updatePassword(uuid, body.newPassword);
    return response.status(204).send();
  }
}
