import { IsString, IsNumber, IsOptional } from "class-validator";

export class CreateNutritionHygieneTable2Dto {
  @IsString()
  organization_id: string;

  @IsString()
  period_month: string;

  @IsString()
  row_key: string;

  @IsNumber()
  @IsOptional()
  production_total?: number;

  @IsNumber()
  @IsOptional()
  production_required?: number;

  @IsNumber()
  @IsOptional()
  production_passed?: number;

  @IsNumber()
  @IsOptional()
  catering_total?: number;

  @IsNumber()
  @IsOptional()
  catering_required?: number;

  @IsNumber()
  @IsOptional()
  catering_passed?: number;

  @IsNumber()
  @IsOptional()
  trade_total?: number;

  @IsNumber()
  @IsOptional()
  trade_required?: number;

  @IsNumber()
  @IsOptional()
  trade_passed?: number;

  @IsNumber()
  @IsOptional()
  dismissal_proposals?: number;

  @IsNumber()
  @IsOptional()
  dismissed_employees?: number;

  @IsNumber()
  @IsOptional()
  health_protocols?: number;
}
