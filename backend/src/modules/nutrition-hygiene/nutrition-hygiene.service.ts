import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NutritionHygieneTable1 } from "./entities/nutrition-hygiene-table-1.entity";
import { NutritionHygieneTable2 } from "./entities/nutrition-hygiene-table-2.entity";
import { NutritionHygieneTable3 } from "./entities/nutrition-hygiene-table-3.entity";
import { NutritionHygieneTable4 } from "./entities/nutrition-hygiene-table-4.entity";
import { NutritionHygieneTable5 } from "./entities/nutrition-hygiene-table-5.entity";
import { NutritionHygieneTable6 } from "./entities/nutrition-hygiene-table-6.entity";

import {
  NutritionActionRecord,
  NutritionObjectType,
  NutritionEntryType,
  NutritionMeasure,
  LabResult,
} from "./entities/nutrition-action-record.entity";
import { CreateNutritionRecordDto } from "./dto/create-nutrition-record.dto";

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
    @InjectRepository(NutritionActionRecord)
    private readonly recordRepo: Repository<NutritionActionRecord>,
  ) {}

  async createRecord(dto: CreateNutritionRecordDto, userId: string) {
    const record = this.recordRepo.create({
      ...dto,
      organization: { id: dto.organization_id } as any,
      createdBy: { id: userId } as any,
    });
    return await this.recordRepo.save(record);
  }

  async getRecords(organizationId: string, month: string) {
    return await this.recordRepo.find({
      where: { organization: { id: organizationId }, period_month: month },
      order: { action_date: "DESC" },
    });
  }

  async generateReportsFromRecords(organizationId: string, month: string) {
    const records = await this.recordRepo.find({
      where: { organization: { id: organizationId }, period_month: month },
    });

    // T1: Coordination & Notification
    const table1 = {
      production_notif: records.filter(
        (r) =>
          r.object_type === NutritionObjectType.PRODUCTION &&
          r.entry_type === NutritionEntryType.INSPECTION,
      ).length,
      catering_notif: records.filter(
        (r) =>
          r.object_type === NutritionObjectType.CATERING &&
          r.entry_type === NutritionEntryType.INSPECTION,
      ).length,
      trade_notif: records.filter(
        (r) =>
          r.object_type === NutritionObjectType.TRADE &&
          r.entry_type === NutritionEntryType.INSPECTION,
      ).length,
      sanitary_fine_count: records.filter(
        (r) => r.measure_type === NutritionMeasure.FINE,
      ).length,
      sanitary_fine_sum: records
        .filter((r) => r.measure_type === NutritionMeasure.FINE)
        .reduce((sum, r) => sum + Number(r.fine_sum), 0),
      suspension_count: records.filter(
        (r) => r.measure_type === NutritionMeasure.STOP_OPERATION,
      ).length,
    };

    // T2: Food Production Objects (Medical Checkups)
    const table2 = {
      prod_inspected_count: 0,
      prod_medical_required: 0,
      prod_medical_failed: 0,
      cat_inspected_count: 0,
      cat_medical_required: 0,
      cat_medical_failed: 0,
      trade_inspected_count: 0,
      trade_medical_required: 0,
      trade_medical_failed: 0,
      dismissal_proposals: records.filter(
        (r) => r.measure_type === NutritionMeasure.DISMISSAL_PROPOSAL,
      ).length,
      dismissed_employees: records.filter(
        (r) => r.measure_type === NutritionMeasure.DISMISSAL_ACTUAL,
      ).length,
      medical_checked_after_proposal: 0,
      protocols_count: records.filter(
        (r) => r.measure_type === NutritionMeasure.PROTOCOL,
      ).length,
    };

    // T3: Product Categories
    const categories = [
      "meat_products",
      "milk_products",
      "fish_products",
      "bread_products",
      "sugar_products",
      "fruit_veg",
      "fat_oil",
      "alcohol_soft",
      "baby_food",
      "canned_food",
      "salt",
      "other",
    ];
    const table3: any = {};
    categories.forEach((cat) => {
      table3[cat] = records
        .filter((r) => r.product_category === cat)
        .reduce((sum, r) => sum + Number(r.amount), 0);
    });
    table3["total_samples"] = records.filter(
      (r) => r.entry_type === NutritionEntryType.LAB_SAMPLE,
    ).length;

    // T4 & T5: Salt & Flour
    const table4 = {
      potassium_iodate_kg: records
        .filter((r) => r.object_type === NutritionObjectType.ENT_SALT)
        .reduce((sum, r) => sum + Number(r.amount), 0),
      samples_prod_total: records.filter(
        (r) => r.object_type === NutritionObjectType.ENT_SALT,
      ).length,
    };

    const table5 = {
      premix_amount_kg: records
        .filter((r) => r.object_type === NutritionObjectType.ENT_FLOUR)
        .reduce((sum, r) => sum + Number(r.amount), 0),
      samples_prod_total: records.filter(
        (r) => r.object_type === NutritionObjectType.ENT_FLOUR,
      ).length,
    };

    // T6: Markets
    const table6 = {
      inspections_total: records.filter(
        (r) => r.object_type === NutritionObjectType.MARKET,
      ).length,
      fine_individual_count: records.filter(
        (r) =>
          r.object_type === NutritionObjectType.MARKET &&
          r.measure_type === NutritionMeasure.FINE,
      ).length,
      fine_individual_sum: records
        .filter(
          (r) =>
            r.object_type === NutritionObjectType.MARKET &&
            r.measure_type === NutritionMeasure.FINE,
        )
        .reduce((sum, r) => sum + Number(r.fine_sum), 0),
    };

    return {
      table1,
      table2,
      table3,
      table4,
      table5,
      table6,
      records_count: records.length,
    };
  }

  async getTableData(tableNum: number, month: string, organizationId: string) {
    const repo = this.getRepo(tableNum);
    return await repo.find({
      where: { period_month: month, organization_id: organizationId },
    });
  }

  async saveTableData(
    tableNum: number,
    month: string,
    organizationId: string,
    rows: any[],
  ) {
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
      case 1:
        return this.table1Repo;
      case 2:
        return this.table2Repo;
      case 3:
        return this.table3Repo;
      case 4:
        return this.table4Repo;
      case 5:
        return this.table5Repo;
      case 6:
        return this.table6Repo;
      default:
        throw new Error("Invalid table number");
    }
  }

  async getMonitoringData(month: string) {
    // Here we just check if any data exists for each table/org in that month
    // For simplicity, we can just check NutritionActionRecord counts per organization
    const stats = await this.recordRepo
      .createQueryBuilder("record")
      .select("record.organization_id", "orgId")
      .addSelect("COUNT(*)", "count")
      .where("record.period_month = :month", { month })
      .groupBy("record.organization_id")
      .getRawMany();

    return stats.map((s) => ({
      orgId: s.orgId,
      hasData: parseInt(s.count) > 0,
    }));
  }
}
