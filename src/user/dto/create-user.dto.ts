import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @Matches(/^(?=.*\d)(?=.*\W+)(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Formato inválido. Deve conter letras maiúsculas, minúsculas, números e caracteres especiais.',
  })
  password: string;

  @IsString()
  name: string;

  @IsString()
  nickname: string;
}
