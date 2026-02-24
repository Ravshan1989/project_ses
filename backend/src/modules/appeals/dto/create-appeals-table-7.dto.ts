import { IsString, IsInt, IsOptional, IsUUID } from "class-validator";

export class CreateAppealsTable7Dto {
    @IsUUID() organization_id: string;
    @IsString() period_month: string;
    @IsString() row_key: string;

    @IsInt() @IsOptional() fine_prev?: number;
    @IsInt() @IsOptional() fine_curr?: number;
    @IsInt() @IsOptional() reprimand_prev?: number;
    @IsInt() @IsOptional() reprimand_curr?: number;
    @IsInt() @IsOptional() dismissal_prev?: number;
    @IsInt() @IsOptional() dismissal_curr?: number;
    @IsInt() @IsOptional() disciplinary_total_prev?: number;
    @IsInt() @IsOptional() disciplinary_total_curr?: number;
    @IsInt() @IsOptional() administrative_prev?: number;
    @IsInt() @IsOptional() administrative_curr?: number;
    @IsInt() @IsOptional() criminal_prev?: number;
    @IsInt() @IsOptional() criminal_curr?: number;
    @IsInt() @IsOptional() grand_total_prev?: number;
    @IsInt() @IsOptional() grand_total_curr?: number;
}
