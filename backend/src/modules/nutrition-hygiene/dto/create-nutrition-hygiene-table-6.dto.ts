import { IsString, IsNumber, IsOptional } from "class-validator";

export class CreateNutritionHygieneTable6Dto {
    @IsString()
    organization_id: string;

    @IsString()
    period_month: string;

    @IsString()
    row_key: string;

    @IsNumber()
    @IsOptional()
    operating_markets?: number;

    @IsNumber()
    @IsOptional()
    no_water?: number;

    @IsNumber()
    @IsOptional()
    no_sewage?: number;

    @IsNumber()
    @IsOptional()
    no_meat_pavilion?: number;

    @IsNumber()
    @IsOptional()
    no_milk_pavilion?: number;

    @IsNumber()
    @IsOptional()
    no_vse_lab?: number;

    @IsNumber()
    @IsOptional()
    no_toilet?: number;

    @IsNumber()
    @IsOptional()
    no_waste_area?: number;

    @IsNumber()
    @IsOptional()
    no_disinfection_contract?: number;

    @IsNumber()
    @IsOptional()
    inspections_total?: number;

    @IsNumber()
    @IsOptional()
    violations_found?: number;

    @IsNumber()
    @IsOptional()
    court_cases?: number;

    @IsNumber()
    @IsOptional()
    fine_individual_count?: number;

    @IsNumber()
    @IsOptional()
    fine_individual_sum?: number;

    @IsNumber()
    @IsOptional()
    suspension_count?: number;

    @IsNumber()
    @IsOptional()
    dismissal_proposals?: number;

    @IsNumber()
    @IsOptional()
    dismissed_employees?: number;

    @IsNumber()
    @IsOptional()
    brake_food_kg?: number;
}
