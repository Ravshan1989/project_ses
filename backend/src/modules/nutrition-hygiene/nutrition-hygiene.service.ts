import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NutritionHygieneTable1 } from "./entities/nutrition-hygiene-table-1.entity";
import { NutritionHygieneTable2 } from "./entities/nutrition-hygiene-table-2.entity";
import { NutritionHygieneTable3 } from "./entities/nutrition-hygiene-table-3.entity";
import { NutritionHygieneTable4 } from "./entities/nutrition-hygiene-table-4.entity";
import { NutritionHygieneTable5 } from "./entities/nutrition-hygiene-table-5.entity";
import { NutritionHygieneTable6 } from "./entities/nutrition-hygiene-table-6.entity";

@Injectable()
export class NutritionHygieneService {
    constructor(
        @InjectRepository(NutritionHygieneTable1)
        private readonly table1Repo: Repository<NutritionHygieneTable1>,
        @InjectRepository(NutritionHygieneTable2)
        private readonly table2Repo: Repository<NutritionHygieneTable2>,
        @InjectRepository(NutritionHygieneTable3)
        private readonly table3Repo: Repository<NutritionHygieneTable3>,
        @InjectRepository(NutritionHygieneTable4)
        private readonly table4Repo: Repository<NutritionHygieneTable4>,
        @InjectRepository(NutritionHygieneTable5)
        private readonly table5Repo: Repository<NutritionHygieneTable5>,
        @InjectRepository(NutritionHygieneTable6)
        private readonly table6Repo: Repository<NutritionHygieneTable6>,
    ) { }

    async getTableData(tableNum: number, month: string, organizationId: string) {
        const repo = this.getRepo(tableNum);
        return await repo.find({
            where: { period_month: month, organization_id: organizationId },
        });
    }

    async saveTableData(tableNum: number, month: string, organizationId: string, rows: any[]) {
        const repo = this.getRepo(tableNum);
        const existing = await repo.find({
            where: { period_month: month, organization_id: organizationId },
        });
        const map = new Map(existing.map((r) => [r.row_key, r]));

        for (const rowData of rows) {
            if (map.has(rowData.row_key)) {
                const entity = map.get(rowData.row_key);
                Object.assign(entity, rowData);
                await repo.save(entity);
            } else {
                const entity = repo.create({
                    ...rowData,
                    period_month: month,
                    organization_id: organizationId,
                });
                await repo.save(entity);
            }
        }
        return { success: true };
    }

    private getRepo(tableNum: number): Repository<any> {
        switch (tableNum) {
            case 1: return this.table1Repo;
            case 2: return this.table2Repo;
            case 3: return this.table3Repo;
            case 4: return this.table4Repo;
            case 5: return this.table5Repo;
            case 6: return this.table6Repo;
            default: throw new Error("Invalid table number");
        }
    }
}
