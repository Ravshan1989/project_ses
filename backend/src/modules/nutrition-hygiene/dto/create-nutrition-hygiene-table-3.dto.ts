import { IsString, IsNumber, IsOptional } from "class-validator";

export class CreateNutritionHygieneTable3Dto {
  @IsString()
  organization_id: string;

  @IsString()
  period_month: string;

  @IsString()
  row_key: string;

  @IsNumber()
  @IsOptional()
  meat_products?: number;

  @IsNumber()
  @IsOptional()
  milk_products?: number;

  @IsNumber()
  @IsOptional()
  fish_products?: number;

  @IsNumber()
  @IsOptional()
  bread_products?: number;

  @IsNumber()
  @IsOptional()
  sugar_products?: number;

  @IsNumber()
  @IsOptional()
  fruit_veg?: number;

  @IsNumber()
  @IsOptional()
  fat_oil?: number;

  @IsNumber()
  @IsOptional()
  alcohol_soft?: number;

  @IsNumber()
  @IsOptional()
  baby_food?: number;

  @IsNumber()
  @IsOptional()
  canned_food?: number;

  @IsNumber()
  @IsOptional()
  salt?: number;

  @IsNumber()
  @IsOptional()
  other?: number;

  @IsNumber()
  @IsOptional()
  total_amount?: number;

  @IsNumber()
  @IsOptional()
  total_samples?: number;

  @IsNumber()
  @IsOptional()
  trade_lab_samples?: number;

  @IsNumber()
  @IsOptional()
  trade_lab_amount?: number;

  @IsNumber()
  @IsOptional()
  trade_expired_amount?: number;

  @IsNumber()
  @IsOptional()
  trade_foreign_lab_samples?: number;

  @IsNumber()
  @IsOptional()
  trade_foreign_lab_amount?: number;

  @IsNumber()
  @IsOptional()
  trade_foreign_expired_amount?: number;
}
