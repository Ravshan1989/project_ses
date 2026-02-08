import { IsString, IsEnum, IsOptional } from "class-validator";
import { SosStatus } from "../entities/sos-alert.entity";

export class CreateSosAlertDto {
  @IsString()
  diseaseName: string;

  @IsEnum(SosStatus)
  status: SosStatus;

  @IsOptional()
  @IsString()
  comment?: string;
}
