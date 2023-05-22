import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PageOptionsBaseDto } from 'src/common/repository/dto/page-options-base.dto';

export class PageOptionEventDto extends PageOptionsBaseDto {
  @IsString()
  @IsOptional()
  q: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isFollowing: boolean;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isSubscribed: boolean;

  @IsDate()
  @IsOptional()
  dateInitial: Date;

  @IsDate()
  @IsOptional()
  dateFinal: Date;
}
