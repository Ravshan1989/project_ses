import {
  IsString,
  IsArray,
  ValidateNested,
  IsOptional,
  IsNumber,
} from "class-validator";
import { Type } from "class-transformer";

export class ChFinesRowDto {
  @IsString()
  row_key: string;

  @IsOptional() @IsNumber() fineCountImposed?: number;
  @IsOptional() @IsNumber() fineCountCollected?: number;
  @IsOptional() @IsNumber() fineAmountImposed?: number;
  @IsOptional() @IsNumber() fineAmountCollected?: number;
  @IsOptional() @IsNumber() activitySuspended?: number;
  @IsOptional() @IsNumber() employeesSuspended?: number;
  @IsOptional() @IsNumber() referredToInvestigation?: number;
  @IsOptional() @IsNumber() brakera?: number;
}

export class SaveChFinesReportDto {
  @IsString()
  month: string;

  @IsString()
  organizationId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChFinesRowDto)
  rows: ChFinesRowDto[];
}
