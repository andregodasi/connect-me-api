import { Controller, Get, Res } from '@nestjs/common';
import { CurrentUser } from './auth/decorators/current-user.decorator';
import { IsPublic } from './auth/decorators/is-public.decorator';
import { User } from '@prisma/client';
import { Response } from 'express';

@Controller()
export class AppController {
  @IsPublic()
  @Get()
  get(@Res() response: Response) {
    response.status(200).send();
  }

  @Get('/me')
  getMe(@CurrentUser() currentUser: User) {
    return currentUser;
  }
}
