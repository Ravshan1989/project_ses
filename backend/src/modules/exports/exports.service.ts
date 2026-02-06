import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between } from "typeorm";
import { HepatitisDailyReport } from "../daily-reports/entities/hepatitis-daily-report.entity";
import { FluDailyReport } from "../daily-reports/entities/flu-daily-report.entity";
import { AriDailyReport } from "../daily-reports/entities/ari-daily-report.entity";
import { Submission } from "../submissions/entities/submission.entity";
import { User } from "../users/entities/user.entity";
import { getRoleLevel } from "../../common/utils/role.util";
import { ReportStatus } from "../../common/enums/report-status.enum";
import { UserRole } from "../../common/enums/role.enum";
import * as ExcelJS from 'exceljs';
import { VerificationService } from "../daily-reports/verification.service";
import { Response } from 'express';

@Injectable()
export class ExportsService {
  constructor(
    @InjectRepository(HepatitisDailyReport)
    private readonly hepatitisRepo: Repository<HepatitisDailyReport>,

    @InjectRepository(FluDailyReport)
    private readonly fluRepo: Repository<FluDailyReport>,

    @InjectRepository(AriDailyReport)
    private readonly ariRepo: Repository<AriDailyReport>,

    @InjectRepository(Submission)
    private readonly submissionRepo: Repository<Submission>,

    private readonly verificationService: VerificationService,
  ) { }

  async getFluReports(startDate: string, endDate: string, includeTest = false, user: User) {
    const level = getRoleLevel(user.role);
    const where: any = {
      reportDate: Between(startDate, endDate),
      isTest: includeTest,
    };

    if (level === 3) {
      where.organization = { id: user.organization.id };
    } else if (level === 2) {
      where.organization = { parent: { id: user.organization.id } };
      where.status = ReportStatus.APPROVED; // UZ: Faqat tasdiqlanganlar
    } else if (level === 1 && user.role !== UserRole.ADMIN) {
      where.status = ReportStatus.APPROVED; // UZ: Faqat tasdiqlanganlar
    }

    return this.fluRepo.find({
      where,
      relations: ["organization", "verifiedBy", "approvedBy"],
      order: { reportDate: "ASC" },
    });
  }

  async getHepatitisReports(startDate: string, endDate: string, includeTest = false, user: User) {
    const level = getRoleLevel(user.role);
    const where: any = {
      reportDate: Between(startDate, endDate),
      isTest: includeTest,
    };

    if (level === 3) {
      where.organization = { id: user.organization.id };
    } else if (level === 2) {
      where.organization = { parent: { id: user.organization.id } };
      where.status = ReportStatus.APPROVED; // UZ: Faqat tasdiqlanganlar
    } else if (level === 1 && user.role !== UserRole.ADMIN) {
      where.status = ReportStatus.APPROVED; // UZ: Faqat tasdiqlanganlar
    }

    return this.hepatitisRepo.find({
      where,
      relations: ["organization", "verifiedBy", "approvedBy"],
      order: { reportDate: "ASC" },
    });
  }

  async getForm1Reports(startDate: string, endDate: string, includeTest = false, user: User) {
    const level = getRoleLevel(user.role);
    const where: any = {
      reportingPeriod: Between(startDate, endDate),
      isTest: includeTest,
    };

    if (level === 3) {
      where.organization = { id: user.organization.id };
    } else if (level === 2) {
      where.organization = { parent: { id: user.organization.id } };
      where.status = ReportStatus.APPROVED;
    } else if (level === 1 && user.role !== UserRole.ADMIN) {
      where.status = ReportStatus.APPROVED;
    }

    return this.submissionRepo.find({
      where,
      relations: ["organization", "template"],
      order: { reportingPeriod: "ASC" },
    });
  }

  async getAriReports(startDate: string, endDate: string, includeTest = false, user: User) {
    const level = getRoleLevel(user.role);
    const where: any = {
      reportDate: Between(startDate, endDate),
      isTest: includeTest,
    };

    if (level === 3) {
      where.organization = { id: user.organization.id };
    } else if (level === 2) {
      where.organization = { parent: { id: user.organization.id } };
      where.status = ReportStatus.APPROVED;
    } else if (level === 1 && user.role !== UserRole.ADMIN) {
      where.status = ReportStatus.APPROVED;
    }

    return this.ariRepo.find({
      where,
      relations: ["organization", "verifiedBy", "approvedBy"],
      order: { reportDate: "ASC" },
    });
  }

  async exportAriToExcel(res: Response, startDate: string, endDate: string, includeTest = false, user: User) {
    const reports = await this.getAriReports(startDate, endDate, includeTest, user);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('ARI Reports');

    worksheet.mergeCells('A1:L1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `ARI bo'yicha kunlik hisobot (${startDate} - ${endDate})`;
    titleCell.font = { bold: true, size: 14 };
    titleCell.alignment = { horizontal: 'center' };

    const headerRow = worksheet.addRow(['№', 'Hudud', 'Sana', 'Holat', 'Gospitalizatsiya', 'ARI jami', 'Pnevmoniya', 'Tekshiruvchi', 'Tasdiqlovchi', 'QR Kod']);
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE9E9E9' } };
      cell.font = { bold: true };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    for (let i = 0; i < reports.length; i++) {
      const r = reports[i];
      const row = worksheet.addRow([
        i + 1,
        r.organization?.name,
        r.reportDate,
        r.status,
        r.gk,
        r.ari,
        r.pneumonia,
        r.verifiedBy?.username || '-',
        r.approvedBy?.username || '-',
        ''
      ]);

      row.eachCell((cell) => {
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      });

      if (r.verificationToken) {
        try {
          const qrBuffer = await this.verificationService.generateQRCodeBuffer(r.verificationToken);
          const imageId = workbook.addImage({
            buffer: qrBuffer as any,
            extension: 'png',
          });
          worksheet.addImage(imageId, {
            tl: { col: 9, row: row.number - 1 },
            ext: { width: 50, height: 50 }
          });
          row.height = 40;
        } catch (e) {
          console.error('Failed to add QR to excel', e);
        }
      }
    }

    const lastRow = worksheet.lastRow.number + 2;
    worksheet.getCell(`A${lastRow}`).value = "Mas'ul xodim:";
    worksheet.getCell(`C${lastRow}`).value = "____________________";
    worksheet.getCell(`A${lastRow + 1}`).value = "Bo'lim mudiri:";
    worksheet.getCell(`C${lastRow + 1}`).value = "____________________";

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=ARI_Report_${startDate}.xlsx`);
    await workbook.xlsx.write(res);
  }

  async exportFluToExcel(res: Response, startDate: string, endDate: string, includeTest = false, user: User) {
    const reports = await this.getFluReports(startDate, endDate, includeTest, user);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Flu Reports');

    // Title
    worksheet.mergeCells('A1:J1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `Gripp va O'RVI bo'yicha kunlik hisobot (${startDate} - ${endDate})`;
    titleCell.font = { bold: true, size: 14 };
    titleCell.alignment = { horizontal: 'center' };

    // Headers
    const headerRow = worksheet.addRow(['№', 'Hudud', 'Sana', 'Holat', 'Jami (ARI)', '0-1 yosh', '1-2 yosh', '3-6 yosh', '7-14 yosh', 'Kattalar', 'Tekshiruvchi', 'Tasdiqlovchi', 'QR Kod']);
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE9E9E9' } };
      cell.font = { bold: true };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    // Data
    for (let i = 0; i < reports.length; i++) {
      const r = reports[i];
      const row = worksheet.addRow([
        i + 1,
        r.organization?.name,
        r.reportDate,
        r.status,
        r.ari_total,
        r.ari_0_1,
        r.ari_1_2,
        r.ari_3_6,
        r.ari_7_14,
        r.ari_adult,
        r.verifiedBy?.username || '-',
        r.approvedBy?.username || '-',
        '' // QR slot
      ]);

      row.eachCell((cell) => {
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      });

      // Add QR Code if token exists
      if (r.verificationToken) {
        try {
          const qrBuffer = await this.verificationService.generateQRCodeBuffer(r.verificationToken);
          const imageId = workbook.addImage({
            buffer: qrBuffer as any,
            extension: 'png',
          });
          worksheet.addImage(imageId, {
            tl: { col: 12, row: row.number - 1 },
            ext: { width: 50, height: 50 }
          });
          row.height = 40; // Adjust row height for QR
        } catch (e) {
          console.error('Failed to add QR to excel', e);
        }
      }
    }

    // Footer Signatures
    const lastRow = worksheet.lastRow.number + 2;
    worksheet.getCell(`A${lastRow}`).value = "Mas'ul xodim:";
    worksheet.getCell(`C${lastRow}`).value = "____________________";
    worksheet.getCell(`A${lastRow + 1}`).value = "Bo'lim mudiri:";
    worksheet.getCell(`C${lastRow + 1}`).value = "____________________";

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Flu_Report_${startDate}.xlsx`);

    await workbook.xlsx.write(res);
  }

  async exportHepatitisToExcel(res: Response, startDate: string, endDate: string, includeTest = false, user: User) {
    const reports = await this.getHepatitisReports(startDate, endDate, includeTest, user);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Hepatitis Reports');

    // Title
    worksheet.mergeCells('A1:J1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `Virusli Gepatit A bo'yicha kunlik hisobot (${startDate} - ${endDate})`;
    titleCell.font = { bold: true, size: 14 };
    titleCell.alignment = { horizontal: 'center' };

    // Headers
    const headerRow = worksheet.addRow(['№', 'Hudud', 'Sana', 'Holat', 'Jami (VGA)', '1 yoshgacha', '1-3 yosh', '4-6 yosh', '7-14 yosh', '20+ yosh', 'Tekshiruvchi', 'Tasdiqlovchi', 'QR Kod']);
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE9E9E9' } };
      cell.font = { bold: true };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    // Data
    for (let i = 0; i < reports.length; i++) {
      const r = reports[i];
      const row = worksheet.addRow([
        i + 1,
        r.organization?.name,
        r.reportDate,
        r.status,
        r.total_cases,
        r.age_under_1,
        r.age_1_3,
        r.age_4_6,
        r.age_7_14,
        r.age_20_plus,
        r.verifiedBy?.username || '-',
        r.approvedBy?.username || '-',
        '' // QR slot
      ]);

      row.eachCell((cell) => {
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      });

      if (r.verificationToken) {
        try {
          const qrBuffer = await this.verificationService.generateQRCodeBuffer(r.verificationToken);
          const imageId = workbook.addImage({
            buffer: qrBuffer as any,
            extension: 'png',
          });
          worksheet.addImage(imageId, {
            tl: { col: 12, row: row.number - 1 },
            ext: { width: 50, height: 50 }
          });
          row.height = 40;
        } catch (e) {
          console.error('Failed to add QR to excel', e);
        }
      }
    }

    // Footer Signatures
    const lastRow = worksheet.lastRow.number + 2;
    worksheet.getCell(`A${lastRow}`).value = "Mas'ul xodim:";
    worksheet.getCell(`C${lastRow}`).value = "____________________";
    worksheet.getCell(`A${lastRow + 1}`).value = "Bo'lim mudiri:";
    worksheet.getCell(`C${lastRow + 1}`).value = "____________________";

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Hepatitis_Report_${startDate}.xlsx`);

    await workbook.xlsx.write(res);
  }
}
