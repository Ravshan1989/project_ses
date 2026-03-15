import { IsString, IsOptional, IsInt } from "class-validator";

export class CreateInspectionRecordDto {
  @IsString()
  organization_id: string;

  @IsString()
  period_month: string;

  @IsString()
  object_name: string;

  @IsOptional()
  @IsString()
  transfer_date?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  measures_taken?: string;

  @IsOptional()
  @IsInt()
  sort_order?: number;
}
