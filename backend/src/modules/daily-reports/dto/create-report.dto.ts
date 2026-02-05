import { IsDateString, IsNumber, IsOptional, IsUUID } from "class-validator";

export class CreateHepatitisReportDto {
  @IsDateString()
  reportDate: string;

  @IsUUID()
  organizationId: string;

  @IsNumber() @IsOptional() total_cases?: number;
  @IsNumber() @IsOptional() age_under_1?: number;
  @IsNumber() @IsOptional() age_1_3?: number;
  @IsNumber() @IsOptional() age_4_6?: number;
  @IsNumber() @IsOptional() age_7_14?: number;
  @IsNumber() @IsOptional() age_15_19?: number;
  @IsNumber() @IsOptional() age_20_plus?: number;
  @IsNumber() @IsOptional() occ_unorganized?: number;
  @IsNumber() @IsOptional() occ_unorganized_1_6?: number;
  @IsNumber() @IsOptional() occ_organized_1_6?: number;
  @IsNumber() @IsOptional() occ_unorganized_school_age?: number;
  @IsNumber() @IsOptional() occ_students?: number;
  @IsNumber() @IsOptional() occ_college_students?: number;
  @IsNumber() @IsOptional() occ_workers?: number;
  @IsNumber() @IsOptional() factor_water?: number;
  @IsNumber() @IsOptional() factor_food?: number;
  @IsNumber() @IsOptional() factor_contact?: number;
  @IsNumber() @IsOptional() lab_samples?: number;
  @IsNumber() @IsOptional() lab_positive?: number;
  @IsNumber() @IsOptional() disinfection_done?: number;

  @IsOptional()
  isTest?: boolean;
}
