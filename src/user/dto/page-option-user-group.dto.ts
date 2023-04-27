import { IsUUID } from 'class-validator';
import { PageOptionsBaseDto } from 'src/common/repository/dto/page-options-base.dto';

export class PageOptionUserGroupDto extends PageOptionsBaseDto {
  constructor(page: number, take: number, groupUUID: string) {
    super(page, take);
    this.groupUUID = groupUUID;
  }

  @IsUUID()
  groupUUID: string;
}
