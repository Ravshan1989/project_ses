import { IsString, IsInt, IsOptional, IsUUID } from "class-validator";

export class CreateAppealsTable6Dto {
    @IsUUID() organization_id: string;
    @IsString() period_month: string;
    @IsString() row_key: string;

    @IsInt() @IsOptional() people_total?: number;
    @IsInt() @IsOptional() people_satisfied?: number;
    @IsInt() @IsOptional() people_explained?: number;
    @IsInt() @IsOptional() people_routed?: number;
    @IsInt() @IsOptional() people_rejected?: number;
    @IsInt() @IsOptional() people_not_considered?: number;
    @IsInt() @IsOptional() people_being_considered?: number;
    @IsInt() @IsOptional() people_overdue?: number;

    @IsInt() @IsOptional() virtual_total?: number;
    @IsInt() @IsOptional() virtual_satisfied?: number;
    @IsInt() @IsOptional() virtual_explained?: number;
    @IsInt() @IsOptional() virtual_routed?: number;
    @IsInt() @IsOptional() virtual_rejected?: number;
    @IsInt() @IsOptional() virtual_not_considered?: number;
    @IsInt() @IsOptional() virtual_being_considered?: number;
    @IsInt() @IsOptional() virtual_overdue?: number;
}
