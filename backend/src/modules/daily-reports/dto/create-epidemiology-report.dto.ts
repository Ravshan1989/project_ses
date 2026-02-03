import { IsNumber, IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateEpidemiologyReportDto {
    @IsString()
    reportDate: string;

    @IsUUID()
    organizationId: string;

    // Inspected
    @IsNumber() @IsOptional() inspected_total?: number;
    @IsNumber() @IsOptional() inspected_mtm?: number;
    @IsNumber() @IsOptional() inspected_school?: number;
    @IsNumber() @IsOptional() inspected_dpm?: number;
    @IsNumber() @IsOptional() inspected_other?: number;

    // Defects
    @IsNumber() @IsOptional() defects_total?: number;
    @IsNumber() @IsOptional() defects_mtm?: number;
    @IsNumber() @IsOptional() defects_school?: number;
    @IsNumber() @IsOptional() defects_dpm?: number;
    @IsNumber() @IsOptional() defects_other?: number;

    // Fines
    @IsNumber() @IsOptional() fines_total?: number;
    @IsNumber() @IsOptional() fines_mtm?: number;
    @IsNumber() @IsOptional() fines_school?: number;
    @IsNumber() @IsOptional() fines_dpm?: number;
    @IsNumber() @IsOptional() fines_other?: number;

    // Suspended
    @IsNumber() @IsOptional() suspended_total?: number;
    @IsNumber() @IsOptional() suspended_mtm?: number;
    @IsNumber() @IsOptional() suspended_school?: number;
    @IsNumber() @IsOptional() suspended_dpm?: number;
    @IsNumber() @IsOptional() suspended_other?: number;
}
