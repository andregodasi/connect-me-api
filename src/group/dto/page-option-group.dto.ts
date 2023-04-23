import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { PageOptionsBaseDto } from 'src/common/repository/dto/page-options-base.dto';

export class PageOptionGroupDto extends PageOptionsBaseDto {
  constructor(page: number, take: number, q: string, isFollowing: boolean) {
    super(page, take);
    this.q = q;
    this.isFollowing = isFollowing;
  }

  @IsString()
  @IsOptional()
  q: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isFollowing: boolean;
}
