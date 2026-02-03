import { IsNumber, IsString, IsUUID, IsOptional } from "class-validator";

export class CreateFluReportDto {
  @IsString()
  reportDate: string;

  @IsUUID()
  organizationId: string;

  @IsNumber() @IsOptional() institution_count?: number;

  // O'tkir respirator infeksiyalar (O'RI / ARI)
  @IsNumber() @IsOptional() ari_total?: number;
  @IsNumber() @IsOptional() ari_0_1?: number;
  @IsNumber() @IsOptional() ari_1_2?: number;
  @IsNumber() @IsOptional() ari_3_6?: number;
  @IsNumber() @IsOptional() ari_7_14?: number;
  @IsNumber() @IsOptional() ari_adult?: number;
  @IsNumber() @IsOptional() ari_students?: number;
  @IsNumber() @IsOptional() ari_nursery?: number;

  // O'tkir zotiljam (O'P / Pneumonia)
  @IsNumber() @IsOptional() pneu_total?: number;
  @IsNumber() @IsOptional() pneu_0_2?: number;
  @IsNumber() @IsOptional() pneu_3_6?: number;
  @IsNumber() @IsOptional() pneu_7_14?: number;
  @IsNumber() @IsOptional() pneu_adult?: number;
  @IsNumber() @IsOptional() pneu_students?: number;
  @IsNumber() @IsOptional() pneu_nursery?: number;

  // Grippga o'xshash kasalliklar (GK / Flu)
  @IsNumber() @IsOptional() flu_total?: number;
  @IsNumber() @IsOptional() flu_0_1?: number;
  @IsNumber() @IsOptional() flu_1_2?: number;
  @IsNumber() @IsOptional() flu_3_6?: number;
  @IsNumber() @IsOptional() flu_7_14?: number;
  @IsNumber() @IsOptional() flu_adult?: number;
  @IsNumber() @IsOptional() flu_students?: number;
  @IsNumber() @IsOptional() flu_nursery?: number;

  // Og'ir o'tkir respirator infeksiyalar (SARI)
  @IsNumber() @IsOptional() sari_total?: number;
  @IsNumber() @IsOptional() sari_0_2?: number;
  @IsNumber() @IsOptional() sari_3_6?: number;
  @IsNumber() @IsOptional() sari_7_14?: number;
  @IsNumber() @IsOptional() sari_adult?: number;

  // Vafot etganlar (Deaths)
  @IsNumber() @IsOptional() death_total?: number;
  @IsNumber() @IsOptional() death_pregnant?: number;
}
