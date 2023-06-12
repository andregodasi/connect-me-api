import { IsString, IsUUID } from 'class-validator';

export class MessageDTO {
  @IsUUID()
  toUserUUID: string;

  @IsString()
  message: string;
}
