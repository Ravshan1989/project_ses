import { IsDateString, IsNumber, IsOptional, IsUUID } from "class-validator";

export class CreateDiarrheaReportDto {
    @IsDateString()
    reportDate: string;

    @IsUUID()
    organizationId: string;

    @IsNumber() @IsOptional() total_2025?: number;
    @IsNumber() @IsOptional() total_2026?: number;
    @IsNumber() @IsOptional() actively_found?: number;
    @IsNumber() @IsOptional() hospitalized?: number;
    @IsNumber() @IsOptional() illness_days_1_2?: number;

    @IsNumber() @IsOptional() age_under_1?: number;
    @IsNumber() @IsOptional() age_1_3?: number;
    @IsNumber() @IsOptional() age_4_6?: number;
    @IsNumber() @IsOptional() age_7_14?: number;
    @IsNumber() @IsOptional() age_15_19?: number;
    @IsNumber() @IsOptional() age_20_plus?: number;

    @IsNumber() @IsOptional() nursery_org?: number;
    @IsNumber() @IsOptional() nursery_unorg?: number;
    @IsNumber() @IsOptional() kindergarten_org?: number;
    @IsNumber() @IsOptional() kindergarten_unorg?: number;
    @IsNumber() @IsOptional() students?: number;
    @IsNumber() @IsOptional() higher_students?: number;
    @IsNumber() @IsOptional() adults?: number;

    @IsNumber() @IsOptional() open_water_samples?: number;
    @IsNumber() @IsOptional() open_water_isolated?: number;
    @IsNumber() @IsOptional() tap_water_samples?: number;
    @IsNumber() @IsOptional() tap_water_isolated?: number;

    @IsOptional()
    isTest?: boolean;
}
