import { IsString, IsEnum, IsOptional } from 'class-validator';
import { SosDiseaseType } from '../entities/sos-disease.entity';

export class CreateSosDiseaseDto {
    @IsString()
    name: string;

    @IsEnum(SosDiseaseType)
    type: SosDiseaseType;
}
