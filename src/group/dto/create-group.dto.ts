import { Group } from '../entities/group.entity';
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateGroupDto extends Group {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  slug: string;
}
