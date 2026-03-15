import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as ExcelJS from "exceljs";
import { Response } from "express";
import * as PDFDocument from "pdfkit";
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

const subjects = [
    { key: 'san_epid', labelKey: 'appeals.subjects.san_epid' },
    { key: 'coronavirus', labelKey: 'appeals.subjects.coronavirus' },
    { key: 'nutrition', labelKey: 'appeals.subjects.nutrition' },
    { key: 'child_hygiene', labelKey: 'appeals.subjects.child_hygiene' },
    { key: 'labor_hygiene', labelKey: 'appeals.subjects.labor_hygiene' },
    { key: 'communal_hygiene', labelKey: 'appeals.subjects.communal_hygiene' },
    { key: 'radiation_hygiene', labelKey: 'appeals.subjects.radiation_hygiene' },
    { key: 'parasitology', labelKey: 'appeals.subjects.parasitology' },
    { key: 'epidemiology', labelKey: 'appeals.subjects.epidemiology' },
    { key: 'bacteriology', labelKey: 'appeals.subjects.bacteriology' },
    { key: 'virology', labelKey: 'appeals.subjects.virology' },
    { key: 'disinfection', labelKey: 'appeals.subjects.disinfection' },
    { key: 'laborant', labelKey: 'appeals.subjects.laborant' },
    { key: 'vacancies', labelKey: 'appeals.subjects.vacancies' },
    { key: 'ethics', labelKey: 'appeals.subjects.ethics' },
    { key: 'corruption', labelKey: 'appeals.subjects.corruption' },
    { key: 'other', labelKey: 'appeals.subjects.other' },
];

const APPEALS_T7_ROWS = [
    { key: 'fine', labelKey: 'appeals.table7.rows.fine' },
    { key: 'reprimand', labelKey: 'appeals.table7.rows.reprimand' },
    { key: 'dismissal', labelKey: 'appeals.table7.rows.dismissal' },
    { key: 'administrative', labelKey: 'appeals.table7.rows.administrative' },
    { key: 'criminal', labelKey: 'appeals.table7.rows.criminal' },
];

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
        const [yearStr, mStr] = month.split('-');
        const currentYear = parseInt(yearStr);
        const prevYear = currentYear - 1;
        const prevMonth = `${prevYear}-${mStr}`;

        const org = await this.orgRepo.findOne({ where: { id: organizationId }, relations: ['children'] });
        if (!org) throw new Error("Organization not found");

        const regionalOrgs = [org, ...(org.children || [])];

        const records = await this.getRecords(organizationId, month);
        const prevRecords = await this.getRecords(organizationId, prevMonth);

        // 1. Table 1 Aggregation (Group by Recipient)
        const getTable1Row = (rec: string) => ({
            oral_curr: records.filter(r => r.recipient === rec && r.channel === AppealChannel.ORAL).length,
            oral_prev: prevRecords.filter(r => r.recipient === rec && r.channel === AppealChannel.ORAL).length,
            written_curr: records.filter(r => r.recipient === rec && r.channel === AppealChannel.WRITTEN).length,
            written_prev: prevRecords.filter(r => r.recipient === rec && r.channel === AppealChannel.WRITTEN).length,
            electronic_curr: records.filter(r => r.recipient === rec && r.channel === AppealChannel.ELECTRONIC).length,
            electronic_prev: prevRecords.filter(r => r.recipient === rec && r.channel === AppealChannel.ELECTRONIC).length,
            total_curr: records.filter(r => r.recipient === rec).length,
            total_prev: prevRecords.filter(r => r.recipient === rec).length,
        });

        const table1 = {
            head: getTable1Row("head"),
            deputy_epid: getTable1Row("deputy_epid"),
            deputy_san: getTable1Row("deputy_san"),
        };

        // 2. Table 2 Aggregation (Detailed Subject Matrix YoY)
        const table2: any = { subjects: {} };
        
        subjects.forEach(s => {
            const sRecs = records.filter(r => r.subject_key === s.key);
            const sPrevRecs = prevRecords.filter(r => r.subject_key === s.key);
            
            table2.subjects[s.key] = {
                name: s.labelKey, // We use the labelKey for translation
                count_prev: sPrevRecs.length,
                count_curr: sRecs.length,
                phys_prev: sPrevRecs.filter(r => r.applicant_type === ApplicantType.PHYSICAL).length,
                phys_curr: sRecs.filter(r => r.applicant_type === ApplicantType.PHYSICAL).length,
                legal_prev: sPrevRecs.filter(r => r.applicant_type === ApplicantType.LEGAL).length,
                legal_curr: sRecs.filter(r => r.applicant_type === ApplicantType.LEGAL).length,
                written: sRecs.filter(r => r.channel === AppealChannel.WRITTEN).length,
                electronic: sRecs.filter(r => r.channel === AppealChannel.ELECTRONIC).length,
                oral_total: sRecs.filter(r => r.channel === AppealChannel.ORAL).length,
                oral_personal: sRecs.filter(r => r.channel === AppealChannel.ORAL && r.recipient?.includes('head') && !r.is_field_meeting).length,
                oral_field: sRecs.filter(r => r.channel === AppealChannel.ORAL && r.recipient?.includes('head') && r.is_field_meeting).length,
                oral_staff: sRecs.filter(r => r.channel === AppealChannel.ORAL && !r.recipient?.includes('head')).length,
                oral_phone: sRecs.filter(r => r.is_phone).length,
                apparat_seen: 0, 
                referral_regional: 0,
                referral_related: 0,
                being_considered: sRecs.filter(r => r.status === AppealStatus.BEING_CONSIDERED).length,
                vm_prev: 0,
                vm_curr: 0,
                field_meetings_prev: sPrevRecs.filter(r => r.is_field_meeting).length,
                field_meetings_curr: sRecs.filter(r => r.is_field_meeting).length,
            };
        });

        // 3. Table 3 Aggregation (Official 23-Column Regional Matrix)
        const table3: any = { regional: {} };
        regionalOrgs.forEach(ro => {
            const roRecs = records.filter(r => r.organization?.id === ro.id || ro.children?.some(c => c.id === r.organization?.id));
            const roPrevRecs = prevRecords.filter(r => r.organization?.id === ro.id || ro.children?.some(c => c.id === r.organization?.id));

            table3.regional[ro.id] = {
                name: ro.name,
                count_prev: roPrevRecs.length,
                count_curr: roRecs.length,
                phys_prev: roPrevRecs.filter(r => r.applicant_type === ApplicantType.PHYSICAL).length,
                phys_curr: roRecs.filter(r => r.applicant_type === ApplicantType.PHYSICAL).length,
                legal_prev: roPrevRecs.filter(r => r.applicant_type === ApplicantType.LEGAL).length,
                legal_curr: roRecs.filter(r => r.applicant_type === ApplicantType.LEGAL).length,
                written: roRecs.filter(r => r.channel === AppealChannel.WRITTEN).length,
                electronic: roRecs.filter(r => r.channel === AppealChannel.ELECTRONIC).length,
                oral_total: roRecs.filter(r => r.channel === AppealChannel.ORAL).length,
                oral_personal: roRecs.filter(r => r.channel === AppealChannel.ORAL && r.recipient?.includes('head') && !r.is_field_meeting).length,
                oral_field: roRecs.filter(r => r.channel === AppealChannel.ORAL && r.recipient?.includes('head') && r.is_field_meeting).length,
                oral_staff: roRecs.filter(r => r.channel === AppealChannel.ORAL && !r.recipient?.includes('head')).length,
                oral_phone: roRecs.filter(r => r.is_phone).length,
                apparat_seen: 0, // Placeholder
                referral_regional: 0, // Placeholder
                referral_related: 0, // Placeholder
                being_considered: roRecs.filter(r => r.status === AppealStatus.BEING_CONSIDERED).length,
                vm_prev: 0, // Placeholder
                vm_curr: 0, // Placeholder
                field_meetings_prev: roPrevRecs.filter(r => r.is_field_meeting).length,
                field_meetings_curr: roRecs.filter(r => r.is_field_meeting).length,
            };
        });

        // 4. Table 4 Aggregation (Regional Subject Matrix YoY)
        const table4: any = { subjects: {}, regional: {} };
        
        subjects.forEach(s => {
            table4.subjects[s.key] = {
                count_curr: records.filter(r => r.subject_key === s.key).length,
                count_prev: prevRecords.filter(r => r.subject_key === s.key).length,
            };
        });

        regionalOrgs.forEach(ro => {
            table4.regional[ro.id] = { name: ro.name, data: {} };
            subjects.forEach(s => {
                // For the main organization, include all children. For children (districts), only include themselves.
                const isMain = ro.id === organizationId;
                const sRecs = records.filter(r => r.subject_key === s.key && (r.organization?.id === ro.id || (isMain && ro.children?.some(c => c.id === r.organization?.id))));
                const sPrevRecs = prevRecords.filter(r => r.subject_key === s.key && (r.organization?.id === ro.id || (isMain && ro.children?.some(c => c.id === r.organization?.id))));
                
                table4.regional[ro.id].data[s.key] = {
                    curr: sRecs.length,
                    prev: sPrevRecs.length
                };
            });
        });

        // 5. Table 5 Aggregation (Regional Type Grid YoY)
        const table5: any = { total: { curr: records.length, prev: prevRecords.length }, regional: {} };
        regionalOrgs.forEach(ro => {
            const roRecs = records.filter(r => r.organization?.id === ro.id || ro.children?.some(c => c.id === r.organization?.id));
            const roPrevRecs = prevRecords.filter(r => r.organization?.id === ro.id || ro.children?.some(c => c.id === r.organization?.id));
            
            const getMetrics = (recs: any[]) => ({
                total: recs.length,
                ariza: recs.filter(r => r.appeal_type === AppealType.ARIZA).length,
                shikoyat: recs.filter(r => r.appeal_type === AppealType.SHIKOYAT).length,
                taklif: recs.filter(r => r.appeal_type === AppealType.TAKLIF).length,
            });

            table5.regional[ro.id] = {
                name: ro.name,
                phys: { curr: getMetrics(roRecs.filter(r => r.applicant_type === ApplicantType.PHYSICAL)), prev: getMetrics(roPrevRecs.filter(r => r.applicant_type === ApplicantType.PHYSICAL)) },
                legal: { curr: getMetrics(roRecs.filter(r => r.applicant_type === ApplicantType.LEGAL)), prev: getMetrics(roPrevRecs.filter(r => r.applicant_type === ApplicantType.LEGAL)) },
                total: { curr: roRecs.length, prev: roPrevRecs.length }
            };
        });

        // 6. Table 6 Aggregation (Status Grid - 16 Columns)
        const getT6FullMetrics = (recs: any[]) => ({
            total: recs.length,
            satisfied: recs.filter(r => r.status === AppealStatus.SATISFIED).length,
            explained: recs.filter(r => r.status === AppealStatus.EXPLAINED).length,
            referral: 0, // Placeholder for "Tegishliligi bo'yicha yuborilgan"
            rejected: recs.filter(r => r.status === AppealStatus.REJECTED).length,
            anonymous: 0, // Placeholder for "Ko'rmasdan qoldirilgan"
            being_considered: recs.filter(r => r.status === AppealStatus.BEING_CONSIDERED).length,
            overdue: recs.filter(r => r.is_overdue).length,
        });

        const peopleRecs = records.filter(r => r.channel === AppealChannel.PEOPLES_RECEPTION);
        const peopleRecsPrev = prevRecords.filter(r => r.channel === AppealChannel.PEOPLES_RECEPTION);
        const virtualRecs = records.filter(r => r.channel === AppealChannel.VIRTUAL_RECEPTION);
        const virtualRecsPrev = prevRecords.filter(r => r.channel === AppealChannel.VIRTUAL_RECEPTION);

        const table6 = {
            people: {
                curr: getT6FullMetrics(peopleRecs),
                prev: getT6FullMetrics(peopleRecsPrev)
            },
            virtual: {
                curr: getT6FullMetrics(virtualRecs),
                prev: getT6FullMetrics(virtualRecsPrev)
            }
        };

        // 7. Table 7 Aggregation (Disciplinary Detail Grid YoY)
        const table7: any = {
            disciplinary: {
                fine: { curr: records.filter(r => r.consequence === DisciplinaryMeasure.FINE).length, prev: prevRecords.filter(r => r.consequence === DisciplinaryMeasure.FINE).length },
                reprimand: { curr: records.filter(r => r.consequence === DisciplinaryMeasure.REPRIMAND).length, prev: prevRecords.filter(r => r.consequence === DisciplinaryMeasure.REPRIMAND).length },
                dismissal: { curr: records.filter(r => r.consequence === DisciplinaryMeasure.DISMISSAL).length, prev: prevRecords.filter(r => r.consequence === DisciplinaryMeasure.DISMISSAL).length },
                total: {
                    curr: records.filter(r => [DisciplinaryMeasure.FINE, DisciplinaryMeasure.REPRIMAND, DisciplinaryMeasure.DISMISSAL].includes(r.consequence)).length,
                    prev: prevRecords.filter(r => [DisciplinaryMeasure.FINE, DisciplinaryMeasure.REPRIMAND, DisciplinaryMeasure.DISMISSAL].includes(r.consequence)).length
                }
            },
            administrative: { curr: records.filter(r => r.consequence === DisciplinaryMeasure.ADMINISTRATIVE).length, prev: prevRecords.filter(r => r.consequence === DisciplinaryMeasure.ADMINISTRATIVE).length },
            criminal: { curr: records.filter(r => r.consequence === DisciplinaryMeasure.CRIMINAL).length, prev: prevRecords.filter(r => r.consequence === DisciplinaryMeasure.CRIMINAL).length },
            grand_total: {
                curr: records.filter(r => r.consequence && r.consequence !== DisciplinaryMeasure.NONE).length,
                prev: prevRecords.filter(r => r.consequence && r.consequence !== DisciplinaryMeasure.NONE).length
            }
        };

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

    async exportExcel(res: Response, organizationId: string, month: string) {
        const reports = await this.generateReportsFromRecords(organizationId, month);
        const org = await this.orgRepo.findOne({ where: { id: organizationId } });
        
        const [yearStr] = month.split('-');
        const currYear = parseInt(yearStr);
        const prevYear = currYear - 1;
        const currYearShort = currYear.toString().slice(-2);
        const prevYearShort = prevYear.toString().slice(-2);

        const workbook = new ExcelJS.Workbook();
        
        const headerFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } };
        const borderStyle: Partial<ExcelJS.Borders> = {
            top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
        };

        const setupSheet = (name: string, title: string, headers: string[], subHeaders: string[], widths: number[]) => {
            const sheet = workbook.addWorksheet(name);
            const titleRow = sheet.addRow([title]);
            titleRow.font = { bold: true, size: 14 };
            sheet.mergeCells(1, 1, 1, subHeaders.length > 0 ? subHeaders.length : headers.length);
            sheet.addRow([]); // empty row

            const headerRow = sheet.addRow(headers);
            headerRow.eachCell((cell) => {
                cell.fill = headerFill;
                cell.font = { bold: true };
                cell.border = borderStyle;
                cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            });

            if (subHeaders.length > 0) {
                const subHeaderRow = sheet.addRow(subHeaders);
                subHeaderRow.eachCell((cell) => {
                    cell.fill = headerFill;
                    cell.font = { bold: true };
                    cell.border = borderStyle;
                    cell.alignment = { horizontal: 'center' };
                });

                // Merging logic for Table 1 official format
                if (name === "1-Jadval") {
                    sheet.mergeCells(3, 1, 4, 1); // No
                    sheet.mergeCells(3, 2, 4, 2); // Rahbar
                    sheet.mergeCells(3, 3, 3, 4); // Jami
                    sheet.mergeCells(3, 5, 3, 6); // Og'zaki
                    sheet.mergeCells(3, 7, 3, 8); // Yozma
                    sheet.mergeCells(3, 9, 3, 10); // Elektron
                }

                if (name === "2-Jadval") {
                    sheet.mergeCells(3, 1, 4, 1); // No
                    sheet.mergeCells(3, 2, 4, 2); // Masalalar
                    sheet.mergeCells(3, 3, 3, 4); // Jami
                    sheet.mergeCells(3, 5, 3, 6); // Yozma
                    sheet.mergeCells(3, 7, 3, 8); // Elektron
                    sheet.mergeCells(3, 9, 3, 10); // Og'zaki
                    sheet.mergeCells(3, 11, 4, 11); // Nazoratga olinganlar
                    sheet.mergeCells(3, 12, 3, 15); // Jumladan (Natijalar)
                    sheet.mergeCells(3, 16, 4, 16); // Takroriylar
                    sheet.mergeCells(3, 17, 4, 17); // Muddati buzilganlar
                }

                if (name === "3-Jadval") {
                    sheet.mergeCells(3, 1, 4, 1); // No
                    sheet.mergeCells(3, 2, 4, 2); // Viloyatlar
                    sheet.mergeCells(3, 3, 3, 4); // Jami
                    sheet.mergeCells(3, 5, 3, 6); // Jismoniy
                    sheet.mergeCells(3, 7, 3, 8); // Yuridik
                    sheet.mergeCells(3, 9, 4, 19); // Shu jumladan (2026) -> Special merge
                    // Wait, 9-19 are individual columns but group-labeled.
                    sheet.mergeCells(2, 5, 2, 8); // Toifasi
                    sheet.mergeCells(2, 9, 2, 19); // 2026 bo'yicha
                    sheet.mergeCells(3, 11, 3, 15); // Og'zaki
                    sheet.mergeCells(2, 20, 2, 21); // VMdan
                    sheet.mergeCells(2, 22, 2, 23); // Sayyor qabullar
                }
            }

            widths.forEach((w, i) => {
                sheet.getColumn(i + 1).width = w;
            });
            return sheet;
        };

        // 1. Sheet: Table 1
        const s1 = setupSheet("1-Jadval", "Rahbarlar tomonidan murojaatlar ko'rib chiqilishi", 
            ["№", "Rahbar va o'rinbosarlari", "Jami murojaatlar", "", "Shaxsiy va sayyor qabullar (Og'zaki)", "", "Yozma murojaatlar", "", "Elektron murojaatlar", ""],
            ["", "", String(prevYear), String(currYear), String(prevYear), String(currYear), String(prevYear), String(currYear), String(prevYear), String(currYear)],
            [5, 40, 10, 10, 15, 15, 15, 15, 15, 15]);
        
        const t1 = reports.table1;
        const t1Rows = [
            [1, "Boshqarama boshlig'i", t1.head.total_prev, t1.head.total_curr, t1.head.oral_prev, t1.head.oral_curr, t1.head.written_prev, t1.head.written_curr, t1.head.electronic_prev, t1.head.electronic_curr],
            [2, "Boshliqning o'rinbosari (Epidemiologiya)", t1.deputy_epid.total_prev, t1.deputy_epid.total_curr, t1.deputy_epid.oral_prev, t1.deputy_epid.oral_curr, t1.deputy_epid.written_prev, t1.deputy_epid.written_curr, t1.deputy_epid.electronic_prev, t1.deputy_epid.electronic_curr],
            [3, "Boshliqning o'rinbosari (Sanitariya)", t1.deputy_san.total_prev, t1.deputy_san.total_curr, t1.deputy_san.oral_prev, t1.deputy_san.oral_curr, t1.deputy_san.written_prev, t1.deputy_san.written_curr, t1.deputy_san.electronic_prev, t1.deputy_san.electronic_curr]
        ];

        t1Rows.forEach(row => {
            const r = s1.addRow(row);
            r.eachCell(c => {
                c.border = borderStyle;
                c.alignment = { horizontal: c.address.includes('B') ? 'left' : 'center' };
            });
        });
        
        // Add Total row
        const t1Total = [
            "", "Jami", 
            t1Rows.reduce((a, b: any) => a + (b[2] || 0), 0),
            t1Rows.reduce((a, b: any) => a + (b[3] || 0), 0),
            t1Rows.reduce((a, b: any) => a + (b[4] || 0), 0),
            t1Rows.reduce((a, b: any) => a + (b[5] || 0), 0),
            t1Rows.reduce((a, b: any) => a + (b[6] || 0), 0),
            t1Rows.reduce((a, b: any) => a + (b[7] || 0), 0),
            t1Rows.reduce((a, b: any) => a + (b[8] || 0), 0),
            t1Rows.reduce((a, b: any) => a + (b[9] || 0), 0),
        ];
        const t1TotalRow = s1.addRow(t1Total);
        t1TotalRow.font = { bold: true };
        t1TotalRow.eachCell(c => c.border = borderStyle);

        // 2. Sheet: Table 2
        const s2 = setupSheet("2-Jadval", "Murojaatlar ijrosi va nazorati", 
            ["№", "Murojaatlarda ko'tarilgan masalalar", "Jami murojaatlar soni", "", "Murojaatlar shakllari (Yozma)", "", "Murojaatlar shakllari (Elektron)", "", "Murojaatlar shakllari (Og'zaki)", "", "Nazoratga olinganlar", "Jumladan (2026 yil bo'yicha results)", "", "", "", "Takroriylar", "Muddati buzilganlar"],
            ["", "", String(prevYear), String(currYear), String(prevYear), String(currYear), String(prevYear), String(currYear), String(prevYear), String(currYear), "", "Choralar ko'rildi", "Tushuntirildi", "Rad etildi", "Ko'rib chiqilmoqda", "", ""],
            [5, 45, 10, 10, 10, 10, 10, 10, 10, 10, 15, 15, 15, 15, 15, 15, 15]);
        
        const t2 = reports.table2;
        const subjects = [
            { key: "san_epid", label: "sanitariya-epidemiologiya masalalari bo'yicha" },
            { key: "coronavirus", label: "koronavirus bilan bog'liq muammolar bo'yicha" },
            { key: "labor", label: "mehnat munosabatlari to'g'risida" },
            { key: "medical", label: "tibbiy muassasalar faoliyati bilan bog'liq masalalar" },
            { key: "complaint_leader", label: "Rahbar ustidan shikoyat" },
            { key: "staff_behavior", label: "soha xodimlarining xatti-harakati yuzasidan" },
            { key: "disinfection", label: "dezinfeksiya tadbirlari bilan bog'liq masalalar" },
            { key: "fines", label: "qo'llanilgan jarimalardan norozilik" },
            { key: "other", label: "Boshqa masalalar" }
        ];

        subjects.forEach((s, idx) => {
            const val = t2[s.key] || {};
            const r = s2.addRow([
                idx + 1,
                s.label,
                val.total_prev || 0,
                val.total_curr || 0,
                val.written_prev || 0,
                val.written_curr || 0,
                val.electronic_prev || 0,
                val.electronic_curr || 0,
                val.oral_prev || 0,
                val.oral_curr || 0,
                val.under_control || 0,
                val.measures_taken || 0,
                val.explained || 0,
                val.rejected || 0,
                val.being_considered || 0,
                val.repeated || 0,
                val.overdue || 0
            ]);
            r.eachCell(c => {
                c.border = borderStyle;
                c.alignment = { horizontal: c.address.includes('B') ? 'left' : 'center', wrapText: true };
            });
        });

        // Add Total row for Table 2
        const t2Total = [
            "", "Jami",
            Object.values(t2).reduce((a: any, b: any) => a + (b.total_prev || 0), 0),
            Object.values(t2).reduce((a: any, b: any) => a + (b.total_curr || 0), 0),
            Object.values(t2).reduce((a: any, b: any) => a + (b.written_prev || 0), 0),
            Object.values(t2).reduce((a: any, b: any) => a + (b.written_curr || 0), 0),
            Object.values(t2).reduce((a: any, b: any) => a + (b.electronic_prev || 0), 0),
            Object.values(t2).reduce((a: any, b: any) => a + (b.electronic_curr || 0), 0),
            Object.values(t2).reduce((a: any, b: any) => a + (b.oral_prev || 0), 0),
            Object.values(t2).reduce((a: any, b: any) => a + (b.oral_curr || 0), 0),
            Object.values(t2).reduce((a: any, b: any) => a + (b.under_control || 0), 0),
            Object.values(t2).reduce((a: any, b: any) => a + (b.measures_taken || 0), 0),
            Object.values(t2).reduce((a: any, b: any) => a + (b.explained || 0), 0),
            Object.values(t2).reduce((a: any, b: any) => a + (b.rejected || 0), 0),
            Object.values(t2).reduce((a: any, b: any) => a + (b.being_considered || 0), 0),
            Object.values(t2).reduce((a: any, b: any) => a + (b.repeated || 0), 0),
            Object.values(t2).reduce((a: any, b: any) => a + (b.overdue || 0), 0),
        ];
        const t2TotalRow = s2.addRow(t2Total);
        t2TotalRow.font = { bold: true };
        t2TotalRow.eachCell(c => c.border = borderStyle);

        // 3. Sheet: Table 3 - 23 Columns Alignment (Official Regional Matrix)
        const t3 = reports.table3;
        const t3RegionalIds = Object.keys(t3.regional || {});

        const s3 = setupSheet("3-Jadval", "Murojaatlarning viloyat bo'yicha tahlili", 
            ["№", "Viloyatlar", "Jami murojaatlar soni", "", "Murojaat etuvchilar toifasi", "", "", "", "2026 yilgi murojaatlar bo'yicha", "", "", "", "", "", "", "", "", "", "", "Vazirlar Mahkamasidan kelgan", "", "O'tkazilgan sayyor qabullar soni", ""],
            ["", "", "2025", "2026", "Jismoniy shaxslar", "", "Yuridik shaxslar", "", "Yozma", "Elektron", "Og'zaki murojaatlar", "", "", "", "", "Аппаратда", "Hududiy idora", "Tegishli idora", "Ko'rib chiqilmoqda", "2025", "2026", "2025", "2026"],
            [5, 30, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 15, 15, 15, 15, 10, 10, 10, 10]);
        
        const s3SubHeader = s3.addRow(["", "", "", "", "2025", "2026", "2025", "2026", "", "", "Jami", "Shaxsiy qabul", "Sayyor qabul", "Xodimlar qabuli", "Ishonch telefoni", "", "", "", "", "", "", "", ""]);
        s3SubHeader.eachCell(c => { c.font = { bold: true }; c.border = borderStyle; c.alignment = { horizontal: 'center' }; });

        t3RegionalIds.forEach((id, idx) => {
            const reg = t3.regional[id];
            const dr = s3.addRow([
                idx + 1, reg.name,
                reg.count_prev, reg.count_curr,
                reg.phys_prev, reg.phys_curr,
                reg.legal_prev, reg.legal_curr,
                reg.written, reg.electronic,
                reg.oral_total, reg.oral_personal, reg.oral_field, reg.oral_staff, reg.oral_phone,
                reg.apparat_seen, reg.referral_regional, reg.referral_related, reg.being_considered,
                reg.vm_prev, reg.vm_curr,
                reg.field_meetings_prev, reg.field_meetings_curr
            ]);
            dr.eachCell(c => {
                c.border = borderStyle;
                c.alignment = { horizontal: c.address.includes('B') ? 'left' : 'center' };
            });
            if (idx === 0) dr.font = { bold: true };
        });

        // 4. Sheet: Table 4 - Regional Subjects Matrix YoY
        const t4 = reports.table4;
        const t4RegionalIds = Object.keys(t4.regional || {});
        const t4Header1 = ["№", "Murojaatlarda ko'tarilgan masalalar", "Jami murojaatlar", ""];
        const t4Header2 = ["", "", String(prevYear), String(currYear)];
        const t4Cols = [5, 45, 10, 10];
        
        t4RegionalIds.forEach(id => {
            t4Header1.push(t4.regional[id].name, "");
            t4Header2.push(String(prevYearShort), String(currYearShort));
            t4Cols.push(8, 8);
        });

        const s4 = setupSheet("4-Jadval", "Murojaat mazmuni (Mavzular)", t4Header1, t4Header2, t4Cols);
        s4.mergeCells(3, 1, 4, 1); s4.mergeCells(3, 2, 4, 2); s4.mergeCells(3, 3, 3, 4);
        t4RegionalIds.forEach((_, idx) => {
            const startCol = 5 + (idx * 2);
            s4.mergeCells(3, startCol, 3, startCol + 1);
        });

        subjects.forEach((s, idx) => {
            const rowData = [idx + 1, s.key, t4.subjects[s.key]?.count_prev || 0, t4.subjects[s.key]?.count_curr || 0];
            t4RegionalIds.forEach(id => {
                rowData.push(t4.regional[id].data[s.key]?.prev || 0, t4.regional[id].data[s.key]?.curr || 0);
            });
            const r = s4.addRow(rowData);
            r.eachCell(c => {
                c.border = borderStyle;
                c.alignment = { horizontal: c.address.includes('B') ? 'left' : 'center' };
            });
        });

        // 5. Sheet: Table 5 - Regional Types YoY
        const t5 = reports.table5;
        const t5RegionalIds = Object.keys(t5.regional || {});
        const s5 = setupSheet("5-Jadval", "Murojaat turlarining hududiy tahlili", 
            ["№", "Viloyatlar", "Jami murojaatlar", "", "Jismoniy shaxslar bo'yicha", "", "", "", "", "", "", "", "Yuridik shaxslar bo'yicha", "", "", "", "", "", "", ""],
            ["", "", String(prevYear), String(currYear), "Jami", "", "Ariza", "", "Shikoyat", "", "Taklif", "", "Jami", "", "Ariza", "", "Shikoyat", "", "Taklif", ""],
            [5, 20, 10, 10, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8]);
        
        // Complex merges for T5
        s5.mergeCells(3, 1, 5, 1); s5.mergeCells(3, 2, 5, 2); s5.mergeCells(3, 3, 4, 4);
        s5.mergeCells(3, 5, 3, 12); s5.mergeCells(3, 13, 3, 20);
        [5, 7, 9, 11, 13, 15, 17, 19].forEach(c => s5.mergeCells(4, c, 4, c+1));

        t5RegionalIds.forEach((id, idx) => {
            const reg = t5.regional[id];
            const r = s5.addRow([
                idx + 1, reg.name, reg.total.prev, reg.total.curr,
                reg.phys.prev.total, reg.phys.curr.total, reg.phys.prev.ariza, reg.phys.curr.ariza, reg.phys.prev.shikoyat, reg.phys.curr.shikoyat, reg.phys.prev.taklif, reg.phys.curr.taklif,
                reg.legal.prev.total, reg.legal.curr.total, reg.legal.prev.ariza, reg.legal.curr.ariza, reg.legal.prev.shikoyat, reg.legal.curr.shikoyat, reg.legal.prev.taklif, reg.legal.curr.taklif
            ]);
            r.eachCell(c => c.border = borderStyle);
        });

        // 6. Sheet: Table 6 - Status Grid (16 Columns)
        const s6 = setupSheet("6-Jadval", "Halk va Virtual qabulxonalar (16 ustunli)", 
            ["Xalq qabulxonalari orqali", "", "", "", "", "", "", "", "Virtual qabulxona orqali", "", "", "", "", "", "", ""],
            ["Jami", "Qanoat.", "Tushun.", "Tegish.", "Rad", "Anonim", "Ko'ril.", "Muddati.", "Jami", "Qanoat.", "Tushun.", "Tegish.", "Rad", "Anonim", "Ko'ril.", "Muddati."],
            [10, 8, 8, 8, 8, 8, 10, 8, 10, 8, 8, 8, 8, 8, 10, 8]);
        s6.mergeCells(3, 1, 3, 8); s6.mergeCells(3, 9, 3, 16);
        
        const t6 = reports.table6;
        const t6Row = s6.addRow([
            t6.people.curr.total, t6.people.curr.satisfied, t6.people.curr.explained, t6.people.curr.referral, t6.people.curr.rejected, t6.people.curr.anonymous, t6.people.curr.being_considered, t6.people.curr.overdue,
            t6.virtual.curr.total, t6.virtual.curr.satisfied, t6.virtual.curr.explained, t6.virtual.curr.referral, t6.virtual.curr.rejected, t6.virtual.curr.anonymous, t6.virtual.curr.being_considered, t6.virtual.curr.overdue
        ]);
        t6Row.eachCell(c => c.border = borderStyle);

        // 7. Sheet: Table 7 - Disciplinary Grid YoY
        const s7 = setupSheet("7-Jadval", "Javobgarlikka tortilganlik to'g'risida", 
            ["№", "Javobgarlik turlari", "Intizomiy javobgarlik", "", "", "", "", "", "", "", "Ma'muriy", "", "Jinoiy", "", "Jami", ""],
            ["", "", "Jarima", "", "Hayfsan", "", "Lavozim. ozod", "", "Jami", "", "", "", "", "", "", ""],
            [5, 25, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8]);
        s7.mergeCells(3, 1, 5, 1); s7.mergeCells(3, 2, 5, 2); s7.mergeCells(3, 3, 3, 10);
        s7.mergeCells(3, 11, 4, 12); s7.mergeCells(3, 13, 4, 14); s7.mergeCells(3, 15, 4, 16);
        s7.addRow(["", "", String(prevYearShort), String(currYearShort), String(prevYearShort), String(currYearShort), String(prevYearShort), String(currYearShort), String(prevYearShort), String(currYearShort), String(prevYearShort), String(currYearShort), String(prevYearShort), String(currYearShort), String(prevYearShort), String(currYearShort)]);
        
        const t7 = reports.table7;
        const t7DataRow = s7.addRow([
            1, "Jami ko'rilgan choralar",
            t7.disciplinary.fine.prev, t7.disciplinary.fine.curr,
            t7.disciplinary.reprimand.prev, t7.disciplinary.reprimand.curr,
            t7.disciplinary.dismissal.prev, t7.disciplinary.dismissal.curr,
            t7.disciplinary.total.prev, t7.disciplinary.total.curr,
            t7.administrative.prev, t7.administrative.curr,
            t7.criminal.prev, t7.criminal.curr,
            t7.grand_total.prev, t7.grand_total.curr
        ]);
        t7DataRow.eachCell(c => c.border = borderStyle);
        t7DataRow.font = { bold: true };

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename=Appeals_Report_${month}_${org?.name || 'export'}.xlsx`);
        await workbook.xlsx.write(res);
    }

    async exportPdf(res: Response, organizationId: string, month: string) {
        const reports = await this.generateReportsFromRecords(organizationId, month);
        const org = await this.orgRepo.findOne({ where: { id: organizationId } });
        
        const [yearStr] = month.split('-');
        const currYear = parseInt(yearStr);
        const prevYear = currYear - 1;

        const doc = new PDFDocument({ margin: 50 });
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=Appeals_Report_${month}.pdf`);

        doc.pipe(res);

        // Header
        doc.fontSize(16).text(`IJRO INTIZOMI HISOBOTI`, { align: 'center' });
        doc.fontSize(12).text(`${org?.name} - ${month}`, { align: 'center' });
        doc.moveDown();

        // 1-Jadval
        doc.fontSize(12).text("1-Jadval: Rahbarlar tomonidan murojaatlar ko'rib chiqilishi", { underline: true });
        doc.moveDown(0.5);
        const t1 = reports.table1;
        
        const renderT1Line = (label: string, data: any) => {
            doc.fontSize(10).font('Helvetica-Bold').text(`${label}:`);
            doc.fontSize(9).font('Helvetica').text(`  Jami: ${prevYear}: ${data.total_prev} | ${currYear}: ${data.total_curr}`);
            doc.text(`  Og'zaki: ${prevYear}: ${data.oral_prev} | ${currYear}: ${data.oral_curr}`);
            doc.text(`  Yozma: ${prevYear}: ${data.written_prev} | ${currYear}: ${data.written_curr}`);
            doc.text(`  Elektron: ${prevYear}: ${data.electronic_prev} | ${currYear}: ${data.electronic_curr}`);
            doc.moveDown(0.5);
        };

        renderT1Line("Boshqarma boshlig'i", t1.head);
        renderT1Line("Boshliqning o'rinbosari (Epidemiologiya)", t1.deputy_epid);
        renderT1Line("Boshliqning o'rinbosari (Sanitariya)", t1.deputy_san);
        doc.moveDown();

        // 2-Jadval
        doc.fontSize(12).font('Helvetica-Bold').text("2-Jadval: Murojaatlar ijrosi va nazorati (Masalalar)", { underline: true });
        doc.moveDown(0.5);
        const t2 = reports.table2;
        Object.entries(t2).forEach(([key, val]: [string, any]) => {
            doc.fontSize(10).font('Helvetica-Bold').text(`${key}:`);
            doc.fontSize(9).font('Helvetica').text(`  Jami: ${prevYear}: ${val.total_prev} | ${currYear}: ${val.total_curr}`);
            doc.text(`  Yozma: ${prevYear}: ${val.written_prev} | ${currYear}: ${val.written_curr}`);
            doc.text(`  Elektron: ${prevYear}: ${val.electronic_prev} | ${currYear}: ${val.electronic_curr}`);
            doc.text(`  Og'zaki: ${prevYear}: ${val.oral_prev} | ${currYear}: ${val.oral_curr}`);
            doc.text(`  Natijalar (2026): Nazoratda: ${val.under_control}, Chora: ${val.measures_taken}, Tushun.: ${val.explained}, Rad: ${val.rejected}`);
            doc.moveDown(0.5);
        });
        doc.moveDown();

        // 3-Jadval
        doc.addPage();
        doc.fontSize(12).font('Helvetica-Bold').text("3-Jadval: Murojaatlarning viloyat bo'yicha tahlili (23-Column Layout)", { underline: true });
        doc.moveDown(0.5);
        const t3 = reports.table3;
        Object.values(t3.regional).forEach((reg: any) => {
            doc.fontSize(10).font('Helvetica-Bold').text(`${reg.name}:`);
            doc.fontSize(9).font('Helvetica').text(`  Jami: ${prevYear}: ${reg.count_prev} | ${currYear}: ${reg.count_curr}`);
            doc.text(`  Toifa (2026): Jismoniy: ${reg.phys_curr}, Yuridik: ${reg.legal_curr}`);
            doc.text(`  Shakli (2026): Yozma: ${reg.written}, Elektron: ${reg.electronic}, Og'zaki (Jami): ${reg.oral_total}`);
            doc.text(`  Og'zaki Tafsilot: Shaxsiy: ${reg.oral_personal}, Sayyor: ${reg.oral_field}, Xodim: ${reg.oral_staff}, Tel: ${reg.oral_phone}`);
            doc.text(`  Natija: Ko'rilmoqda: ${reg.being_considered}, Sayyor qabullar (2026): ${reg.field_meetings_curr}`);
            doc.moveDown(0.5);
        });
        doc.moveDown();
        // 4-Jadval - Themes
        doc.addPage();
        doc.fontSize(12).font('Helvetica-Bold').text("4-Jadval: Murojaat mazmuni (Mavzular)", { underline: true });
        doc.moveDown(0.5);
        const t4 = reports.table4;
        subjects.forEach(s => {
            const countPrev = t4.subjects[s.key]?.count_prev || 0;
            const countCurr = t4.subjects[s.key]?.count_curr || 0;
            doc.fontSize(10).font('Helvetica').text(`${s.key}: ${prevYear}: ${countPrev} | ${currYear}: ${countCurr}`);
        });
        doc.moveDown();

        // 6-Jadval - Receptions
        doc.fontSize(12).font('Helvetica-Bold').text("6-Jadval: Xalq va Virtual qabulxonalar", { underline: true });
        doc.moveDown(0.5);
        const t6 = reports.table6;
        doc.fontSize(10).font('Helvetica').text(`Xalq qabulxonasi: Jami ${prevYear}: ${t6.people.prev.total || 0}, ${currYear}: ${t6.people.curr.total || 0}`);
        doc.text(`  (2026 natijalari: Qanoat: ${t6.people.curr.satisfied || 0}, Tushun: ${t6.people.curr.explained || 0}, Rad: ${t6.people.curr.rejected || 0})`);
        doc.text(`Virtual qabulxona: Jami ${prevYear}: ${t6.virtual.prev.total || 0}, ${currYear}: ${t6.virtual.curr.total || 0}`);
        doc.text(`  (2026 natijalari: Qanoat: ${t6.virtual.curr.satisfied || 0}, Tushun: ${t6.virtual.curr.explained || 0}, Rad: ${t6.virtual.curr.rejected || 0})`);
        doc.moveDown();

        // 7-Jadval - Consequences
        doc.fontSize(12).font('Helvetica-Bold').text("7-Jadval: Intizomiy choralar", { underline: true });
        doc.moveDown(0.5);
        const t7 = reports.table7;
        doc.fontSize(10).font('Helvetica').text(`Jami choralar: ${prevYear}: ${t7.grand_total.prev || 0} | ${currYear}: ${t7.grand_total.curr || 0}`);
        doc.text(`- Intizomiy: ${prevYear}: ${t7.disciplinary.total.prev || 0} | ${currYear}: ${t7.disciplinary.total.curr || 0}`);
        doc.text(`- Ma'muriy/Jinoiy: ${t7.administrative.curr || 0} / ${t7.criminal.curr || 0}`);
        doc.moveDown();

        doc.end();
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

