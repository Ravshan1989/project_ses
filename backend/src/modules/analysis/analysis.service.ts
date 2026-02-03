import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not, IsNull } from 'typeorm';
import { HepatitisDailyReport } from '../daily-reports/entities/hepatitis-daily-report.entity';
import { FluDailyReport } from '../daily-reports/entities/flu-daily-report.entity';
import { AriDailyReport } from '../daily-reports/entities/ari-daily-report.entity';
import { CovidDailyReport } from '../daily-reports/entities/covid-daily-report.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { Submission } from '../submissions/entities/submission.entity';
import { Disease } from '../diseases/entities/disease.entity';
import { AnalysisQueryDto } from './dto/analysis-query.dto';

@Injectable()
export class AnalysisService {
    constructor(
        @InjectRepository(Organization)
        private orgRepo: Repository<Organization>,
        @InjectRepository(HepatitisDailyReport)
        private hepatitisRepo: Repository<HepatitisDailyReport>,
        @InjectRepository(FluDailyReport)
        private fluRepo: Repository<FluDailyReport>,
        @InjectRepository(AriDailyReport)
        private ariRepo: Repository<AriDailyReport>,
        @InjectRepository(CovidDailyReport)
        private covidRepo: Repository<CovidDailyReport>,
        @InjectRepository(Submission)
        private submissionRepo: Repository<Submission>,
        @InjectRepository(Disease)
        private diseaseRepo: Repository<Disease>,
    ) { }

    async getGlobalSummary(startDate: string, endDate: string) {
        const organizations = await this.orgRepo.find({
            where: { parent: Not(IsNull()) }, // Districts only
            relations: ['parent']
        });

        const diseases = await this.diseaseRepo.find({ where: { isActive: true } });

        // Fetch specialized data for the period
        const whereClause = { reportDate: Between(startDate, endDate) };
        const hepatitisData = await this.hepatitisRepo.find({ where: whereClause, relations: ['organization'] });
        const fluData = await this.fluRepo.find({ where: whereClause, relations: ['organization'] });
        const ariData = await this.ariRepo.find({ where: whereClause, relations: ['organization'] });
        const covidData = await this.covidRepo.find({ where: whereClause, relations: ['organization'] });

        // Fetch Generic Form 1 Submissions
        const form1Submissions = await this.submissionRepo.find({
            where: {
                template: { code: 'form_1' },
                reportingPeriod: Between(startDate, endDate)
            },
            relations: ['organization']
        });

        const globalMatrix: any[] = [];

        for (const org of organizations) {
            const orgDiseases = [];

            // 1. Specialized Diseases
            const hepCases = hepatitisData.filter(r => r.organization.id === org.id).reduce((sum, r) => sum + r.total_cases, 0);
            const fluCases = fluData.filter(r => r.organization.id === org.id).reduce((sum, r) => sum + r.flu_total, 0);
            const ariCases = ariData.filter(r => r.organization.id === org.id).reduce((sum, r) => sum + r.ari, 0);
            const covidCases = covidData.filter(r => r.organization.id === org.id).reduce((sum, r) => sum + r.total_cases, 0);

            if (hepCases > 0) orgDiseases.push({ disease: 'Gepatit', cases: hepCases });
            if (fluCases > 0) orgDiseases.push({ disease: 'Gripp', cases: fluCases });
            if (ariCases > 0) orgDiseases.push({ disease: 'O\'RVI', cases: ariCases });
            if (covidCases > 0) orgDiseases.push({ disease: 'Koronavirus (COVID-19)', cases: covidCases });

            // 2. Generic Form 1 Diseases
            const orgSubmissions = form1Submissions.filter(s => s.organization.id === org.id);
            for (const sub of orgSubmissions) {
                // sub.data is a JSON object with keys like "Dizenteriya", "Qizamiq", etc.
                for (const [key, value] of Object.entries(sub.data)) {
                    if (typeof value === 'number' && value > 0) {
                        // Check if this key corresponds to a disease
                        const diseaseMatch = diseases.find(d =>
                            d.name.toLowerCase().includes(key.toLowerCase()) ||
                            key.toLowerCase().includes(d.name.toLowerCase())
                        );

                        if (diseaseMatch) {
                            const existing = orgDiseases.find(od => od.disease === diseaseMatch.name);
                            if (existing) {
                                existing.cases += value;
                            } else {
                                orgDiseases.push({ disease: diseaseMatch.name, cases: value });
                            }
                        }
                    }
                }
            }

            // Calculate rates
            const analyzedDiseases = orgDiseases.map(od => ({
                ...od,
                rate: org.population > 0 ? parseFloat(((od.cases / org.population) * 100000).toFixed(2)) : 0
            }));

            globalMatrix.push({
                organizationId: org.id,
                organizationName: org.name,
                population: org.population,
                diseases: analyzedDiseases.sort((a, b) => b.rate - a.rate)
            });
        }

        return globalMatrix;
    }

    async getIncidenceRates(query: AnalysisQueryDto) {
        const { diseaseType, startDate, endDate, organizationId } = query;

        // Fetch all organizations (districts) to get their population
        const organizations = await this.orgRepo.find({
            where: organizationId ? { id: organizationId } : {},
            relations: ['parent']
        });

        const results = [];

        for (const org of organizations) {
            // Hududni o'zini (Region) tahlildan chiqarib tashlaymiz, faqat tumanlarni olamiz
            // Parent'i borlar bu tumanlar. Agar parent'i yo'q bo'lsa bu viloyat (skip)
            if (!org.parent && !organizationId) continue;

            let totalCases = 0;
            const whereClause = {
                organization: { id: org.id },
                reportDate: Between(startDate, endDate)
            };

            switch (diseaseType) {
                case 'hepatitis':
                    const hepReports = await this.hepatitisRepo.find({ where: whereClause });
                    totalCases = hepReports.reduce((sum, r) => sum + r.total_cases, 0);
                    break;
                case 'flu':
                    const fluReports = await this.fluRepo.find({ where: whereClause });
                    totalCases = fluReports.reduce((sum, r) => sum + r.flu_total, 0);
                    break;
                case 'ari':
                    const ariReports = await this.ariRepo.find({ where: whereClause });
                    totalCases = ariReports.reduce((sum, r) => sum + r.ari, 0);
                    break;
                case 'covid':
                    const covidReports = await this.covidRepo.find({ where: whereClause });
                    totalCases = covidReports.reduce((sum, r) => sum + r.total_cases, 0);
                    break;
            }

            // Incidence rate per 100,000 population
            const incidenceRate = org.population > 0
                ? (totalCases / org.population) * 100000
                : 0;

            results.push({
                organizationId: org.id,
                organizationName: org.name,
                population: org.population,
                totalCases,
                incidenceRate: parseFloat(incidenceRate.toFixed(2))
            });
        }

        return results.sort((a, b) => b.incidenceRate - a.incidenceRate);
    }

    async seedPopulation() {
        // 1. Ensure Region exists as Parent
        let region = await this.orgRepo.findOne({ where: { name: 'Toshkent viloyati' } });
        if (!region) {
            region = this.orgRepo.create({ name: 'Toshkent viloyati', population: 3000000 });
            await this.orgRepo.save(region);
        }

        const REGION_DATA = [
            { name: 'Nurafshon sh', population: 54100 },
            { name: 'Angren sh', population: 191300 },
            { name: 'Bekobod sh', population: 102000 },
            { name: 'Chirchiq sh', population: 168000 },
            { name: 'Olmaliq sh', population: 138500 },
            { name: 'Ohangaron sh', population: 42000 },
            { name: 'Yangiyo\'l sh', population: 63000 },
            { name: 'Oqqo\'rg\'on t', population: 112400 },
            { name: 'Ohangaron t', population: 108300 },
            { name: 'Bekobod t', population: 163400 },
            { name: 'Bo\'stonliq t', population: 175600 },
            { name: 'Bo\'ka t', population: 132400 },
            { name: 'Quyi chirchiq t', population: 115800 },
            { name: 'Zangiota t', population: 204300 },
            { name: 'Yuqori Chirchiq t', population: 142100 },
            { name: 'Qibray t', population: 206800 },
            { name: 'Parkent t', population: 153000 },
            { name: 'Piskent t', population: 102400 },
            { name: 'O\'rta Chirchiq t', population: 153500 },
            { name: 'Chinoz t', population: 147800 },
            { name: 'Yangiyo\'l t', population: 278300 },
            { name: 'Toshkent t', population: 194500 },
        ];

        for (const data of REGION_DATA) {
            // Update population and Link to parent region
            const org = await this.orgRepo.findOne({ where: { name: data.name } });
            if (org) {
                org.population = data.population;
                org.parent = region;
                await this.orgRepo.save(org);
            }
        }
        return { success: true, count: REGION_DATA.length };
    }
}
