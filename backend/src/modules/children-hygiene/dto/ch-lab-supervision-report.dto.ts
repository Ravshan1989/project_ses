import {
  IsString,
  IsArray,
  ValidateNested,
  IsOptional,
  IsNumber,
} from "class-validator";
import { Type } from "class-transformer";

export class ChLabSupervisionRowDto {
  @IsString()
  row_key: string;

  @IsOptional()
  @IsNumber()
  chemTotal?: number;

  @IsOptional()
  @IsNumber()
  chemNonCompliant?: number;

  @IsOptional()
  @IsNumber()
  bactTotal?: number;

  @IsOptional()
  @IsNumber()
  bactNonCompliant?: number;

  @IsOptional()
  @IsNumber()
  paraTotal?: number;

  @IsOptional()
  @IsNumber()
  paraNonCompliant?: number;
}

export class SaveChLabSupervisionReportDto {
  @IsString()
  month: string;

  @IsString()
  organizationId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChLabSupervisionRowDto)
  rows: ChLabSupervisionRowDto[];
}
