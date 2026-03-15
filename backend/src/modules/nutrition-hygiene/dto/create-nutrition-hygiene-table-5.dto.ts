import { IsString, IsNumber, IsOptional } from "class-validator";

export class CreateNutritionHygieneTable5Dto {
  @IsString()
  organization_id: string;

  @IsString()
  period_month: string;

  @IsString()
  row_key: string;

  @IsNumber()
  @IsOptional()
  ent_total?: number;

  @IsNumber()
  @IsOptional()
  ent_period?: number;

  @IsNumber()
  @IsOptional()
  ent_covered_lab?: number;

  @IsNumber()
  @IsOptional()
  dispensers_total?: number;

  @IsNumber()
  @IsOptional()
  dispensers_period?: number;

  @IsNumber()
  @IsOptional()
  premix_amount_kg?: number;

  @IsNumber()
  @IsOptional()
  samples_prod_total?: number;

  @IsNumber()
  @IsOptional()
  samples_prod_not_meet?: number;

  @IsNumber()
  @IsOptional()
  samples_trade_total?: number;

  @IsNumber()
  @IsOptional()
  samples_trade_not_meet?: number;

  @IsNumber()
  @IsOptional()
  samples_others_total?: number;

  @IsNumber()
  @IsOptional()
  samples_others_not_meet?: number;

  @IsNumber()
  @IsOptional()
  sales_suspended_amount_tn?: number;

  @IsNumber()
  @IsOptional()
  operation_stopped?: number;

  @IsNumber()
  @IsOptional()
  protocols_count?: number;

  @IsNumber()
  @IsOptional()
  sent_to_prosecutor?: number;
}
