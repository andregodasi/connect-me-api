import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Order } from './order.enum';

const defaultTake = 10;

export abstract class PageOptionsBaseDto {
  @IsEnum(Order)
  @IsOptional()
  readonly order?: Order = Order.ASC;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  readonly take?: number = defaultTake;

  constructor(page: number, take: number = defaultTake) {
    this.page = page;
    this.take = take;
  }

  get skip(): number {
    const skip = (this.page - 1) * this.take;
    if (skip == null || isNaN(skip)) {
      return 0;
    }
    return skip;
  }
}
