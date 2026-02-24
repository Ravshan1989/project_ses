import { IsString, IsInt, IsOptional, IsUUID } from "class-validator";

export class CreateAppealsTable4Dto {
    @IsUUID() organization_id: string;
    @IsString() period_month: string;
    @IsString() row_key: string;

    @IsInt() @IsOptional() count_prev?: number;
    @IsInt() @IsOptional() count_curr?: number;
}
