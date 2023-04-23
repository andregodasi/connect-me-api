import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { PageOptionsBaseDto } from 'src/common/repository/dto/page-options-base.dto';

export class PageOptionEventDto extends PageOptionsBaseDto {
  constructor(
    page: number,
    take: number,
    q: string,
    isFollowing: boolean,
    isSubscribed: boolean,
  ) {
    super(page, take);
    this.q = q;
    this.isFollowing = isFollowing;
    this.isSubscribed = isSubscribed;
  }

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
}
