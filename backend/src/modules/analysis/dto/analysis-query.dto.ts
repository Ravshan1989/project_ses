import { IsString, IsOptional, IsDateString } from "class-validator";

export class AnalysisQueryDto {
  @IsString()
  diseaseType: "hepatitis" | "flu" | "ari" | "covid";

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  organizationId?: string;
}
