import { Group } from '../entities/group.entity';
import {
  IsEmail,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateGroupDto extends Group {
  @IsUUID()
  uuid: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  slug: string;
}
