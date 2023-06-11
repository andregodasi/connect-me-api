import { PageOptionsBaseDto } from 'src/common/page/page-options-base.dto';

export class PageOptionEventCommentDto extends PageOptionsBaseDto {
  constructor(page: number, take: number) {
    super(page, take);
  }
}
