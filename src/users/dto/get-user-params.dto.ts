import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class GetUserParamsDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  firstname?: string;

  @IsOptional()
  @IsString()
  lastname?: string;

  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;
}
