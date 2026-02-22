import {
  IsString,
  IsArray,
  ValidateNested,
  IsOptional,
  IsNumber,
} from "class-validator";
import { Type } from "class-transformer";

export class ChParasitoMicroRowDto {
  @IsString()
  row_key: string;

  // Parasitological
  @IsOptional() @IsNumber() paraVegTotal?: number;
  @IsOptional() @IsNumber() paraVegNonCompliant?: number;

  @IsOptional() @IsNumber() paraWaterTotal?: number;
  @IsOptional() @IsNumber() paraWaterNonCompliant?: number;

  @IsOptional() @IsNumber() paraSoilTotal?: number;
  @IsOptional() @IsNumber() paraSoilNonCompliant?: number;

  // Microbiological
  @IsOptional() @IsNumber() microSmearTotal?: number;
  @IsOptional() @IsNumber() microSmearNonCompliant?: number;

  @IsOptional() @IsNumber() microFoodTotal?: number;
  @IsOptional() @IsNumber() microFoodNonCompliant?: number;

  @IsOptional() @IsNumber() microWaterTotal?: number;
  @IsOptional() @IsNumber() microWaterNonCompliant?: number;

  @IsOptional() @IsNumber() microSoilTotal?: number;
  @IsOptional() @IsNumber() microSoilNonCompliant?: number;
}

export class SaveChParasitoMicroReportDto {
  @IsString()
  month: string;

  @IsString()
  organizationId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChParasitoMicroRowDto)
  rows: ChParasitoMicroRowDto[];
}
