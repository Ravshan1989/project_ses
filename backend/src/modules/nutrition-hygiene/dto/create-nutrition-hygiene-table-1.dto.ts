import { IsString, IsNumber, IsOptional, IsUUID } from "class-validator";

export class CreateNutritionHygieneTable1Dto {
  @IsString()
  organization_id: string;

  @IsString()
  period_month: string;

  @IsString()
  row_key: string;

  @IsNumber()
  @IsOptional()
  production_notif?: number;

  @IsNumber()
  @IsOptional()
  catering_notif?: number;

  @IsNumber()
  @IsOptional()
  trade_notif?: number;

  @IsNumber()
  @IsOptional()
  order_permission?: number;

  @IsNumber()
  @IsOptional()
  total_permission?: number;

  @IsNumber()
  @IsOptional()
  sent_to_court?: number;

  @IsNumber()
  @IsOptional()
  sent_to_prosecutor?: number;

  @IsNumber()
  @IsOptional()
  court_fine_count?: number;

  @IsNumber()
  @IsOptional()
  court_fine_sum?: number;

  @IsNumber()
  @IsOptional()
  recovered_fine_count?: number;

  @IsNumber()
  @IsOptional()
  recovered_fine_sum?: number;

  @IsNumber()
  @IsOptional()
  sanitary_fine_count?: number;

  @IsNumber()
  @IsOptional()
  sanitary_fine_sum?: number;

  @IsNumber()
  @IsOptional()
  sanitary_recovered_count?: number;

  @IsNumber()
  @IsOptional()
  sanitary_recovered_sum?: number;

  @IsNumber()
  @IsOptional()
  suspension_count?: number;

  @IsNumber()
  @IsOptional()
  dismissal_proposals?: number;

  @IsNumber()
  @IsOptional()
  dismissed_employees?: number;
}
