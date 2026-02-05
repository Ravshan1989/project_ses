import {
  IsString,
  IsNotEmpty,
  IsObject,
  IsDateString,
  IsUUID,
  IsBoolean,
  IsOptional,
} from "class-validator";

export class CreateSubmissionDto {
  @IsUUID()
  @IsNotEmpty()
  templateId: string;

  @IsDateString()
  @IsNotEmpty()
  reportingPeriod: string; // YYYY-MM-DD

  @IsObject()
  @IsNotEmpty()
  data: any;

  @IsBoolean()
  @IsOptional()
  isTest?: boolean;
}
