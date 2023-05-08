import { Degree, SocialNetwork, SocialNetworkType } from '@prisma/client';
import { IsArray, IsEnum, IsString } from 'class-validator';

export class SocialNetworkDto {
  @IsEnum(SocialNetworkType)
  type: SocialNetworkType;

  @IsString()
  link: string;
}

export class KnowledgeDto {
  @IsString()
  name: string;

  @IsString()
  description: string;
}

export class UpdateUserDto {
  @IsString()
  name: string;

  @IsString()
  nickname: string;

  @IsString()
  title: string;

  @IsString()
  aboutMe: string;

  @IsString()
  companyName: string;

  @IsString()
  companyRole: string;

  @IsEnum(Degree)
  degree: Degree;

  @IsArray()
  socialNetworks: SocialNetworkDto[];

  @IsArray()
  knowledge: KnowledgeDto[];
}
