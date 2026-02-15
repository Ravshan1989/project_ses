import { IsString, IsEnum, IsOptional, IsNumber } from "class-validator";
import { SosStatus } from "../entities/sos-alert.entity";

export class CreateSosAlertDto {
  @IsString()
  diseaseName: string;

  @IsEnum(SosStatus)
  status: SosStatus;

  @IsOptional()
  @IsString()
  comment?: string;

  // UZ: GPS koordinatalari
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}
