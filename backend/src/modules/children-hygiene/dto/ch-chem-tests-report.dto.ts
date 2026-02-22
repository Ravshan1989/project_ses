import {
  IsString,
  IsArray,
  ValidateNested,
  IsOptional,
  IsNumber,
} from "class-validator";
import { Type } from "class-transformer";

export class ChChemTestsRowDto {
  @IsString()
  row_key: string;

  // Daily ration
  @IsOptional() @IsNumber() rationTotal?: number;
  @IsOptional() @IsNumber() rationNonCompliant?: number;

  // Salt
  @IsOptional() @IsNumber() saltTotal?: number;
  @IsOptional() @IsNumber() saltNonCompliant?: number;

  // Nitrates
  @IsOptional() @IsNumber() nitrateTotal?: number;
  @IsOptional() @IsNumber() nitrateNonCompliant?: number;

  // Toxic
  @IsOptional() @IsNumber() toxicTotal?: number;
  @IsOptional() @IsNumber() toxicNonCompliant?: number;

  // Thermal
  @IsOptional() @IsNumber() thermalTotal?: number;
  @IsOptional() @IsNumber() thermalNonCompliant?: number;

  // Minerals
  @IsOptional() @IsNumber() mineralTotal?: number;
  @IsOptional() @IsNumber() mineralNonCompliant?: number;

  // Soil
  @IsOptional() @IsNumber() soilTotal?: number;
  @IsOptional() @IsNumber() soilNonCompliant?: number;

  // Water
  @IsOptional() @IsNumber() waterTotal?: number;
  @IsOptional() @IsNumber() waterNonCompliant?: number;

  // Pesticides
  @IsOptional() @IsNumber() pesticideTotal?: number;
  @IsOptional() @IsNumber() pesticideNonCompliant?: number;

  // Nutrition
  @IsOptional() @IsNumber() nutritionTotal?: number;
  @IsOptional() @IsNumber() nutritionNonCompliant?: number;
}

export class SaveChChemTestsReportDto {
  @IsString()
  month: string;

  @IsString()
  organizationId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChChemTestsRowDto)
  rows: ChChemTestsRowDto[];
}
