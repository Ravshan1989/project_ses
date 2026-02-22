import {
  IsString,
  IsArray,
  ValidateNested,
  IsOptional,
  IsNumber,
} from "class-validator";
import { Type } from "class-transformer";

export class ChLabTestsRowDto {
  @IsString()
  row_key: string;

  // Air
  @IsOptional() @IsNumber() airInspectedCount?: number;
  @IsOptional() @IsNumber() airSamplesTotal?: number;
  @IsOptional() @IsNumber() airSamples12k?: number;
  @IsOptional() @IsNumber() airRemExceededTotal?: number;
  @IsOptional() @IsNumber() airRemExceeded12k?: number;

  // Microclimate
  @IsOptional() @IsNumber() microInspectedCount?: number;
  @IsOptional() @IsNumber() microSamplesTotal?: number;
  @IsOptional() @IsNumber() microSamplesNonCompliant?: number;

  // Vibration
  @IsOptional() @IsNumber() vibInspectedCount?: number;
  @IsOptional() @IsNumber() vibSamplesTotal?: number;
  @IsOptional() @IsNumber() vibSamplesNonCompliant?: number;

  // EMF
  @IsOptional() @IsNumber() emfInspectedCount?: number;
  @IsOptional() @IsNumber() emfSamplesTotal?: number;
  @IsOptional() @IsNumber() emfSamplesNonCompliant?: number;

  // Illumination
  @IsOptional() @IsNumber() lightInspectedCount?: number;
  @IsOptional() @IsNumber() lightSamplesTotal?: number;
  @IsOptional() @IsNumber() lightSamplesNonCompliant?: number;

  // Noise
  @IsOptional() @IsNumber() noiseInspectedCount?: number;
  @IsOptional() @IsNumber() noiseSamplesTotal?: number;
  @IsOptional() @IsNumber() noiseSamplesNonCompliant?: number;
}

export class SaveChLabTestsReportDto {
  @IsString()
  month: string;

  @IsString()
  organizationId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChLabTestsRowDto)
  rows: ChLabTestsRowDto[];
}
