import { Degree, SocialNetworkType } from '@prisma/client';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

export class SocialNetworkDto {
  @IsEnum(SocialNetworkType)
  type: SocialNetworkType;

  @IsString()
  @IsOptional()
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
  @IsOptional()
  nickname: string;

  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  aboutMe: string;

  @IsString()
  @IsOptional()
  companyName: string;

  @IsString()
  @IsOptional()
  companyRole: string;

  @IsEnum(Degree)
  @IsOptional()
  degree: Degree;

  @IsArray()
  @IsOptional()
  socialNetworks: SocialNetworkDto[];

  @IsArray()
  @IsOptional()
  knowledge: KnowledgeDto[];
}
