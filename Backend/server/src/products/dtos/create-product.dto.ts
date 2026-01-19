import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsOptional()
  @IsString()
  mobileBrand?: string;

  @IsOptional()
  @IsString()
  ptaStatus?: string;

  @IsOptional()
  @IsString()
  condition: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  // price will usually come in as a string from FormData — transform to number
  @Type(() => Number)
  @IsInt()
  price: string | number;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsNotEmpty()
  contactName: string;

  @IsString()
  @IsNotEmpty()
  contactPhone: string;

  @IsOptional()
  @IsString()
  status: string;

  @IsOptional()
  acceptTerms?: string | boolean; // may come as 'true'/'false'

  // images will be created from uploaded files in controller
}
