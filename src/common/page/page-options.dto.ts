import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Order } from './order.enum';
import { PageOptionsBaseDto } from './page-options-base.dto';

export class PageOptionsDto extends PageOptionsBaseDto {
  constructor(page: number) {
    super(page);
  }
}
