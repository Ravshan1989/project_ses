import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KgWaterReport } from './entities/water-report.entity';
import { KgOpenWaterReport } from './entities/open-water-report.entity';
import { KgWaterUsageReport } from './entities/water-usage-report.entity';

@Injectable()
export class KommunalHygieneService {
    constructor(
        @InjectRepository(KgWaterReport)
        private readonly waterRepo: Repository<KgWaterReport>,
        @InjectRepository(KgOpenWaterReport)
        private readonly openWaterRepo: Repository<KgOpenWaterReport>,
        @InjectRepository(KgWaterUsageReport)
        private readonly waterUsageRepo: Repository<KgWaterUsageReport>,
    ) { }

    async findByMonthAndOrg(month: string, organizationId?: string) {
        const m = month.length === 7 ? `${month}-01` : month;
        const qb = this.waterRepo.createQueryBuilder('r')
            .leftJoinAndSelect('r.organization', 'org')
            .where('r.reportMonth = :m', { m });

        if (organizationId) {
            qb.andWhere('org.id = :oid', { oid: organizationId });
        }

        return qb.getMany();
    }

    async upsertRow(dto: any) {
        const { organizationId, reportMonth, row_type, ...fields } = dto;
        const month = reportMonth.length === 7 ? `${reportMonth}-01` : reportMonth;

        let record = await this.waterRepo.findOne({
            where: {
                reportMonth: month,
                row_type,
                organization: { id: organizationId },
            },
        });

        if (record) {
            Object.assign(record, fields);
            return this.waterRepo.save(record);
        }

        return this.waterRepo.save(this.waterRepo.create({
            ...fields,
            reportMonth: month,
            row_type,
            organization: { id: organizationId } as any,
        }));
    }

    // ─── TABLE 2: OPEN WATER ───────────────────────────────────────────────

    async findOpenWater(month: string, organizationId?: string) {
        const m = month.length === 7 ? `${month}-01` : month;
        const qb = this.openWaterRepo.createQueryBuilder('r')
            .leftJoinAndSelect('r.organization', 'org')
            .where('r.reportMonth = :m', { m });

        if (organizationId) {
            qb.andWhere('org.id = :oid', { oid: organizationId });
        }

        return qb.getMany();
    }

    async saveOpenWaterRows(dtos: any[], month: string, organizationId: string) {
        const m = month.length === 7 ? `${month}-01` : month;

        // Simpler approach: delete existing for this month/org and insert new list
        // Or we can do a proper sync. Given it's a dynamic list, sync is better or overwrite.
        // User will send the full list of rows or it's cumulative.

        // For dynamic rows, we usually delete old ones and insert new ones or match by ID.
        // Let's do overwrite for now as it's common for these types of reports.

        await this.openWaterRepo.delete({
            reportMonth: m,
            organization: { id: organizationId }
        });

        const entities = this.openWaterRepo.create(dtos.map(dto => ({
            ...dto,
            reportMonth: m,
            organization: { id: organizationId } as any
        })));

        return this.openWaterRepo.save(entities);
    }

    // ─── TABLE 3: WATER USAGE ─────────────────────────────────────────────

    async findWaterUsage(month: string, organizationId?: string) {
        const m = month.length === 7 ? `${month}-01` : month;
        const qb = this.waterUsageRepo.createQueryBuilder('r')
            .leftJoinAndSelect('r.organization', 'org')
            .where('r.reportMonth = :m', { m });

        if (organizationId) {
            qb.andWhere('org.id = :oid', { oid: organizationId });
        }

        return qb.getMany();
    }

    async saveWaterUsageRows(dtos: any[], month: string, organizationId: string) {
        const m = month.length === 7 ? `${month}-01` : month;

        await this.waterUsageRepo.delete({
            reportMonth: m,
            organization: { id: organizationId }
        });

        const entities = this.waterUsageRepo.create(dtos.map(dto => ({
            ...dto,
            reportMonth: m,
            organization: { id: organizationId } as any
        })));

        return this.waterUsageRepo.save(entities);
    }
}
