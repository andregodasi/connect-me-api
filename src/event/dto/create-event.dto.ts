import { Event, EventType } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';

export class CreateEventDto {
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

  @ValidateIf((e: Event) => e.type === EventType.IN_PERSON)
  @IsString()
  address: string;

  @IsInt()
  limitParticipants: number;

  @IsOptional()
  @IsString()
  coverUrl: string;

  @ValidateIf((e: Event) => e.type === EventType.REMOTE)
  @IsString()
  link: string;

  @IsEnum(EventType)
  @IsNotEmpty()
  type: EventType;
}
