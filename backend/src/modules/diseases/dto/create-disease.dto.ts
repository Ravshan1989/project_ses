import { IsString, IsNotEmpty, IsArray, IsOptional, IsBoolean } from 'class-validator';

export class CreateDiseaseDto {
    @IsString()
    @IsNotEmpty()
    code: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsArray()
    @IsOptional()
    reportFrequency?: string[];

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
