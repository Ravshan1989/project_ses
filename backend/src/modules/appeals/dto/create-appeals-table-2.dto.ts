import { IsString, IsInt, IsOptional, IsUUID } from "class-validator";

export class CreateAppealsTable2Dto {
  @IsUUID()
  organization_id: string;

  @IsString()
  period_month: string;

  @IsString()
  row_key: string;

  @IsInt() @IsOptional() total_prev?: number;
  @IsInt() @IsOptional() total_curr?: number;
  @IsInt() @IsOptional() written_prev?: number;
  @IsInt() @IsOptional() written_curr?: number;
  @IsInt() @IsOptional() electronic_prev?: number;
  @IsInt() @IsOptional() electronic_curr?: number;
  @IsInt() @IsOptional() oral_prev?: number;
  @IsInt() @IsOptional() oral_curr?: number;
  @IsInt() @IsOptional() under_control?: number;
  @IsInt() @IsOptional() measures_taken?: number;
  @IsInt() @IsOptional() explained?: number;
  @IsInt() @IsOptional() rejected?: number;
  @IsInt() @IsOptional() being_considered?: number;
  @IsInt() @IsOptional() repeated?: number;
  @IsInt() @IsOptional() overdue?: number;
}
