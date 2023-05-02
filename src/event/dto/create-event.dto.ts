import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Event } from '../entities/event.entity';

export class CreateEventDto extends Event {
  @IsUUID()
  uuidGroup: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  description: string;

  @IsDateString()
  initialDate: Date;

  @IsDateString()
  finishDate: Date;

  @IsString()
  address: string;

  @IsInt()
  limitParticipants: number;

  @IsOptional()
  @IsString()
  coverUrl: string;
}
