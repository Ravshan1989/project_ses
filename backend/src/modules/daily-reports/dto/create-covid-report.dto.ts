import { IsNumber, IsString, IsUUID, IsOptional } from "class-validator";

export class CreateCovidReportDto {
  @IsString()
  reportDate: string;

  @IsUUID()
  organizationId: string;

  @IsNumber() @IsOptional() total_cases?: number;
  @IsNumber() @IsOptional() reinfected?: number;
  @IsNumber() @IsOptional() vaccinated_infected?: number;

  // Age groups
  @IsNumber() @IsOptional() age_0_1?: number;
  @IsNumber() @IsOptional() age_1_3?: number;
  @IsNumber() @IsOptional() age_4_6?: number;
  @IsNumber() @IsOptional() age_7_14?: number;
  @IsNumber() @IsOptional() age_15_19?: number;
  @IsNumber() @IsOptional() age_20_29?: number;
  @IsNumber() @IsOptional() age_30_39?: number;
  @IsNumber() @IsOptional() age_40_49?: number;
  @IsNumber() @IsOptional() age_50_59?: number;
  @IsNumber() @IsOptional() age_60_plus?: number;

  // Pre-school
  @IsNumber() @IsOptional() pre_school_organized?: number;
  @IsNumber() @IsOptional() pre_school_unorganized?: number;

  // Categories
  @IsNumber() @IsOptional() students?: number;
  @IsNumber() @IsOptional() medical_workers?: number;
  @IsNumber() @IsOptional() teachers?: number;
  @IsNumber() @IsOptional() others?: number;

  @IsNumber() @IsOptional() hospitalized_count?: number;

  @IsOptional()
  isTest?: boolean;
}
