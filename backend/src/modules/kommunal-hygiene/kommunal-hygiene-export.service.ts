import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { KgWaterReport } from './entities/water-report.entity';
import { KgOpenWaterReport } from './entities/open-water-report.entity';
import { KgWaterUsageReport } from './entities/water-usage-report.entity';
import { OrganizationsService } from '../organizations/organizations.service';

@Injectable()
export class KommunalHygieneExportService {
    constructor(
        @InjectRepository(KgWaterReport) private readonly waterRepo: Repository<KgWaterReport>,
        @InjectRepository(KgOpenWaterReport) private readonly openWaterRepo: Repository<KgOpenWaterReport>,
        @InjectRepository(KgWaterUsageReport) private readonly waterUsageRepo: Repository<KgWaterUsageReport>,
        private readonly orgService: OrganizationsService,
    ) { }

    async exportRegional(month: string, organizationId: string | undefined, res: Response) {
        const m = month.length === 7 ? `${month}-01` : month;

        if (organizationId === 'null' || organizationId === 'undefined') {
            organizationId = undefined;
        }

        let targetOrgs = [];
        if (organizationId && organizationId !== 'all') {
            const org = await this.orgService.findOne(organizationId);
            if (org) targetOrgs = [org];
        } else {
            const allOrgs = await this.orgService.findAll();
            targetOrgs = allOrgs.filter(o => o.parent !== null);
        }

        const wb = new ExcelJS.Workbook();
        await this.buildTable1Sheet(wb, m, targetOrgs);
        await this.buildTable2Sheet(wb, m, targetOrgs);
        await this.buildTable3Sheet(wb, m, targetOrgs);

        const fileName = organizationId && organizationId !== 'all' && targetOrgs.length > 0
            ? `KG_Monitoring_${targetOrgs[0].name.replace(/\s+/g, '_')}_${month}.xlsx`
            : `KG_Mintaqaviy_Monitoring_${month}.xlsx`;

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader('Content-Disposition', `attachment; filename=${encodeURI(fileName)}`);

        await wb.xlsx.write(res);
    }

    private setupHeaderStyle(cell: ExcelJS.Cell) {
        cell.font = { bold: true, name: 'Times New Roman', size: 9 };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = {
            top: { style: 'thin' }, left: { style: 'thin' },
            bottom: { style: 'thin' }, right: { style: 'thin' }
        };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
    }

    private setupDataStyle(cell: ExcelJS.Cell, isBold = false) {
        cell.font = { name: 'Times New Roman', size: 10, bold: isBold };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
            top: { style: 'thin' }, left: { style: 'thin' },
            bottom: { style: 'thin' }, right: { style: 'thin' }
        };
    }

    private async buildTable1Sheet(wb: ExcelJS.Workbook, month: string, orgs: any[]) {
        const ws = wb.addWorksheet('1-Jadval - Ichimlik suvi');
        const orgIds = orgs.map(o => o.id);

        let waterData = [];
        if (orgIds.length > 0) {
            waterData = await this.waterRepo.createQueryBuilder('r')
                .leftJoinAndSelect('r.organization', 'org')
                .where('r.reportMonth = :m', { m: month })
                .andWhere('org.id IN (:...orgIds)', { orgIds })
                .getMany();
        }

        const rowTypes = [
            { key: 'kommunal', label: "Kommunal vodoprovodlar jami" },
            { key: 'kommunal_norm', label: "Shundan sanitariya normalariga javob bermaydi" },
            { key: 'departmental', label: "Idoraviy vodoprovod" },
            { key: 'departmental_norm', label: "Shundan sanitariya normalariga javob bermaydi" }
        ];

        // Merge logic based on frontend table
        ws.mergeCells('A1:A3');
        ws.getCell('A1').value = 'Vodoprovod';
        this.setupHeaderStyle(ws.getCell('A1'));

        ws.mergeCells('B1:B3');
        ws.getCell('B1').value = 'Jami tekshirilgan namunalar';
        this.setupHeaderStyle(ws.getCell('B1'));

        ws.mergeCells('C1:N1');
        ws.getCell('C1').value = "Kimyoviy ko'rsatkichlar bo'yicha";
        this.setupHeaderStyle(ws.getCell('C1'));

        ws.mergeCells('C2:F2');
        ws.getCell('C2').value = 'Tashqi nuqtalardan olingan namunalar';
        this.setupHeaderStyle(ws.getCell('C2'));

        ['Manbadan', 'Tarmoqdan oldin', 'Tarmoq nuqtalaridan', "Iste'molchidan"].forEach((v, i) => {
            const cell = ws.getCell(3, 3 + i);
            cell.value = v;
            this.setupHeaderStyle(cell);
        });

        ws.mergeCells('G2:N2');
        ws.getCell('G2').value = "Sanitariya normalariga javob bermagan namunalar";
        this.setupHeaderStyle(ws.getCell('G2'));

        const badChemColumns = ['Ammiak', 'Nitrat', 'Nitrit', 'Quruq qoldiq', 'Xlorid', 'Sulfat', 'Loyqalik', 'Qattiqlik', 'Boshqalar'];
        badChemColumns.forEach((v, i) => {
            const cell = ws.getCell(3, 7 + i);
            cell.value = v;
            this.setupHeaderStyle(cell);
        });

        ws.mergeCells('O1:O3');
        ws.getCell('O1').value = "Jami tekshirilgan namunalar (Bakt)";
        this.setupHeaderStyle(ws.getCell('O1'));

        ws.mergeCells('P1:V1');
        ws.getCell('P1').value = "Bakteriologiya laboratoriyasi";
        this.setupHeaderStyle(ws.getCell('P1'));

        ws.mergeCells('P2:S2');
        ws.getCell('P2').value = 'Tashqi nuqtalardan olingan namunalar';
        this.setupHeaderStyle(ws.getCell('P2'));

        // C, D, E, F - same as above
        ['Manbadan', 'Tarmoqdan oldin', 'Tarmoq nuqtalaridan', "Iste'molchidan"].forEach((v, i) => {
            const cell = ws.getCell(3, 16 + i);
            cell.value = v;
            this.setupHeaderStyle(cell);
        });

        ws.mergeCells('T2:V2');
        ws.getCell('T2').value = "Sanitariya normalariga javob bermagan namunalar";
        this.setupHeaderStyle(ws.getCell('T2'));

        ['UMC', 'Koli indeks', 'SFZ'].forEach((v, i) => {
            const cell = ws.getCell(3, 20 + i);
            cell.value = v;
            this.setupHeaderStyle(cell);
        });

        ws.getRow(4).values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 1, 2, 3, 4, 5, 6, 7, 8];
        for (let i = 1; i <= 22; i++) {
            this.setupHeaderStyle(ws.getCell(4, i));
        }

        const fields = [
            'chem_total', 'chem_src_manba', 'chem_src_tarmok_oldin', 'chem_src_tarmok_point', 'chem_src_consumer',
            'chem_bad_ammiak', 'chem_bad_nitrat', 'chem_bad_nitrit', 'chem_bad_qoldiq', 'chem_bad_xlorid',
            'chem_bad_sulfat', 'chem_bad_loyqa', 'chem_bad_qattiq', 'chem_bad_other',
            'total_inspected_samples', 'bact_src_manba', 'bact_src_tarmok_oldin', 'bact_src_tarmok_point', 'bact_src_consumer',
            'bact_bad_umc', 'bact_bad_koli', 'bact_bad_sfz'
        ];

        // Aggregate values
        const exportRows = rowTypes.map(rt => {
            const matchedRows = waterData.filter(w => w.row_type === rt.key);
            const rowArr: any[] = [rt.label];
            fields.forEach(f => {
                const total = matchedRows.reduce((sum, r) => sum + (Number((r as any)[f]) || 0), 0);
                rowArr.push(total);
            });
            return rowArr;
        });

        exportRows.forEach((r, idx) => {
            const sheetRow = ws.addRow(r);
            sheetRow.eachCell(c => this.setupDataStyle(c));
            sheetRow.getCell(1).alignment = { horizontal: 'left', wrapText: true };
        });

        // Add Totals JAMI K+I, JAMI TKD
        const jamiKI: any[] = ['JAMI: K+I'];
        const jamiTKD: any[] = ['JAMI: TKD'];

        fields.forEach((f, idx) => {
            jamiKI.push(Number(exportRows[0][idx + 1]) + Number(exportRows[2][idx + 1]));
            jamiTKD.push(Number(exportRows[1][idx + 1]) + Number(exportRows[3][idx + 1]));
        });

        const kiRow = ws.addRow(jamiKI);
        kiRow.eachCell(c => this.setupDataStyle(c, true));
        const tkdRow = ws.addRow(jamiTKD);
        tkdRow.eachCell(c => this.setupDataStyle(c, true));

        // Adjust column widths
        ws.getColumn(1).width = 40;
        for (let i = 2; i <= 22; i++) ws.getColumn(i).width = 12;
    }

    private async buildTable2Sheet(wb: ExcelJS.Workbook, month: string, orgs: any[]) {
        const ws = wb.addWorksheet('2-Jadval - Ochiq suv');
        const orgIds = orgs.map(o => o.id);

        let data = [];
        if (orgIds.length > 0) {
            data = await this.openWaterRepo.createQueryBuilder('r')
                .leftJoinAndSelect('r.organization', 'org')
                .where('r.reportMonth = :m', { m: month })
                .andWhere('org.id IN (:...orgIds)', { orgIds })
                .getMany();
        }

        ws.mergeCells('A1:A4');
        ws.getCell('A1').value = 'Tuman/Shahar';
        this.setupHeaderStyle(ws.getCell('A1'));

        ws.mergeCells('B1:B4');
        ws.getCell('B1').value = "Ochiq suv havzasi nomi";
        this.setupHeaderStyle(ws.getCell('B1'));

        ws.mergeCells('C1:C4');
        ws.getCell('C1').value = "Obyekt nomi (turi)";
        this.setupHeaderStyle(ws.getCell('C1'));

        ws.mergeCells('D1:D4');
        ws.getCell('D1').value = "Tozalash inshootining holati";
        this.setupHeaderStyle(ws.getCell('D1'));

        ws.mergeCells('E1:N1');
        ws.getCell('E1').value = "Laboratoriya nazorati natijalari";
        this.setupHeaderStyle(ws.getCell('E1'));

        ws.mergeCells('E2:I2');
        ws.getCell('E2').value = "Kimyoviy ko'rsatkichlar";
        this.setupHeaderStyle(ws.getCell('E2'));

        ws.mergeCells('J2:N2');
        ws.getCell('J2').value = "Bakteriologik ko'rsatkichlar";
        this.setupHeaderStyle(ws.getCell('J2'));

        ['Tozalashdan oldin', 'Tozalashdan keyin', 'Samaradorlik (%)', 'Tozalashdan oldin', 'Tozalashdan keyin', 'Samaradorlik (%)'].forEach((v, i) => {
            if (i === 0) ws.mergeCells('E3:F3');
            if (i === 1) ws.mergeCells('G3:H3');
            if (i === 2) ws.mergeCells('I3:I4');
            if (i === 3) ws.mergeCells('J3:K3');
            if (i === 4) ws.mergeCells('L3:M3');
            if (i === 5) ws.mergeCells('N3:N4');
            if (i !== 2 && i !== 5) {
                const cell = ws.getCell(3, 5 + (i * 2) - (i >= 2 ? 1 : 0));
                cell.value = v;
                this.setupHeaderStyle(cell);
            } else {
                const col = i === 2 ? 9 : 14;
                const cell = ws.getCell(3, col);
                cell.value = v;
                this.setupHeaderStyle(cell);
            }
        });

        // E4, F4, G4, H4, J4, K4, L4, M4
        const subHdrs = [
            [5, 'Olingan namunalar soni'], [6, 'Javob bermaydi'],
            [7, 'Olingan namunalar soni'], [8, 'Javob bermaydi'],
            [10, 'Olingan namunalar soni'], [11, 'Javob bermaydi'],
            [12, 'Olingan namunalar soni'], [13, 'Javob bermaydi']
        ];
        subHdrs.forEach(([c, v]) => {
            const cell = ws.getCell(4, c as number);
            cell.value = v;
            this.setupHeaderStyle(cell);
        });

        let totalTotals = { cbt: 0, cbb: 0, cat: 0, cab: 0, bbt: 0, bbb: 0, bat: 0, bab: 0 };

        data.forEach(r => {
            totalTotals.cbt += Number(r.chem_before_total) || 0;
            totalTotals.cbb += Number(r.chem_before_bad) || 0;
            totalTotals.cat += Number(r.chem_after_total) || 0;
            totalTotals.cab += Number(r.chem_after_bad) || 0;
            totalTotals.bbt += Number(r.bact_before_total) || 0;
            totalTotals.bbb += Number(r.bact_before_bad) || 0;
            totalTotals.bat += Number(r.bact_after_total) || 0;
            totalTotals.bab += Number(r.bact_after_bad) || 0;

            const chem_eff = r.chem_before_bad > 0 ? ((r.chem_before_bad - r.chem_after_bad) / r.chem_before_bad * 100).toFixed(1) : '0.0';
            const bact_eff = r.bact_before_bad > 0 ? ((r.bact_before_bad - r.bact_after_bad) / r.bact_before_bad * 100).toFixed(1) : '0.0';

            const row = ws.addRow([
                r.organization?.name,
                r.water_body_name,
                r.object_name,
                r.treatment_system,
                r.chem_before_total, r.chem_before_bad,
                r.chem_after_total, r.chem_after_bad,
                chem_eff + '%',
                r.bact_before_total, r.bact_before_bad,
                r.bact_after_total, r.bact_after_bad,
                bact_eff + '%'
            ]);
            row.eachCell(cell => this.setupDataStyle(cell));
        });

        const globalChemEff = totalTotals.cbb > 0 ? ((totalTotals.cbb - totalTotals.cab) / totalTotals.cbb * 100).toFixed(1) : '0.0';
        const globalBactEff = totalTotals.bbb > 0 ? ((totalTotals.bbb - totalTotals.bab) / totalTotals.bbb * 100).toFixed(1) : '0.0';

        const totalRow = ws.addRow([
            'JAMI', '', '', '',
            totalTotals.cbt, totalTotals.cbb, totalTotals.cat, totalTotals.cab, globalChemEff + '%',
            totalTotals.bbt, totalTotals.bbb, totalTotals.bat, totalTotals.bab, globalBactEff + '%'
        ]);
        ws.mergeCells(`A${totalRow.number}:D${totalRow.number}`);
        totalRow.eachCell(c => this.setupDataStyle(c, true));
        ws.getCell(`A${totalRow.number}`).alignment = { horizontal: 'right' };

        ws.getColumn(1).width = 25;
        ws.getColumn(2).width = 25;
        ws.getColumn(3).width = 25;
        ws.getColumn(4).width = 25;
        for (let i = 5; i <= 14; i++) ws.getColumn(i).width = 12;
    }

    private async buildTable3Sheet(wb: ExcelJS.Workbook, month: string, orgs: any[]) {
        const ws = wb.addWorksheet('3-Jadval - Foydalanish obyekti');
        const orgIds = orgs.map(o => o.id);

        let data = [];
        if (orgIds.length > 0) {
            data = await this.waterUsageRepo.createQueryBuilder('r')
                .leftJoinAndSelect('r.organization', 'org')
                .where('r.reportMonth = :m', { m: month })
                .andWhere('org.id IN (:...orgIds)', { orgIds })
                .getMany();
        }

        ws.mergeCells('A1:A3');
        ws.getCell('A1').value = 'Tuman/Shahar';
        this.setupHeaderStyle(ws.getCell('A1'));

        ws.mergeCells('B1:B3');
        ws.getCell('B1').value = "Ochiq suv havzasi nomi";
        this.setupHeaderStyle(ws.getCell('B1'));

        ws.mergeCells('C1:C3');
        ws.getCell('C1').value = "Toifasi";
        this.setupHeaderStyle(ws.getCell('C1'));

        ws.mergeCells('D1:L1');
        ws.getCell('D1').value = "Ochiq suv havzalarining ruxsat etilgan me'yorlaridan chetlashishi";
        this.setupHeaderStyle(ws.getCell('D1'));

        ws.mergeCells('D2:D3');
        ws.getCell('D2').value = "Tekshirilgan namunalar jami";
        this.setupHeaderStyle(ws.getCell('D2'));

        ws.mergeCells('E2:E3');
        ws.getCell('E2').value = "Sanitariya normalariga javob bermaydigan namunalar (bakt)";
        this.setupHeaderStyle(ws.getCell('E2'));

        ws.mergeCells('F2:H2');
        ws.getCell('F2').value = "Patogen mikroorganizmlar aniqlanishi (shundan)";
        this.setupHeaderStyle(ws.getCell('F2'));

        ['Yuqumli kasallik', 'Vabo vibrioni', 'Gelmint va gelmint tuxumlari'].forEach((v, i) => {
            const cell = ws.getCell(3, 6 + i);
            cell.value = v;
            this.setupHeaderStyle(cell);
        });

        ws.mergeCells('I2:J2');
        ws.getCell('I2').value = "Kimyoviy ko'rsatkichlar tahlili uchun jami namunalar, shu jumladan zaharli ximikatlar";
        this.setupHeaderStyle(ws.getCell('I2'));
        ws.getCell('I3').value = "Jami"; this.setupHeaderStyle(ws.getCell('I3'));
        ws.getCell('J3').value = "Shu jumladan zaharli ximikatlar"; this.setupHeaderStyle(ws.getCell('J3'));

        ws.mergeCells('K2:L2');
        ws.getCell('K2').value = "Sanitariya ko'rsatkichlariga javob bermaydigan namunalar (kimyo, shu jumladan zaxarli ximikatlar)";
        this.setupHeaderStyle(ws.getCell('K2'));
        ws.getCell('K3').value = "Jami"; this.setupHeaderStyle(ws.getCell('K3'));
        ws.getCell('L3').value = "Shu jumladan zaharli ximikatlar javob bermaydi"; this.setupHeaderStyle(ws.getCell('L3'));

        let totals = {
            t1: 0, t2: 0, t3: 0, t4: 0, t5: 0, t6: 0, t7: 0, t8: 0, t9: 0
        };

        data.forEach(r => {
            totals.t1 += Number(r.samples_taken) || 0;
            totals.t2 += Number(r.samples_bad) || 0;
            totals.t3 += Number(r.pathogen_inf_disease) || 0;
            totals.t4 += Number(r.pathogen_cholera) || 0;
            totals.t5 += Number(r.pathogen_parasite) || 0;
            totals.t6 += Number(r.chem_samples_total) || 0;
            totals.t7 += Number(r.chem_pesticide_presence) || 0;
            totals.t8 += Number(r.chem_bad_total) || 0;
            totals.t9 += Number(r.chem_bad_pesticide) || 0;

            const row = ws.addRow([
                r.organization?.name,
                r.water_body_name,
                r.category,
                r.samples_taken, r.samples_bad,
                r.pathogen_inf_disease, r.pathogen_cholera, r.pathogen_parasite,
                r.chem_samples_total, r.chem_pesticide_presence,
                r.chem_bad_total, r.chem_bad_pesticide
            ]);
            row.eachCell(cell => this.setupDataStyle(cell));
        });

        const totalRow = ws.addRow([
            'JAMI', '', '',
            totals.t1, totals.t2, totals.t3, totals.t4, totals.t5,
            totals.t6, totals.t7, totals.t8, totals.t9
        ]);
        ws.mergeCells(`A${totalRow.number}:C${totalRow.number}`);
        totalRow.eachCell(c => this.setupDataStyle(c, true));
        ws.getCell(`A${totalRow.number}`).alignment = { horizontal: 'right' };

        ws.getColumn(1).width = 25;
        ws.getColumn(2).width = 25;
        ws.getColumn(3).width = 15;
        for (let i = 4; i <= 12; i++) ws.getColumn(i).width = 15;
    }
}
