import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';
import { Event } from '../entities/event.entity';

export class CreateEventDto extends Event {
  @IsUUID()
  idGroup: string;

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
}
