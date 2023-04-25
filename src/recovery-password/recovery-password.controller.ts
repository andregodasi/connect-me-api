import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
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
  async insert(@Query('user_email') userEmail: string) {
    await this.recoveryPasswordService.insert(userEmail);
  }

  @IsPublic()
  @Get('/validate/:uuid')
  async validateByUUID(@Param('uuid') uuid) {
    await this.recoveryPasswordService.validateByUUID(uuid);
  }

  @IsPublic()
  @Put(':uuid')
  async updatePassword(
    @Param('uuid') uuid: string,
    @Body() body: UpdatePasswordDto,
  ) {
    await this.recoveryPasswordService.updatePassword(uuid, body.newPassword);
  }
}
