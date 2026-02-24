import { IsString, IsInt, IsOptional, IsUUID } from "class-validator";

export class CreateAppealsTable1Dto {
    @IsUUID()
    organization_id: string;

    @IsString()
    period_month: string;

    @IsString()
    row_key: string;

    @IsInt()
    @IsOptional()
    oral_prev?: number;

    @IsInt()
    @IsOptional()
    oral_curr?: number;

    @IsInt()
    @IsOptional()
    written_prev?: number;

    @IsInt()
    @IsOptional()
    written_curr?: number;

    @IsInt()
    @IsOptional()
    electronic_prev?: number;

    @IsInt()
    @IsOptional()
    electronic_curr?: number;

    @IsInt()
    @IsOptional()
    total_prev?: number;

    @IsInt()
    @IsOptional()
    total_curr?: number;
}
