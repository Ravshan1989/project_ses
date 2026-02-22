import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between, Not, IsNull } from "typeorm";
import { HepatitisDailyReport } from "../daily-reports/entities/hepatitis-daily-report.entity";
import { FluDailyReport } from "../daily-reports/entities/flu-daily-report.entity";
import { AriDailyReport } from "../daily-reports/entities/ari-daily-report.entity";
import { CovidDailyReport } from "../daily-reports/entities/covid-daily-report.entity";
import { EpidemiologyDailyReport } from "../daily-reports/entities/epidemiology-daily-report.entity";
import { Submission } from "../submissions/entities/submission.entity";
import { User } from "../users/entities/user.entity";
import { getRoleLevel } from "../../common/utils/role.util";
import { ReportStatus } from "../../common/enums/report-status.enum";
import { UserRole } from "../../common/enums/role.enum";
import * as ExcelJS from "exceljs";
import { VerificationService } from "../daily-reports/verification.service";
import { DiseasesService } from "../diseases/diseases.service";
import { Response } from "express";
import { Organization } from "../organizations/entities/organization.entity";

@Injectable()
export class ExportsService {
  constructor(
    @InjectRepository(HepatitisDailyReport)
    private readonly hepatitisRepo: Repository<HepatitisDailyReport>,

    @InjectRepository(FluDailyReport)
    private readonly fluRepo: Repository<FluDailyReport>,

    @InjectRepository(AriDailyReport)
    private readonly ariRepo: Repository<AriDailyReport>,

    @InjectRepository(CovidDailyReport)
    private readonly covidRepo: Repository<CovidDailyReport>,

    @InjectRepository(EpidemiologyDailyReport)
    private readonly epiRepo: Repository<EpidemiologyDailyReport>,

    @InjectRepository(Submission)
    private readonly submissionRepo: Repository<Submission>,
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
    private readonly diseasesService: DiseasesService,
    private readonly verificationService: VerificationService,
  ) {}

  async getFluReports(
    startDate: string,
    endDate: string,
    includeTest = false,
    user: User,
    districtId?: string,
  ) {
    const level = getRoleLevel(user.role, user);
    if ((level === 2 || level === 3) && !user.organization) {
      return [];
    }
    const where: any = {
      reportDate: Between(startDate, endDate),
      isTest: includeTest,
    };

    if (level === 3) {
      where.organization = { id: user.organization.id };
    } else if (level === 2) {
      if (districtId && districtId !== "all") {
        where.organization = { id: districtId };
      } else {
        where.organization = { parent: { id: user.organization.id } };
      }
      where.status = ReportStatus.APPROVED; // UZ: Faqat tasdiqlanganlar
    } else if (level === 1 && user.role !== UserRole.ADMIN) {
      if (districtId && districtId !== "all") {
        where.organization = { id: districtId };
      }
      where.status = ReportStatus.APPROVED; // UZ: Faqat tasdiqlanganlar
    }

    return this.fluRepo.find({
      where,
      relations: ["organization", "verifiedBy", "approvedBy"],
      order: { reportDate: "ASC" },
    });
  }

  async getHepatitisReports(
    startDate: string,
    endDate: string,
    includeTest = false,
    user: User,
    districtId?: string,
  ) {
    const level = getRoleLevel(user.role, user);
    if ((level === 2 || level === 3) && !user.organization) {
      return [];
    }
    const where: any = {
      reportDate: Between(startDate, endDate),
      isTest: includeTest,
    };

    if (level === 3) {
      where.organization = { id: user.organization.id };
    } else if (level === 2) {
      if (districtId && districtId !== "all") {
        where.organization = { id: districtId };
      } else {
        where.organization = { parent: { id: user.organization.id } };
      }
      where.status = ReportStatus.APPROVED; // UZ: Faqat tasdiqlanganlar
    } else if (level === 1 && user.role !== UserRole.ADMIN) {
      if (districtId && districtId !== "all") {
        where.organization = { id: districtId };
      }
      where.status = ReportStatus.APPROVED; // UZ: Faqat tasdiqlanganlar
    }

    return this.hepatitisRepo.find({
      where,
      relations: ["organization", "verifiedBy", "approvedBy"],
      order: { reportDate: "ASC" },
    });
  }

  async getForm1Reports(
    startDate: string,
    endDate: string,
    includeTest = false,
    user: User,
    districtId?: string,
  ) {
    const level = getRoleLevel(user.role, user);
    if ((level === 2 || level === 3) && !user.organization) {
      return [];
    }
    const where: any = {
      reportingPeriod: Between(startDate, endDate),
      isTest: includeTest,
    };

    if (level === 3) {
      where.organization = { id: user.organization.id };
    } else if (level === 2) {
      if (districtId && districtId !== "all") {
        where.organization = { id: districtId };
      } else {
        where.organization = { parent: { id: user.organization.id } };
      }
      where.status = ReportStatus.APPROVED;
    } else if (level === 1 && user.role !== UserRole.ADMIN) {
      if (districtId && districtId !== "all") {
        where.organization = { id: districtId };
      }
      where.status = ReportStatus.APPROVED;
    }

    return this.submissionRepo.find({
      where,
      relations: ["organization", "template"],
      order: { reportingPeriod: "ASC" },
    });
  }

  async getAriReports(
    startDate: string,
    endDate: string,
    includeTest = false,
    user: User,
    districtId?: string,
  ) {
    const level = getRoleLevel(user.role, user);
    if ((level === 2 || level === 3) && !user.organization) {
      return [];
    }
    const where: any = {
      reportDate: Between(startDate, endDate),
      isTest: includeTest,
    };

    if (level === 3) {
      where.organization = { id: user.organization.id };
    } else if (level === 2) {
      if (districtId && districtId !== "all") {
        where.organization = { id: districtId };
      } else {
        where.organization = { parent: { id: user.organization.id } };
      }
      where.status = ReportStatus.APPROVED;
    } else if (level === 1 && user.role !== UserRole.ADMIN) {
      if (districtId && districtId !== "all") {
        where.organization = { id: districtId };
      }
      where.status = ReportStatus.APPROVED;
    }

    return this.ariRepo.find({
      where,
      relations: ["organization", "verifiedBy", "approvedBy"],
      order: { reportDate: "ASC" },
    });
  }

  async getCovidReports(
    startDate: string,
    endDate: string,
    includeTest = false,
    user: User,
    districtId?: string,
  ) {
    const level = getRoleLevel(user.role, user);
    if ((level === 2 || level === 3) && !user.organization) {
      return [];
    }
    const where: any = {
      reportDate: Between(startDate, endDate),
      isTest: includeTest,
    };

    if (level === 3) {
      where.organization = { id: user.organization.id };
    } else if (level === 2) {
      if (districtId && districtId !== "all") {
        where.organization = { id: districtId };
      } else {
        where.organization = { parent: { id: user.organization.id } };
      }
      where.status = ReportStatus.APPROVED;
    } else if (level === 1 && user.role !== UserRole.ADMIN) {
      if (districtId && districtId !== "all") {
        where.organization = { id: districtId };
      }
      where.status = ReportStatus.APPROVED;
    }

    return this.covidRepo.find({
      where,
      relations: ["organization", "verifiedBy", "approvedBy"],
      order: { reportDate: "ASC" },
    });
  }

  async getEpidemiologyReports(
    startDate: string,
    endDate: string,
    includeTest = false,
    user: User,
    districtId?: string,
  ) {
    const level = getRoleLevel(user.role, user);
    if ((level === 2 || level === 3) && !user.organization) {
      return [];
    }
    const where: any = {
      reportDate: Between(startDate, endDate),
      isTest: includeTest,
    };

    if (level === 3) {
      where.organization = { id: user.organization.id };
    } else if (level === 2) {
      if (districtId && districtId !== "all") {
        where.organization = { id: districtId };
      } else {
        where.organization = { parent: { id: user.organization.id } };
      }
      where.status = ReportStatus.APPROVED;
    } else if (level === 1 && user.role !== UserRole.ADMIN) {
      if (districtId && districtId !== "all") {
        where.organization = { id: districtId };
      }
      where.status = ReportStatus.APPROVED;
    }

    return this.epiRepo.find({
      where,
      relations: ["organization", "verifiedBy", "approvedBy"],
      order: { reportDate: "ASC" },
    });
  }

  async exportAriToExcel(
    res: Response,
    startDate: string,
    endDate: string,
    includeTest = false,
    user: User,
    districtId?: string,
  ) {
    const reports = await this.getAriReports(
      startDate,
      endDate,
      includeTest,
      user,
      districtId,
    );
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("ARI Reports");

    worksheet.mergeCells("A1:L1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = `ARI bo'yicha kunlik hisobot (${startDate} - ${endDate})`;
    titleCell.font = { bold: true, size: 14 };
    titleCell.alignment = { horizontal: "center" };

    const headerRow = worksheet.addRow([
      "№",
      "Hudud",
      "Sana",
      "Holat",
      "Gospitalizatsiya",
      "ARI jami",
      "Pnevmoniya",
      "Tekshiruvchi",
      "Tasdiqlovchi",
      "QR Kod",
    ]);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE9E9E9" },
      };
      cell.font = { bold: true };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
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
        r.verifiedBy?.username || "-",
        r.approvedBy?.username || "-",
        "",
      ]);

      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      if (r.verificationToken) {
        try {
          const qrBuffer = await this.verificationService.generateQRCodeBuffer(
            r.verificationToken,
          );
          const imageId = workbook.addImage({
            buffer: qrBuffer as any,
            extension: "png",
          });
          worksheet.addImage(imageId, {
            tl: { col: 9, row: row.number - 1 },
            ext: { width: 50, height: 50 },
          });
          row.height = 40;
        } catch (e) {
          console.error("Failed to add QR to excel", e);
        }
      }
    }

    const lastRow = worksheet.lastRow.number + 2;
    worksheet.getCell(`A${lastRow}`).value = "Mas'ul xodim:";
    worksheet.getCell(`C${lastRow}`).value = "____________________";
    worksheet.getCell(`A${lastRow + 1}`).value = "Bo'lim mudiri:";
    worksheet.getCell(`C${lastRow + 1}`).value = "____________________";

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=ARI_Report_${startDate}.xlsx`,
    );
    await workbook.xlsx.write(res);
  }

  async exportFluToExcel(
    res: Response,
    startDate: string,
    endDate: string,
    includeTest = false,
    user: User,
    districtId?: string,
  ) {
    const reports = await this.getFluReports(
      startDate,
      endDate,
      includeTest,
      user,
      districtId,
    );

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Flu Reports");

    // Title
    worksheet.mergeCells("A1:J1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = `Gripp va O'RVI bo'yicha kunlik hisobot (${startDate} - ${endDate})`;
    titleCell.font = { bold: true, size: 14 };
    titleCell.alignment = { horizontal: "center" };

    // Headers
    const headerRow = worksheet.addRow([
      "№",
      "Hudud",
      "Sana",
      "Holat",
      "Jami (ARI)",
      "0-1 yosh",
      "1-2 yosh",
      "3-6 yosh",
      "7-14 yosh",
      "Kattalar",
      "Tekshiruvchi",
      "Tasdiqlovchi",
      "QR Kod",
    ]);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE9E9E9" },
      };
      cell.font = { bold: true };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
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
        r.verifiedBy?.username || "-",
        r.approvedBy?.username || "-",
        "", // QR slot
      ]);

      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // Add QR Code if token exists
      if (r.verificationToken) {
        try {
          const qrBuffer = await this.verificationService.generateQRCodeBuffer(
            r.verificationToken,
          );
          const imageId = workbook.addImage({
            buffer: qrBuffer as any,
            extension: "png",
          });
          worksheet.addImage(imageId, {
            tl: { col: 12, row: row.number - 1 },
            ext: { width: 50, height: 50 },
          });
          row.height = 40; // Adjust row height for QR
        } catch (e) {
          console.error("Failed to add QR to excel", e);
        }
      }
    }

    // Footer Signatures
    const lastRow = worksheet.lastRow.number + 2;
    worksheet.getCell(`A${lastRow}`).value = "Mas'ul xodim:";
    worksheet.getCell(`C${lastRow}`).value = "____________________";
    worksheet.getCell(`A${lastRow + 1}`).value = "Bo'lim mudiri:";
    worksheet.getCell(`C${lastRow + 1}`).value = "____________________";

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Flu_Report_${startDate}.xlsx`,
    );

    await workbook.xlsx.write(res);
  }

  async exportHepatitisToExcel(
    res: Response,
    startDate: string,
    endDate: string,
    includeTest = false,
    user: User,
    districtId?: string,
  ) {
    const reports = await this.getHepatitisReports(
      startDate,
      endDate,
      includeTest,
      user,
      districtId,
    );

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Hepatitis Reports");

    // Title
    worksheet.mergeCells("A1:J1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = `Virusli Gepatit A bo'yicha kunlik hisobot (${startDate} - ${endDate})`;
    titleCell.font = { bold: true, size: 14 };
    titleCell.alignment = { horizontal: "center" };

    // Headers
    const headerRow = worksheet.addRow([
      "№",
      "Hudud",
      "Sana",
      "Holat",
      "Jami (VGA)",
      "1 yoshgacha",
      "1-3 yosh",
      "4-6 yosh",
      "7-14 yosh",
      "20+ yosh",
      "Tekshiruvchi",
      "Tasdiqlovchi",
      "QR Kod",
    ]);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE9E9E9" },
      };
      cell.font = { bold: true };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
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
        r.verifiedBy?.username || "-",
        r.approvedBy?.username || "-",
        "", // QR slot
      ]);

      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      if (r.verificationToken) {
        try {
          const qrBuffer = await this.verificationService.generateQRCodeBuffer(
            r.verificationToken,
          );
          const imageId = workbook.addImage({
            buffer: qrBuffer as any,
            extension: "png",
          });
          worksheet.addImage(imageId, {
            tl: { col: 12, row: row.number - 1 },
            ext: { width: 50, height: 50 },
          });
          row.height = 40;
        } catch (e) {
          console.error("Failed to add QR to excel", e);
        }
      }
    }

    // Footer Signatures
    const lastRow = worksheet.lastRow.number + 2;
    worksheet.getCell(`A${lastRow}`).value = "Mas'ul xodim:";
    worksheet.getCell(`C${lastRow}`).value = "____________________";
    worksheet.getCell(`A${lastRow + 1}`).value = "Bo'lim mudiri:";
    worksheet.getCell(`C${lastRow + 1}`).value = "____________________";

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Hepatitis_Report_${startDate}.xlsx`,
    );

    await workbook.xlsx.write(res);
  }

  async exportForm1ToExcel(
    res: Response,
    startDate: string,
    endDate: string,
    includeTest = false,
    user: User,
    districtId?: string,
  ) {
    const reports = await this.getForm1Reports(
      startDate,
      endDate,
      includeTest,
      user,
      districtId,
    );
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Form 1 Reports");

    // Determine years from start date (assuming monthly mostly)
    const currentYear = new Date(startDate).getFullYear();
    const prevYear = currentYear - 1;

    // Title
    worksheet.mergeCells("A1:Z1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = `Toshkent viloyatida yuqumli va parazitar kasalliklar to'g'risida ${currentYear} yil va 12 oylik uchun hisobot`;
    titleCell.font = { bold: true, size: 12, name: "Times New Roman" };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getRow(1).height = 30;

    // Style helper for merged cells
    const setStyle = (cellOrRange: string, fillHex?: string) => {
      const cell = worksheet.getCell(cellOrRange.split(":")[0]); // Top-left
      cell.font = { bold: true, name: "Times New Roman", size: 9 };
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      if (fillHex) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF" + fillHex.replace("#", "") },
        };
      }
    };

    // Row 2
    worksheet.mergeCells("A2:A4");
    setStyle("A2");
    worksheet.getCell("A2").value = "Ko'rsatkichlar nomi";
    worksheet.mergeCells("B2:B4");
    setStyle("B2");
    worksheet.getCell("B2").value = "Kod";

    // Row 2 Group
    worksheet.mergeCells("C2:N2");
    setStyle("C2");
    worksheet.getCell("C2").value = "Joriy oy";
    worksheet.mergeCells("O2:Z2");
    setStyle("O2");
    worksheet.getCell("O2").value = "Yil boshidan jami";

    // Row 3
    worksheet.mergeCells("C3:H3");
    setStyle("C3");
    worksheet.getCell("C3").value = "Jami";
    worksheet.mergeCells("I3:N3");
    setStyle("I3");
    worksheet.getCell("I3").value = "14 yoshgacha";
    worksheet.mergeCells("O3:T3");
    setStyle("O3");
    worksheet.getCell("O3").value = "Jami";
    worksheet.mergeCells("U3:Z3");
    setStyle("U3");
    worksheet.getCell("U3").value = "14 yoshgacha";

    // Row 4 (Years)
    worksheet.mergeCells("C4:D4");
    setStyle("C4", "b7eb8f");
    worksheet.getCell("C4").value = `${prevYear} yil`;
    worksheet.mergeCells("E4:F4");
    setStyle("E4", "fffb8f");
    worksheet.getCell("E4").value = `${currentYear} yil`;
    worksheet.mergeCells("G4:H4");
    setStyle("G4");
    worksheet.getCell("G4").value = "ko'tar/pasayish";

    worksheet.mergeCells("I4:J4");
    setStyle("I4", "b7eb8f");
    worksheet.getCell("I4").value = `${prevYear} yil`;
    worksheet.mergeCells("K4:L4");
    setStyle("K4", "fffb8f");
    worksheet.getCell("K4").value = `${currentYear} yil`;
    worksheet.mergeCells("M4:N4");
    setStyle("M4");
    worksheet.getCell("M4").value = "ko'tar/pasayish";

    worksheet.mergeCells("O4:P4");
    setStyle("O4", "b7eb8f");
    worksheet.getCell("O4").value = `${prevYear} yil`;
    worksheet.mergeCells("Q4:R4");
    setStyle("Q4", "fffb8f");
    worksheet.getCell("Q4").value = `${currentYear} yil`;
    worksheet.mergeCells("S4:T4");
    setStyle("S4");
    worksheet.getCell("S4").value = "ko'tar/pasayish";

    worksheet.mergeCells("U4:V4");
    setStyle("U4", "b7eb8f");
    worksheet.getCell("U4").value = `${prevYear} yil`;
    worksheet.mergeCells("W4:X4");
    setStyle("W4", "fffb8f");
    worksheet.getCell("W4").value = `${currentYear} yil`;
    worksheet.mergeCells("Y4:Z4");
    setStyle("Y4");
    worksheet.getCell("Y4").value = "ko'tar/pasayish";

    // Row 5 (Sub headers)
    const headerCols = [
      "abs.ko'r",
      "int.ko'r", // Monthly - Jami - Prev
      "abs.ko'r",
      "int.ko'r", // Monthly - Jami - Curr
      "abs.ko'r",
      "int.ko'r", // Monthly - Jami - Growth
      "abs.ko'r",
      "int.ko'r", // Monthly - U14 - Prev
      "abs.ko'r",
      "int.ko'r", // Monthly - U14 - Curr
      "abs.ko'r",
      "int.ko'r", // Monthly - U14 - Growth
      "abs.ko'r",
      "int.ko'r", // YTD - Jami - Prev
      "abs.ko'r",
      "int.ko'r", // YTD - Jami - Curr
      "abs.ko'r",
      "int.ko'r", // YTD - Jami - Growth
      "abs.ko'r",
      "int.ko'r", // YTD - U14 - Prev
      "abs.ko'r",
      "int.ko'r", // YTD - U14 - Curr
      "abs.ko'r",
      "int.ko'r", // YTD - U14 - Growth
    ];

    headerCols.forEach((val, idx) => {
      const cell = worksheet.getCell(5, 3 + idx);
      cell.value = val;
      cell.font = { bold: true, size: 8, name: "Times New Roman" };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };

      if ([0, 1, 6, 7, 12, 13, 18, 19].includes(idx)) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFb7eb8f" },
        };
      } else if ([2, 3, 8, 9, 14, 15, 20, 21].includes(idx)) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFfffb8f" },
        };
      }
    });

    // --- DATA FILLING ---
    // Fetch all diseases to ensure completeness
    const allDiseases = await this.diseasesService.findAll();

    // Aggregation Logic
    const aggregatedData: Record<string, any> = {};

    // Initialize with all diseases (zeros)
    allDiseases.forEach((d) => {
      aggregatedData[d.code] = {
        code: d.code,
        name: d.name,
        m_t_p_a: 0,
        m_t_p_i: 0,
        m_t_c_a: 0,
        m_t_c_i: 0,
        m_u_p_a: 0,
        m_u_p_i: 0,
        m_u_c_a: 0,
        m_u_c_i: 0,
        y_t_p_a: 0,
        y_t_p_i: 0,
        y_t_c_a: 0,
        y_t_c_i: 0,
        y_u_p_a: 0,
        y_u_p_i: 0,
        y_u_c_a: 0,
        y_u_c_i: 0,
      };
    });

    // Merge submission data
    reports.forEach((rep) => {
      rep.data.forEach((d: any) => {
        // If a new code appears (unlikely if master list is good), add it safely
        if (!aggregatedData[d.code]) {
          aggregatedData[d.code] = {
            code: d.code,
            name: d.name,
            m_t_p_a: 0,
            m_t_p_i: 0,
            m_t_c_a: 0,
            m_t_c_i: 0,
            m_u_p_a: 0,
            m_u_p_i: 0,
            m_u_c_a: 0,
            m_u_c_i: 0,
            y_t_p_a: 0,
            y_t_p_i: 0,
            y_t_c_a: 0,
            y_t_c_i: 0,
            y_u_p_a: 0,
            y_u_p_i: 0,
            y_u_c_a: 0,
            y_u_c_i: 0,
          };
        }
        const acc = aggregatedData[d.code];
        acc.m_t_p_a += Number(d.m_t_p_a) || 0;
        acc.m_t_p_i += Number(d.m_t_p_i) || 0;
        acc.m_t_c_a += Number(d.m_t_c_a) || 0;
        acc.m_t_c_i += Number(d.m_t_c_i) || 0;
        acc.m_u_p_a += Number(d.m_u_p_a) || 0;
        acc.m_u_p_i += Number(d.m_u_p_i) || 0;
        acc.m_u_c_a += Number(d.m_u_c_a) || 0;
        acc.m_u_c_i += Number(d.m_u_c_i) || 0;

        acc.y_t_p_a += Number(d.y_t_p_a) || 0;
        acc.y_t_p_i += Number(d.y_t_p_i) || 0;
        acc.y_t_c_a += Number(d.y_t_c_a) || 0;
        acc.y_t_c_i += Number(d.y_t_c_i) || 0;
        acc.y_u_p_a += Number(d.y_u_p_a) || 0;
        acc.y_u_p_i += Number(d.y_u_p_i) || 0;
        acc.y_u_c_a += Number(d.y_u_c_a) || 0;
        acc.y_u_c_i += Number(d.y_u_c_i) || 0;
      });
    });

    const sortedRows = Object.values(aggregatedData).sort(
      (a, b) => Number(a.code) - Number(b.code),
    );

    let rowIdx = 6;
    sortedRows.forEach((d) => {
      const row = worksheet.getRow(rowIdx);
      row.values = [
        d.name,
        d.code,
        // Monthly - Total
        d.m_t_p_a,
        d.m_t_p_i,
        d.m_t_c_a,
        d.m_t_c_i,
        d.m_t_c_a - d.m_t_p_a,
        0, // Growth (Abs, Placeholder for Int)
        // Monthly - U14
        d.m_u_p_a,
        d.m_u_p_i,
        d.m_u_c_a,
        d.m_u_c_i,
        d.m_u_c_a - d.m_u_p_a,
        0,
        // YTD - Total
        d.y_t_p_a,
        d.y_t_p_i,
        d.y_t_c_a,
        d.y_t_c_i,
        d.y_t_c_a - d.y_t_p_a,
        0,
        // YTD - U14
        d.y_u_p_a,
        d.y_u_p_i,
        d.y_u_c_a,
        d.y_u_c_i,
        d.y_u_c_a - d.y_u_p_a,
        0,
      ];
      row.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.font = { name: "Times New Roman", size: 9 };

        // Apply Column Colors (Green for Prev, Yellow for Curr)
        // Prev columns: 3, 4 (M-T), 9, 10 (M-U), 15, 16 (Y-T), 21, 22 (Y-U)
        if ([3, 4, 9, 10, 15, 16, 21, 22].includes(colNumber)) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFb7eb8f" },
          };
        }
        // Curr columns: 5, 6 (M-T), 11, 12 (M-U), 17, 18 (Y-T), 23, 24 (Y-U)
        if ([5, 6, 11, 12, 17, 18, 23, 24].includes(colNumber)) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFfffb8f" },
          };
        }
      });
      rowIdx++;
    });

    // Formatting columns width
    worksheet.getColumn(1).width = 40; // Name
    worksheet.getColumn(2).width = 10; // Code

    // --- SHEET 2: Tumanlar kesimida (List 2) ---
    const worksheet2 = workbook.addWorksheet("Tumanlar kesimida (List 2)");
    const orgs = await this.orgRepo.find({
      where: { parent: Not(IsNull()) },
      order: { name: "ASC" },
    });

    let currentRow = 1;
    sortedRows.forEach((diseaseObj: any) => {
      const { code, name: dName } = diseaseObj;

      // Disease Block Header
      worksheet2.mergeCells(`A${currentRow}:Z${currentRow}`);
      const dTitleCell = worksheet2.getCell(`A${currentRow}`);
      dTitleCell.value = dName;
      dTitleCell.font = { bold: true, size: 11, name: "Times New Roman" };
      dTitleCell.alignment = { horizontal: "center", vertical: "middle" };
      worksheet2.getRow(currentRow).height = 20;

      const setStyle2 = (cellOrRange: string, fillHex?: string) => {
        const cell = worksheet2.getCell(cellOrRange.split(":")[0]);
        cell.font = { bold: true, name: "Times New Roman", size: 9 };
        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: true,
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        if (fillHex) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF" + fillHex.replace("#", "") },
          };
        }
      };

      currentRow++;
      worksheet2.mergeCells(`A${currentRow}:A${currentRow + 3}`);
      setStyle2(`A${currentRow}`);
      worksheet2.getCell(`A${currentRow}`).value =
        "Administrativnye territorii";
      worksheet2.mergeCells(`B${currentRow}:B${currentRow + 3}`);
      setStyle2(`B${currentRow}`);
      worksheet2.getCell(`B${currentRow}`).value = `Stroka ${code}`;

      worksheet2.mergeCells(`C${currentRow}:N${currentRow}`);
      setStyle2(`C${currentRow}`);
      worksheet2.getCell(`C${currentRow}`).value = "tekushiy oy (joriy oy)";
      worksheet2.mergeCells(`O${currentRow}:Z${currentRow}`);
      setStyle2(`O${currentRow}`);
      worksheet2.getCell(`O${currentRow}`).value =
        "narastayushiy itog (yil boshidan)";

      currentRow++;
      worksheet2.mergeCells(`C${currentRow}:H${currentRow}`);
      setStyle2(`C${currentRow}`);
      worksheet2.getCell(`C${currentRow}`).value = "Jami";
      worksheet2.mergeCells(`I${currentRow}:N${currentRow}`);
      setStyle2(`I${currentRow}`);
      worksheet2.getCell(`I${currentRow}`).value = "deti do 14 let (bolalar)";
      worksheet2.mergeCells(`O${currentRow}:T${currentRow}`);
      setStyle2(`O${currentRow}`);
      worksheet2.getCell(`O${currentRow}`).value = "Jami";
      worksheet2.mergeCells(`U${currentRow}:Z${currentRow}`);
      setStyle2(`U${currentRow}`);
      worksheet2.getCell(`U${currentRow}`).value = "deti do 14 let (bolalar)";

      currentRow++;
      const years = [
        prevYear,
        currentYear,
        prevYear,
        currentYear,
        prevYear,
        currentYear,
        prevYear,
        currentYear,
      ];
      const startCols = [3, 5, 9, 11, 15, 17, 21, 23];
      years.forEach((y, i) => {
        const col = startCols[i];
        const isCurr = i % 2 !== 0;
        worksheet2.mergeCells(currentRow, col, currentRow, col + 1);
        setStyle2(
          worksheet2.getCell(currentRow, col).address,
          isCurr ? "fffb8f" : "b7eb8f",
        );
        worksheet2.getCell(currentRow, col).value = `${y} yil`;
      });
      [7, 13, 19, 25].forEach((col) => {
        worksheet2.mergeCells(currentRow, col, currentRow, col + 1);
        setStyle2(worksheet2.getCell(currentRow, col).address);
        worksheet2.getCell(currentRow, col).value = "ko'tar/pasayish";
      });

      currentRow++;
      headerCols.forEach((val, idx) => {
        const cell = worksheet2.getCell(currentRow, 3 + idx);
        cell.value = val;
        cell.font = { bold: true, size: 8, name: "Times New Roman" };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        if ([0, 1, 6, 7, 12, 13, 18, 19].includes(idx)) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFb7eb8f" },
          };
        } else if ([2, 3, 8, 9, 14, 15, 20, 21].includes(idx)) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFfffb8f" },
          };
        }
      });

      currentRow++;
      // Data rows for each organization
      orgs.forEach((org) => {
        const row = worksheet2.getRow(currentRow);
        const sub = reports.find((r) => r.organization?.id === org.id);
        const d = sub?.data.find((x: any) => x.code === code) || {};

        row.values = [
          org.name,
          code,
          d.m_t_p_a || 0,
          d.m_t_p_i || 0,
          d.m_t_c_a || 0,
          d.m_t_c_i || 0,
          (d.m_t_c_a || 0) - (d.m_t_p_a || 0),
          0,
          d.m_u_p_a || 0,
          d.m_u_p_i || 0,
          d.m_u_c_a || 0,
          d.m_u_c_i || 0,
          (d.m_u_c_a || 0) - (d.m_u_p_a || 0),
          0,
          d.y_t_p_a || 0,
          d.y_t_p_i || 0,
          d.y_t_c_a || 0,
          d.y_t_c_i || 0,
          (d.y_t_c_a || 0) - (d.y_t_p_a || 0),
          0,
          d.y_u_p_a || 0,
          d.y_u_p_i || 0,
          d.y_u_c_a || 0,
          d.y_u_c_i || 0,
          (d.y_u_c_a || 0) - (d.y_u_p_a || 0),
          0,
        ];

        row.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
          cell.font = { name: "Times New Roman", size: 9 };
          if ([3, 4, 9, 10, 15, 16, 21, 22].includes(colNumber))
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFb7eb8f" },
            };
          if ([5, 6, 11, 12, 17, 18, 23, 24].includes(colNumber))
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFfffb8f" },
            };
        });
        currentRow++;
      });

      currentRow++; // Spacer row between diseases
    });
    worksheet2.getColumn(1).width = 40;
    worksheet2.getColumn(2).width = 10;

    // --- SHEET 3: Matrix (List 3) ---
    const worksheet3 = workbook.addWorksheet("Matrix (List 3)");
    const majorCodes = ["101", "106", "108", "136", "140", "145", "148", "162"];
    const majorDiseases = allDiseases
      .filter((d) => majorCodes.includes(d.code))
      .sort((a, b) => majorCodes.indexOf(a.code) - majorCodes.indexOf(b.code));

    // Matrix Headers
    worksheet3.mergeCells("A1:A3");
    const hCell = worksheet3.getCell("A1");
    hCell.value = "Hududlar";
    hCell.font = { bold: true, name: "Times New Roman", size: 10 };
    hCell.alignment = { horizontal: "center", vertical: "middle" };
    hCell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    majorDiseases.forEach((d, i) => {
      const startCol = 2 + i * 2;
      // Row 1: Name
      worksheet3.mergeCells(1, startCol, 1, startCol + 1);
      const nameCell = worksheet3.getCell(1, startCol);
      nameCell.value = d.name;
      nameCell.font = { bold: true, name: "Times New Roman", size: 9 };
      nameCell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
      nameCell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };

      // Row 2: Code
      worksheet3.mergeCells(2, startCol, 2, startCol + 1);
      const codeCell = worksheet3.getCell(2, startCol);
      codeCell.value = `Kod ${d.code}`;
      codeCell.font = { bold: true, name: "Times New Roman", size: 9 };
      codeCell.alignment = { horizontal: "center", vertical: "middle" };
      codeCell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };

      // Row 3: abs/int
      ["abs.ko'r", "int.ko'r"].forEach((val, idx) => {
        const cell = worksheet3.getCell(3, startCol + idx);
        cell.value = val;
        cell.font = { bold: true, name: "Times New Roman", size: 8 };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // Matrix Data
    orgs.forEach((org, orgIdx) => {
      const row = worksheet3.getRow(4 + orgIdx);
      row.getCell(1).value = org.name;
      row.getCell(1).border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      row.getCell(1).font = { name: "Times New Roman", size: 9 };

      majorDiseases.forEach((d, dIdx) => {
        const startCol = 2 + dIdx * 2;
        const sub = reports.find((r) => r.organization?.id === org.id);
        const diseaseData = sub?.data.find((x: any) => x.code === d.code) || {};

        [diseaseData.m_t_c_a || 0, diseaseData.m_t_c_i || 0].forEach(
          (val, vIdx) => {
            const cell = row.getCell(startCol + vIdx);
            cell.value = val;
            cell.border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            };
            cell.font = { name: "Times New Roman", size: 9 };
          },
        );
      });
    });

    worksheet3.getColumn(1).width = 30;
    majorDiseases.forEach((_, i) => {
      worksheet3.getColumn(2 + i * 2).width = 10;
      worksheet3.getColumn(3 + i * 2).width = 10;
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Form1_Report_${startDate}.xlsx`,
    );
    await workbook.xlsx.write(res);
  }
}
