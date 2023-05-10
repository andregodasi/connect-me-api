import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class InsertGroupCommentDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsInt()
  @Min(1)
  @Max(5)
  starts: number;
}
