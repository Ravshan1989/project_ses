import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NutritionHygieneController } from "./nutrition-hygiene.controller";
import { NutritionHygieneService } from "./nutrition-hygiene.service";
import { NutritionHygieneTable1 } from "./entities/nutrition-hygiene-table-1.entity";
import { NutritionHygieneTable2 } from "./entities/nutrition-hygiene-table-2.entity";
import { NutritionHygieneTable3 } from "./entities/nutrition-hygiene-table-3.entity";
import { NutritionHygieneTable4 } from "./entities/nutrition-hygiene-table-4.entity";
import { NutritionHygieneTable5 } from "./entities/nutrition-hygiene-table-5.entity";
import { NutritionHygieneTable6 } from "./entities/nutrition-hygiene-table-6.entity";
import { NutritionActionRecord } from "./entities/nutrition-action-record.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            NutritionHygieneTable1,
            NutritionHygieneTable2,
            NutritionHygieneTable3,
            NutritionHygieneTable4,
            NutritionHygieneTable5,
            NutritionHygieneTable6,
            NutritionActionRecord,
        ]),
    ],

    controllers: [NutritionHygieneController],
    providers: [NutritionHygieneService],
    exports: [NutritionHygieneService],
})
export class NutritionHygieneModule { }
