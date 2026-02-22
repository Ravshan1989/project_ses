import {
  IsString,
  IsArray,
  ValidateNested,
  IsOptional,
  IsNumber,
} from "class-validator";
import { Type } from "class-transformer";

export class ChSchoolSanitaryRowDto {
  @IsString()
  row_key: string;

  @IsOptional()
  @IsNumber()
  institutionsCount?: number;

  @IsOptional()
  @IsNumber()
  supervisionPlan?: number;

  @IsOptional()
  @IsNumber()
  totalSupervisionsConducted?: number;

  @IsOptional()
  @IsNumber()
  plannedSupervisionsConducted?: number;

  @IsOptional()
  @IsNumber()
  unplannedSupervisionsConducted?: number;

  @IsOptional()
  @IsNumber()
  labSupervisionsCount?: number;
}

export class SaveChSchoolSanitaryReportDto {
  @IsString()
  month: string;

  @IsString()
  organizationId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChSchoolSanitaryRowDto)
  rows: ChSchoolSanitaryRowDto[];
}
