import {
  IsString,
  IsNotEmpty,
  IsObject,
  IsDateString,
  IsUUID,
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
}
