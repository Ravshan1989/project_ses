import { IsString, IsEnum, IsOptional, IsUUID, IsDateString, IsBoolean } from "class-validator";
import { ApplicantType, AppealType, AppealChannel, AppealStatus, DisciplinaryMeasure } from "../entities/appeal-record.entity";

export class CreateAppealRecordDto {
    @IsUUID()
    organization_id: string;

    @IsString()
    period_month: string; // YYYY-MM

    @IsDateString()
    registration_date: string;

    @IsString()
    applicant_name: string;

    @IsEnum(ApplicantType)
    applicant_type: ApplicantType;

    @IsEnum(AppealType)
    appeal_type: AppealType;

    @IsEnum(AppealChannel)
    channel: AppealChannel;

    @IsEnum(AppealStatus)
    @IsOptional()
    status?: AppealStatus;

    @IsEnum(DisciplinaryMeasure)
    @IsOptional()
    consequence?: DisciplinaryMeasure;

    @IsString()
    @IsOptional()
    summary?: string;

    @IsBoolean()
    @IsOptional()
    is_repeated?: boolean;

    @IsBoolean()
    @IsOptional()
    is_overdue?: boolean;

    @IsString()
    @IsOptional()
    recipient?: string;

    @IsString()
    @IsOptional()
    subject_key?: string;

    @IsDateString()
    @IsOptional()
    deadline_date?: string;

    @IsDateString()
    @IsOptional()
    closure_date?: string;

    @IsUUID()
    @IsOptional()
    responsible_user_id?: string;

    @IsBoolean()
    @IsOptional()
    is_phone?: boolean;

    @IsBoolean()
    @IsOptional()
    is_field_meeting?: boolean;
}

