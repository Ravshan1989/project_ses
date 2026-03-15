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

    async exportExcel(res: Response, organizationId: string, month: string) {
        const reports = await this.generateReportsFromRecords(organizationId, month);
        const org = await this.orgRepo.findOne({ where: { id: organizationId } });
        
        const [yearStr] = month.split('-');
        const currYear = parseInt(yearStr);
        const prevYear = currYear - 1;

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
            ["Ko'rsatkich", "Soni"], [], [40, 15]);
        const t2 = reports.table2;
        [
            ["Jami murojaatlar", t2.total_curr],
            ["Yozma", t2.written_curr],
            ["Elektron", t2.electronic_curr],
            ["Og'zaki", t2.oral_curr],
            ["Qanoatlantirildi", t2.measures_taken],
            ["Tushuntirildi", t2.explained],
            ["Rad etildi", t2.rejected],
            ["Ko'rib chiqilmoqda", t2.being_considered],
            ["Takroriy", t2.repeated],
            ["Muddati o'tgan", t2.overdue]
        ].forEach(row => {
            const r = s2.addRow(row);
            r.eachCell(c => c.border = borderStyle);
        });

        // 3. Sheet: Table 3
        const s3 = setupSheet("3-Jadval", "Murojaatlar turlari va kanallari", 
            ["Ko'rsatkich", "Qiymat"], [], [30, 15]);
        const t3 = reports.table3;
        [
            ["Jami murojaatlar", t3.total_curr],
            ["Jismoniy shaxslar", t3.phys_curr],
            ["Yuridik shaxslar", t3.legal_curr],
            ["Yozma", t3.written],
            ["Elektron", t3.electronic],
            ["Og'zaki", t3.oral_total]
        ].forEach(row => {
            const r = s3.addRow(row);
            r.eachCell(c => c.border = borderStyle);
        });

        // 4. Sheet: Table 4
        const s4 = setupSheet("4-Jadval", "Murojaat mazmuni (Mavzular)", 
            ["Mavzu kodi", "Soni"], [], [20, 15]);
        Object.entries(reports.table4).forEach(([key, val]: [string, any]) => {
            const r = s4.addRow([key, val.count_curr]);
            r.eachCell(c => c.border = borderStyle);
        });

        // 5. Sheet: Table 5
        const s5 = setupSheet("5-Jadval", "Murojaat turi (Ariza, Shikoyat, Taklif)", 
            ["Shaxs turi", "Jami", "Ariza", "Shikoyat", "Taklif"], [], [15, 10, 10, 10, 10]);
        const t5 = reports.table5;
        [
            ["Jismoniy", t5.phys_total_curr, t5.phys_ariza_curr, t5.phys_shikoyat_curr, t5.phys_taklif_curr],
            ["Yuridik", t5.legal_total_curr, t5.legal_ariza_curr, t5.legal_shikoyat_curr, t5.legal_taklif_curr]
        ].forEach(row => {
            const r = s5.addRow(row);
            r.eachCell(c => c.border = borderStyle);
        });

        // 6. Sheet: Table 6
        const s6 = setupSheet("6-Jadval", "Xalq va Virtual qabulxonalar", 
            ["Turi", "Jami", "Qanoatlantirildi", "Tushuntirildi", "Rad etildi"], [], [20, 10, 15, 15, 15]);
        const t6 = reports.table6;
        [
            ["Xalq qabulxonasi", t6.people_total, t6.people_satisfied, t6.people_explained, t6.people_rejected],
            ["Virtual qabulxona", t6.virtual_total, t6.virtual_satisfied, t6.virtual_explained, t6.virtual_rejected]
        ].forEach(row => {
            const r = s6.addRow(row);
            r.eachCell(c => c.border = borderStyle);
        });

        // 7. Sheet: Table 7
        const s7 = setupSheet("7-Jadval", "Intizomiy va ma'muriy choralar", 
            ["Chora turi", "Soni"], [], [30, 15]);
        const t7 = reports.table7;
        [
            ["Jami choralar", t7.grand_total_curr],
            ["Intizomiy choralar (jami)", t7.disciplinary_total_curr],
            ["Jarima", t7.fine_curr],
            ["Hayfsan", t7.reprimand_curr],
            ["Ishdan bo'shatish", t7.dismissal_curr],
            ["Ma'muriy chora", t7.administrative_curr],
            ["Jinoiy javobgarlik", t7.criminal_curr]
        ].forEach(row => {
            const r = s7.addRow(row);
            r.eachCell(c => c.border = borderStyle);
        });

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

        // 3-Jadval
        doc.fontSize(12).text("3-Jadval: Murojaatlar turlari bo'yicha", { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).text(`Jami: ${reports.table3.total_curr}`);
        doc.text(`Jismoniy shaxslar: ${reports.table3.phys_curr}`);
        doc.text(`Yuridik shaxslar: ${reports.table3.legal_curr}`);
        doc.moveDown();

        // 5-Jadval
        doc.fontSize(12).text("5-Jadval: Murojaat mazmuni", { underline: true });
        doc.moveDown(0.5);
        const t5 = reports.table5;
        doc.fontSize(10).text(`Jismoniy: Jami: ${t5.phys_total_curr}, Ariza: ${t5.phys_ariza_curr}, Shikoyat: ${t5.phys_shikoyat_curr}, Taklif: ${t5.phys_taklif_curr}`);
        doc.text(`Yuridik: Jami: ${t5.legal_total_curr}, Ariza: ${t5.legal_ariza_curr}, Shikoyat: ${t5.legal_shikoyat_curr}, Taklif: ${t5.legal_taklif_curr}`);
        doc.moveDown();

        // 7-Jadval
        doc.fontSize(12).text("7-Jadval: Intizomiy choralar", { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).text(`Jarima: ${reports.table7.fine_curr}`);
        doc.text(`Hayfsan: ${reports.table7.reprimand_curr}`);
        doc.text(`Ishdan bo'shatish: ${reports.table7.dismissal_curr}`);

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

