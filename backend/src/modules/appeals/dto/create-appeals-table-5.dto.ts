import { IsString, IsInt, IsOptional, IsUUID } from "class-validator";

export class CreateAppealsTable5Dto {
  @IsUUID() organization_id: string;
  @IsString() period_month: string;
  @IsString() row_key: string;

  @IsInt() @IsOptional() total_prev?: number;
  @IsInt() @IsOptional() total_curr?: number;
  @IsInt() @IsOptional() phys_total_prev?: number;
  @IsInt() @IsOptional() phys_total_curr?: number;
  @IsInt() @IsOptional() phys_ariza_prev?: number;
  @IsInt() @IsOptional() phys_ariza_curr?: number;
  @IsInt() @IsOptional() phys_shikoyat_prev?: number;
  @IsInt() @IsOptional() phys_shikoyat_curr?: number;
  @IsInt() @IsOptional() phys_taklif_prev?: number;
  @IsInt() @IsOptional() phys_taklif_curr?: number;
  @IsInt() @IsOptional() legal_total_prev?: number;
  @IsInt() @IsOptional() legal_total_curr?: number;
  @IsInt() @IsOptional() legal_ariza_prev?: number;
  @IsInt() @IsOptional() legal_ariza_curr?: number;
  @IsInt() @IsOptional() legal_shikoyat_prev?: number;
  @IsInt() @IsOptional() legal_shikoyat_curr?: number;
  @IsInt() @IsOptional() legal_taklif_prev?: number;
  @IsInt() @IsOptional() legal_taklif_curr?: number;
}
