import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { InspectionRecord } from "./entities/inspection-record.entity";
import { InspectionTable2 } from "./entities/inspection-table2.entity";
import { InspectionTable3 } from "./entities/inspection-table3.entity";
import { InspectionTable4 } from "./entities/inspection-table4.entity";
import { CreateInspectionRecordDto } from "./dto/create-inspection-record.dto";
import { UpdateInspectionRecordDto } from "./dto/update-inspection-record.dto";

@Injectable()
export class InspectionsService {
    constructor(
        @InjectRepository(InspectionRecord)
        private readonly recordRepo: Repository<InspectionRecord>,
        @InjectRepository(InspectionTable2)
        private readonly table2Repo: Repository<InspectionTable2>,
        @InjectRepository(InspectionTable3)
        private readonly table3Repo: Repository<InspectionTable3>,
        @InjectRepository(InspectionTable4)
        private readonly table4Repo: Repository<InspectionTable4>,
    ) { }

    // ===== 1-жадвал: Прокуратурага юборилган маълумотлар (CRUD) =====

    async getRecords(month: string, organizationId: string): Promise<InspectionRecord[]> {
        return this.recordRepo.find({
            where: { period_month: month, organization_id: organizationId },
            order: { sort_order: "ASC", created_at: "ASC" },
        });
    }

    async createRecord(dto: CreateInspectionRecordDto): Promise<InspectionRecord> {
        const count = await this.recordRepo.count({
            where: { period_month: dto.period_month, organization_id: dto.organization_id },
        });
        const entity = this.recordRepo.create({ ...dto, sort_order: count });
        return this.recordRepo.save(entity);
    }

    async updateRecord(id: string, dto: UpdateInspectionRecordDto): Promise<InspectionRecord> {
        const record = await this.recordRepo.findOne({ where: { id } });
        if (!record) throw new NotFoundException("Record not found");
        Object.assign(record, dto);
        return this.recordRepo.save(record);
    }

    async deleteRecord(id: string): Promise<{ success: boolean }> {
        const record = await this.recordRepo.findOne({ where: { id } });
        if (!record) throw new NotFoundException("Record not found");
        await this.recordRepo.remove(record);
        return { success: true };
    }

    // ===== 2-жадвал: Туманлар кесимида тадбиркорлик текширишлари =====

    async getTable2Data(month: string, organizationId: string): Promise<InspectionTable2[]> {
        return this.table2Repo.find({
            where: { period_month: month, organization_id: organizationId },
        });
    }

    async saveTable2Data(
        month: string,
        organizationId: string,
        rows: Partial<InspectionTable2>[],
    ): Promise<{ success: boolean }> {
        const existing = await this.table2Repo.find({
            where: { period_month: month, organization_id: organizationId },
        });
        const map = new Map(existing.map((r) => [r.row_key, r]));
        for (const rowData of rows) {
            if (map.has(rowData.row_key)) {
                Object.assign(map.get(rowData.row_key), rowData);
                await this.table2Repo.save(map.get(rowData.row_key));
            } else {
                await this.table2Repo.save(
                    this.table2Repo.create({ ...rowData, period_month: month, organization_id: organizationId })
                );
            }
        }
        return { success: true };
    }

    // ===== 3-жадвал: Хабарнома тартибидаги текширишларда қўлланилган чоралар =====

    async getTable3Data(month: string, organizationId: string): Promise<InspectionTable3[]> {
        return this.table3Repo.find({
            where: { period_month: month, organization_id: organizationId },
        });
    }

    async saveTable3Data(
        month: string,
        organizationId: string,
        rows: Partial<InspectionTable3>[],
    ): Promise<{ success: boolean }> {
        const existing = await this.table3Repo.find({
            where: { period_month: month, organization_id: organizationId },
        });
        const map = new Map(existing.map((r) => [r.row_key, r]));
        for (const rowData of rows) {
            if (map.has(rowData.row_key)) {
                Object.assign(map.get(rowData.row_key), rowData);
                await this.table3Repo.save(map.get(rowData.row_key));
            } else {
                await this.table3Repo.save(
                    this.table3Repo.create({ ...rowData, period_month: month, organization_id: organizationId })
                );
            }
        }
        return { success: true };
    }
    // ===== 4-жадвал: 24 соатлик хабарномадан СЎНГ қўлланилган чоралар =====

    async getTable4Data(month: string, organizationId: string): Promise<InspectionTable4[]> {
        return this.table4Repo.find({
            where: { period_month: month, organization_id: organizationId },
        });
    }

    async saveTable4Data(
        month: string,
        organizationId: string,
        rows: Partial<InspectionTable4>[],
    ): Promise<{ success: boolean }> {
        const existing = await this.table4Repo.find({
            where: { period_month: month, organization_id: organizationId },
        });
        const map = new Map(existing.map((r) => [r.row_key, r]));
        for (const rowData of rows) {
            if (map.has(rowData.row_key)) {
                Object.assign(map.get(rowData.row_key), rowData);
                await this.table4Repo.save(map.get(rowData.row_key));
            } else {
                await this.table4Repo.save(
                    this.table4Repo.create({ ...rowData, period_month: month, organization_id: organizationId })
                );
            }
        }
        return { success: true };
    }
}
