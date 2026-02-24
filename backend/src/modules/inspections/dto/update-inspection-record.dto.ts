import { IsString, IsOptional, IsInt } from "class-validator";

export class UpdateInspectionRecordDto {
    @IsOptional()
    @IsString()
    object_name?: string;

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
