import { IsUUID } from 'class-validator';
import { PageOptionsBaseDto } from 'src/common/repository/dto/page-options-base.dto';

export class PageOptionUserEventDto extends PageOptionsBaseDto {
  constructor(page: number, take: number, eventUUID: string) {
    super(page, take);
    this.eventUUID = eventUUID;
  }

  @IsUUID()
  eventUUID: string;
}
