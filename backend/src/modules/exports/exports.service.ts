import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { HepatitisDailyReport } from '../daily-reports/entities/hepatitis-daily-report.entity';
import { FluDailyReport } from '../daily-reports/entities/flu-daily-report.entity';
import { Submission } from '../submissions/entities/submission.entity';

@Injectable()
export class ExportsService {
    constructor(
        @InjectRepository(HepatitisDailyReport)
        private readonly hepatitisRepo: Repository<HepatitisDailyReport>,

        @InjectRepository(FluDailyReport)
        private readonly fluRepo: Repository<FluDailyReport>,

        @InjectRepository(Submission)
        private readonly submissionRepo: Repository<Submission>,
    ) { }

    async getFluReports(startDate: string, endDate: string) {
        return this.fluRepo.find({
            where: {
                reportDate: Between(startDate, endDate),
            },
            relations: ['organization'],
            order: { reportDate: 'ASC' },
        });
    }

    async getHepatitisReports(startDate: string, endDate: string) {
        return this.hepatitisRepo.find({
            where: {
                reportDate: Between(startDate, endDate),
            },
            relations: ['organization'],
            order: { reportDate: 'ASC' },
        });
    }

    async getForm1Reports(startDate: string, endDate: string) {
        // Form 1 is monthly, stored in 'submissions' with reportingPeriod (YYYY-MM-DD)
        // We filter by reportingPeriod
        return this.submissionRepo.find({
            where: {
                reportingPeriod: Between(startDate, endDate),
                // Add check for template if needed, assuming Form 1 uses a specific template or we just export valid submissions
                // querying all submissions for now as requested "istalgan hisobotni...". 
                // Better to include template relation to filter/display name
            },
            relations: ['organization', 'template'],
            order: { reportingPeriod: 'ASC' },
        });
    }
}
