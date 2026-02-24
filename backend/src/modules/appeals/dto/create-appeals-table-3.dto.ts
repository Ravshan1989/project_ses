import { IsString, IsInt, IsOptional, IsUUID } from "class-validator";

export class CreateAppealsTable3Dto {
    @IsUUID() organization_id: string;
    @IsString() period_month: string;
    @IsString() row_key: string;

    @IsInt() @IsOptional() total_prev?: number;
    @IsInt() @IsOptional() total_curr?: number;
    @IsInt() @IsOptional() phys_prev?: number;
    @IsInt() @IsOptional() phys_curr?: number;
    @IsInt() @IsOptional() legal_prev?: number;
    @IsInt() @IsOptional() legal_curr?: number;
    @IsInt() @IsOptional() written?: number;
    @IsInt() @IsOptional() electronic?: number;
    @IsInt() @IsOptional() oral_total?: number;
    @IsInt() @IsOptional() oral_leader?: number;
    @IsInt() @IsOptional() oral_staff?: number;
    @IsInt() @IsOptional() oral_phone?: number;
    @IsInt() @IsOptional() ministry_routing?: number;
    @IsInt() @IsOptional() regional_routing?: number;
    @IsInt() @IsOptional() local_routing?: number;
    @IsInt() @IsOptional() being_considered?: number;
    @IsInt() @IsOptional() ministry_from_prev?: number;
    @IsInt() @IsOptional() ministry_from_curr?: number;
    @IsInt() @IsOptional() field_meetings_prev?: number;
    @IsInt() @IsOptional() field_meetings_curr?: number;
}
