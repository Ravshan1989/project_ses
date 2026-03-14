import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AppealsTable1 } from "./entities/appeals-table-1.entity";
import { AppealsTable2 } from "./entities/appeals-table-2.entity";
import { AppealsTable3 } from "./entities/appeals-table-3.entity";
import { AppealsTable4 } from "./entities/appeals-table-4.entity";
import { AppealsTable5 } from "./entities/appeals-table-5.entity";
import { AppealsTable6 } from "./entities/appeals-table-6.entity";
import { AppealsTable7 } from "./entities/appeals-table-7.entity";
import { Organization } from "../organizations/entities/organization.entity";
import { CreateAppealsTable1Dto } from "./dto/create-appeals-table-1.dto";
import { CreateAppealsTable2Dto } from "./dto/create-appeals-table-2.dto";
import { CreateAppealsTable3Dto } from "./dto/create-appeals-table-3.dto";
import { CreateAppealsTable4Dto } from "./dto/create-appeals-table-4.dto";
import { CreateAppealsTable5Dto } from "./dto/create-appeals-table-5.dto";
import { CreateAppealsTable6Dto } from "./dto/create-appeals-table-6.dto";
import { CreateAppealsTable7Dto } from "./dto/create-appeals-table-7.dto";
import { AppealRecord, AppealChannel, ApplicantType, AppealType, AppealStatus, DisciplinaryMeasure } from "./entities/appeal-record.entity";
import { CreateAppealRecordDto } from "./dto/create-appeal-record.dto";

@Injectable()
export class AppealsService {
    constructor(
        @InjectRepository(AppealsTable1)
        private readonly table1Repo: Repository<AppealsTable1>,
        @InjectRepository(AppealsTable2)
        private readonly table2Repo: Repository<AppealsTable2>,
        @InjectRepository(AppealsTable3)
        private readonly table3Repo: Repository<AppealsTable3>,
        @InjectRepository(AppealsTable4)
        private readonly table4Repo: Repository<AppealsTable4>,
        @InjectRepository(AppealsTable5)
        private readonly table5Repo: Repository<AppealsTable5>,
        @InjectRepository(AppealsTable6)
        private readonly table6Repo: Repository<AppealsTable6>,
        @InjectRepository(AppealsTable7)
        private readonly table7Repo: Repository<AppealsTable7>,
        @InjectRepository(AppealRecord)
        private readonly recordRepo: Repository<AppealRecord>,
        @InjectRepository(Organization)
        private readonly orgRepo: Repository<Organization>,
    ) { }

    async createRecord(dto: CreateAppealRecordDto, userId: string) {
        const record = this.recordRepo.create({
            ...dto,
            organization: { id: dto.organization_id } as any,
            createdBy: { id: userId } as any,
        });
        return await this.recordRepo.save(record);
    }

    async getRecords(organizationId: string, month: string) {
        const org = await this.orgRepo.findOne({ where: { id: organizationId }, relations: ['children'] });
        if (!org) return [];

        const orgIds = [organizationId];
        if (org.children && org.children.length > 0) {
            orgIds.push(...org.children.map(c => c.id));
        }

        return await this.recordRepo.createQueryBuilder('record')
            .leftJoinAndSelect('record.organization', 'organization')
            .where('record.organization_id IN (:...orgIds)', { orgIds })
            .andWhere('record.period_month = :month', { month })
            .orderBy('record.registration_date', 'DESC')
            .getMany();
    }

    /**
     * UZ: Bitta jurnaldan 7 xil hisobotni avtomatik generatsiya qilish
     */
    async generateReportsFromRecords(organizationId: string, month: string) {
        const records = await this.getRecords(organizationId, month);

        // 1. Table 1 Aggregation (Group by Recipient)
        const getTable1Row = (rec: string) => ({
            oral_curr: records.filter(r => r.recipient === rec && r.channel === AppealChannel.ORAL).length,
            written_curr: records.filter(r => r.recipient === rec && r.channel === AppealChannel.WRITTEN).length,
            electronic_curr: records.filter(r => r.recipient === rec && r.channel === AppealChannel.ELECTRONIC).length,
            total_curr: records.filter(r => r.recipient === rec).length,
        });

        const table1 = {
            head: getTable1Row("head"),
            deputy_epid: getTable1Row("deputy_epid"),
            deputy_san: getTable1Row("deputy_san"),
        };

        // 2. Table 2 Aggregation (Status & Control)
        const table2 = {
            total_curr: records.length,
            written_curr: records.filter(r => r.channel === AppealChannel.WRITTEN).length,
            electronic_curr: records.filter(r => r.channel === AppealChannel.ELECTRONIC).length,
            oral_curr: records.filter(r => r.channel === AppealChannel.ORAL).length,
            measures_taken: records.filter(r => r.status === AppealStatus.SATISFIED).length,
            explained: records.filter(r => r.status === AppealStatus.EXPLAINED).length,
            rejected: records.filter(r => r.status === AppealStatus.REJECTED).length,
            being_considered: records.filter(r => r.status === AppealStatus.BEING_CONSIDERED).length,
            repeated: records.filter(r => r.is_repeated).length,
            overdue: records.filter(r => r.is_overdue).length,
        };

        // 3. Table 3 Aggregation (Phys/Legal & Channels)
        const table3 = {
            total_curr: records.length,
            phys_curr: records.filter(r => r.applicant_type === ApplicantType.PHYSICAL).length,
            legal_curr: records.filter(r => r.applicant_type === ApplicantType.LEGAL).length,
            written: records.filter(r => r.channel === AppealChannel.WRITTEN).length,
            electronic: records.filter(r => r.channel === AppealChannel.ELECTRONIC).length,
            oral_total: records.filter(r => r.channel === AppealChannel.ORAL).length,
        };

        // 4. Table 4 Aggregation (Subjects)
        const table4: any = {};
        const subjects = ["san_epid", "coronavirus", "labor", "medical", "complaint_leader", "staff_behavior", "disinfection", "fines", "other"];
        subjects.forEach(s => {
            table4[s] = {
                count_curr: records.filter(r => r.subject_key === s).length
            };
        });

        // 5. Table 5 Aggregation (Ariza, Shikoyat, Taklif)
        const table5 = {
            total_curr: records.length,
            phys_total_curr: records.filter(r => r.applicant_type === ApplicantType.PHYSICAL).length,
            phys_ariza_curr: records.filter(r => r.applicant_type === ApplicantType.PHYSICAL && r.appeal_type === AppealType.ARIZA).length,
            phys_shikoyat_curr: records.filter(r => r.applicant_type === ApplicantType.PHYSICAL && r.appeal_type === AppealType.SHIKOYAT).length,
            phys_taklif_curr: records.filter(r => r.applicant_type === ApplicantType.PHYSICAL && r.appeal_type === AppealType.TAKLIF).length,
            legal_total_curr: records.filter(r => r.applicant_type === ApplicantType.LEGAL).length,
            legal_ariza_curr: records.filter(r => r.applicant_type === ApplicantType.LEGAL && r.appeal_type === AppealType.ARIZA).length,
            legal_shikoyat_curr: records.filter(r => r.applicant_type === ApplicantType.LEGAL && r.appeal_type === AppealType.SHIKOYAT).length,
            legal_taklif_curr: records.filter(r => r.applicant_type === ApplicantType.LEGAL && r.appeal_type === AppealType.TAKLIF).length,
        };

        // 6. Table 6 Aggregation (Receptions)
        const table6 = {
            people_total: records.filter(r => r.channel === AppealChannel.PEOPLES_RECEPTION).length,
            people_satisfied: records.filter(r => r.channel === AppealChannel.PEOPLES_RECEPTION && r.status === AppealStatus.SATISFIED).length,
            people_explained: records.filter(r => r.channel === AppealChannel.PEOPLES_RECEPTION && r.status === AppealStatus.EXPLAINED).length,
            people_rejected: records.filter(r => r.channel === AppealChannel.PEOPLES_RECEPTION && r.status === AppealStatus.REJECTED).length,
            virtual_total: records.filter(r => r.channel === AppealChannel.VIRTUAL_RECEPTION).length,
            virtual_satisfied: records.filter(r => r.channel === AppealChannel.VIRTUAL_RECEPTION && r.status === AppealStatus.SATISFIED).length,
            virtual_explained: records.filter(r => r.channel === AppealChannel.VIRTUAL_RECEPTION && r.status === AppealStatus.EXPLAINED).length,
            virtual_rejected: records.filter(r => r.channel === AppealChannel.VIRTUAL_RECEPTION && r.status === AppealStatus.REJECTED).length,
        };

        // 7. Table 7 Aggregation (Consequences)
        const table7: any = {
            fine_curr: records.filter(r => r.consequence === DisciplinaryMeasure.FINE).length,
            reprimand_curr: records.filter(r => r.consequence === DisciplinaryMeasure.REPRIMAND).length,
            dismissal_curr: records.filter(r => r.consequence === DisciplinaryMeasure.DISMISSAL).length,
            administrative_curr: records.filter(r => r.consequence === DisciplinaryMeasure.ADMINISTRATIVE).length,
            criminal_curr: records.filter(r => r.consequence === DisciplinaryMeasure.CRIMINAL).length,
        };
        table7["disciplinary_total_curr"] = table7.fine_curr + table7.reprimand_curr + table7.dismissal_curr;
        table7["grand_total_curr"] = table7.disciplinary_total_curr + table7.administrative_curr + table7.criminal_curr;

        return {
            table1,
            table2,
            table3,
            table4,
            table5,
            table6,
            table7,
            records_count: records.length,
        };
    }

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

    async getMonitoringData(organizationId: string, month: string) {
        const org = await this.orgRepo.findOne({ where: { id: organizationId }, relations: ['children'] });
        if (!org || !org.children || org.children.length === 0) return [];

        const monitoringResults = [];
        for (const child of org.children) {
            const count = await this.recordRepo.count({
                where: { organization: { id: child.id }, period_month: month }
            });
            monitoringResults.push({
                organizationId: child.id,
                organizationName: child.name,
                count,
                status: count > 0 ? 'SUBMITTED' : 'PENDING'
            });
        }
        return monitoringResults;
    }

    private getRepo(tableNum: number): Repository<any> {
        switch (tableNum) {
            case 1: return this.table1Repo;
            case 2: return this.table2Repo;
            case 3: return this.table3Repo;
            case 4: return this.table4Repo;
            case 5: return this.table5Repo;
            case 6: return this.table6Repo;
            case 7: return this.table7Repo;
            default: throw new Error("Invalid table number");
        }
    }
}

