import { Group } from '../entities/group.entity';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
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

  @IsOptional()
  @IsString()
  coverUrl: string;

  @IsOptional()
  @IsString()
  newCoverUrl: string;

  @IsOptional()
  @IsString()
  newCoverName: string;
}
