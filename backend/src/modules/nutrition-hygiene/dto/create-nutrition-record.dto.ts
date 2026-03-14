import { IsString, IsEnum, IsOptional, IsUUID, IsDateString, IsNumber, IsBoolean } from "class-validator";
import { NutritionEntryType, NutritionObjectType, NutritionMeasure, LabResult } from "../entities/nutrition-action-record.entity";

export class CreateNutritionRecordDto {
    @IsUUID()
    organization_id: string;

    @IsString()
    period_month: string;

    @IsDateString()
    action_date: string;

    @IsEnum(NutritionEntryType)
    entry_type: NutritionEntryType;

    @IsEnum(NutritionObjectType)
    object_type: NutritionObjectType;

    @IsString()
    @IsOptional()
    object_name?: string;

    @IsString()
    @IsOptional()
    product_category?: string;

    @IsNumber()
    @IsOptional()
    amount?: number;

    @IsEnum(LabResult)
    @IsOptional()
    lab_result?: LabResult;

    @IsBoolean()
    @IsOptional()
    violation_found?: boolean;

    @IsEnum(NutritionMeasure)
    @IsOptional()
    measure_type?: NutritionMeasure;

    @IsNumber()
    @IsOptional()
    fine_sum?: number;

    @IsBoolean()
    @IsOptional()
    is_sent_to_court?: boolean;

    @IsBoolean()
    @IsOptional()
    is_sent_to_prosecutor?: boolean;

    @IsString()
    @IsOptional()
    notes?: string;
}
