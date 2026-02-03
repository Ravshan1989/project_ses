import { IsNumber, IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateAriReportDto {
    @IsString()
    reportDate: string;

    @IsUUID()
    organizationId: string;

    @IsNumber()
    @IsOptional()
    gk?: number;

    @IsNumber()
    @IsOptional()
    ari?: number;

    @IsNumber()
    @IsOptional()
    pneumonia?: number;
}
