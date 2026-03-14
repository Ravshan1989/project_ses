import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, FindOptionsWhere } from "typeorm";
import { Cron } from "@nestjs/schedule";
import { HepatitisDailyReport } from "./entities/hepatitis-daily-report.entity";
import { CreateHepatitisReportDto } from "./dto/create-report.dto";
import { FluDailyReport } from "./entities/flu-daily-report.entity";
import { CreateFluReportDto } from "./dto/create-flu-report.dto";
import { AriDailyReport } from "./entities/ari-daily-report.entity";
import { CreateAriReportDto } from "./dto/create-ari-report.dto";
import { EpidemiologyDailyReport } from "./entities/epidemiology-daily-report.entity";
import { CreateEpidemiologyReportDto } from "./dto/create-epidemiology-report.dto";
import { CovidDailyReport } from "./entities/covid-daily-report.entity";
import { CreateCovidReportDto } from "./dto/create-covid-report.dto";
import { DiarrheaDailyReport } from "./entities/diarrhea-daily-report.entity";
import { CreateDiarrheaReportDto } from "./dto/create-diarrhea-report.dto";
import { SanitaryDailyReport } from "./entities/sanitary-daily-report.entity";
import { CreateSanitaryReportDto } from "./dto/create-sanitary-report.dto";
import { ReportStatus } from "../../common/enums/report-status.enum";
import { Organization } from "../organizations/entities/organization.entity";
import { User } from "../users/entities/user.entity";
import { getRoleLevel } from "../../common/utils/role.util";
import { TelegramService } from "../telegram/telegram.service";
import { SubmissionsService } from "../submissions/submissions.service";
import { ExportsService } from "../exports/exports.service";
import { FieldInspectionType } from "../submissions/entities/field-inspection.entity";

@Injectable()
export class DailyReportsService {
  constructor(
    @InjectRepository(HepatitisDailyReport)
    private reportRepo: Repository<HepatitisDailyReport>,
    @InjectRepository(FluDailyReport)
    private fluRepo: Repository<FluDailyReport>,
    @InjectRepository(AriDailyReport)
    private ariRepo: Repository<AriDailyReport>,
    @InjectRepository(EpidemiologyDailyReport)
    private epiRepo: Repository<EpidemiologyDailyReport>,
    @InjectRepository(CovidDailyReport)
    private covidRepo: Repository<CovidDailyReport>,
    @InjectRepository(DiarrheaDailyReport)
    private diarrheaRepo: Repository<DiarrheaDailyReport>,
    @InjectRepository(SanitaryDailyReport)
    private sanitaryRepo: Repository<SanitaryDailyReport>,
    @InjectRepository(Organization)
    private orgRepo: Repository<Organization>,
    @Inject(forwardRef(() => TelegramService))
    private telegramService: TelegramService,
    @Inject(forwardRef(() => SubmissionsService))
    private submissionsService: SubmissionsService,
    @Inject(forwardRef(() => ExportsService))
    private exportsService: ExportsService,
  ) { }

  @Cron("0 20 * * *") // Every day at 20:00
  async handleDailyCron() {
    console.log("[DailyReportsService] Running cron job at 20:00...");
    await this.generateAutomatedDailyReport();
  }

  async generateAutomatedDailyReport() {
    const todayStr = new Date().toISOString().split("T")[0];

    // 1. Fetch data for today
    const fieldInspections = await this.submissionsService.findFieldInspections(
      { startDate: todayStr, endDate: todayStr },
      { role: "ADMIN", organization: null } as any
    );

    // 2. Calculate Stats
    const totalReports = fieldInspections.length;
    const schools = fieldInspections.filter(i => i.type === FieldInspectionType.SCHOOL).length;
    const kindergartens = fieldInspections.filter(i => i.type === FieldInspectionType.KINDERGARTEN).length;
    const problems = fieldInspections.filter(i => i.type === FieldInspectionType.PROBLEM).length;

    // District ranking logic
    const districtStats = {};
    fieldInspections.forEach(i => {
      const d = i.districtName || "Noma'lum";
      districtStats[d] = (districtStats[d] || 0) + 1;
    });

    const summaryText = `📅 *Kunlik Tezkor Xulosa (${todayStr})*\n\n` +
      `📊 *Umumiy statistika:*\n` +
      `✅ Jami hisobotlar: ${totalReports}\n` +
      `🏫 Maktablar: ${schools}\n` +
      `🎈 Bog'chalar: ${kindergartens}\n` +
      `⚠️ Aniqlangan muammolar: ${problems}\n\n` +
      `🏢 *Tumanlar faolligi:*\n` +
      Object.entries(districtStats)
        .sort((a: any, b: any) => b[1] - a[1])
        .map(([name, count]) => `📍 ${name}: ${count} ta`)
        .join("\n");

    try {
      // 3. Generate Files
      // Note: We'll need to implement these methods in ExportsService
      const pdfPath = await this.exportsService.generateDailySummaryPdf(todayStr, {
        totalReports, schools, kindergartens, problems, districtStats
      });
      const excelPath = await this.exportsService.generateDailySummaryExcel(todayStr, {
        totalReports, schools, kindergartens, problems, districtStats
      });

      // 4. Send to Telegram
      // UZ: Bot faqat ro'yxatga olish uchun qoldirilgan, hisobot xabarnomalari o'chirildi
      // await this.telegramService.sendDailyReportWithFiles(summaryText, pdfPath, excelPath);

      console.log("[DailyReportsService] Automated report generated successfully.");
    } catch (error) {
      console.error("[DailyReportsService] Error generating automated report:", error);
    }
  }

  private validateIsolation(user: User, organizationId: string) {
    if (!user || !user.organization) return; // Should not happen with JwtGuard

    const level = getRoleLevel(user.role, user);
    if (level === 3) {
      if (user.organization.id !== organizationId) {
        throw new Error(
          "Siz faqat o'z tashkilotingiz uchun ma'lumot kiritishingiz mumkin.",
        );
      }
    } else if (level === 2) {
      // Viloyat: faqat o'ziga tegishli tumanlar (agar kerak bo'lsa implement qilinadi)
    }
  }

  private validateStatus(report: any) {
    if (!report) return;
    if (
      report.status === ReportStatus.VERIFIED ||
      report.status === ReportStatus.APPROVED
    ) {
      throw new Error(
        "Tasdiqlangan hisobotni o'zgartirib bo'lmaydi. Faqat Mudir yoki Boshliq rad etganidan keyin tahrirlash mumkin.",
      );
    }
  }

  async upsert(dto: CreateHepatitisReportDto, user: User) {
    this.validateIsolation(user, dto.organizationId);
    let report = await this.reportRepo.findOne({
      where: {
        reportDate: dto.reportDate,
        organization: { id: dto.organizationId },
        isTest: dto.isTest || false, // UZ: Test ma'lumoti ekanligini tekshiradi
      },
    });

    if (report) {
      this.validateStatus(report);
      Object.assign(report, dto);
    } else {
      report = this.reportRepo.create({
        ...dto,
        organization: { id: dto.organizationId },
        isTest: dto.isTest || false,
      });
    }
    const saved = await this.reportRepo.save(report);
    // UZ: Bot faqat ro'yxatga olish uchun qoldirilgan
    return saved;
  }

  /*
  async getByDate(date: string) {
    return this.reportRepo.find({
      where: { reportDate: date },
      relations: ["organization", "organization.parent"],
    });
  }
  */

  async getByDate(date: string, user: User, includeTest = false) {
    const level = getRoleLevel(user.role, user);
    const where: FindOptionsWhere<HepatitisDailyReport> = {
      reportDate: date,
      isTest: includeTest, // UZ: Test yoki Real ma'lumotni tanlash
    };

    // Level 2 (Viloyat): O'z viloyatiga qarashli
    if (level === 2) {
      if (!user.organization) return [];
      where.organization = { parent: { id: user.organization.id } };
    }
    // Level 3 (Tuman): O'z tumaniga qarashli
    else if (level === 3) {
      if (!user.organization) return [];
      where.organization = { id: user.organization.id };
    }

    return this.reportRepo.find({
      where,
      relations: ["organization", "organization.parent"],
    });
  }

  async upsertFlu(dto: CreateFluReportDto, user: User) {
    this.validateIsolation(user, dto.organizationId);
    let report = await this.fluRepo.findOne({
      where: {
        reportDate: dto.reportDate,
        organization: { id: dto.organizationId },
        isTest: dto.isTest || false,
      },
    });

    if (report) {
      this.validateStatus(report);
      Object.assign(report, dto);
    } else {
      report = this.fluRepo.create({
        ...dto,
        organization: { id: dto.organizationId },
        isTest: dto.isTest || false,
      });
    }
    const saved = await this.reportRepo.save(report);
    // UZ: Bot faqat ro'yxatga olish uchun qoldirilgan
    return saved;
  }

  /*
  async getFluByDate(date: string) {
    return this.fluRepo.find({
      where: { reportDate: date },
      relations: ["organization", "organization.parent"],
    });
  }
  */

  async getFluByDate(date: string, user: User, includeTest = false) {
    const level = getRoleLevel(user.role, user);
    const where: FindOptionsWhere<FluDailyReport> = {
      reportDate: date,
      isTest: includeTest,
    };

    if (level === 2) {
      if (!user.organization) return [];
      where.organization = { parent: { id: user.organization.id } };
    } else if (level === 3) {
      if (!user.organization) return [];
      where.organization = { id: user.organization.id };
    }

    return this.fluRepo.find({
      where,
      relations: ["organization", "organization.parent"],
    });
  }

  async upsertAri(dto: CreateAriReportDto, user: User) {
    this.validateIsolation(user, dto.organizationId);
    let report = await this.ariRepo.findOne({
      where: {
        reportDate: dto.reportDate,
        organization: { id: dto.organizationId },
        isTest: dto.isTest || false,
      },
    });

    if (report) {
      this.validateStatus(report);
      Object.assign(report, dto);
    } else {
      report = this.ariRepo.create({
        ...dto,
        organization: { id: dto.organizationId },
        isTest: dto.isTest || false,
      });
    }
    const saved = await this.ariRepo.save(report);
    // UZ: Bot faqat ro'yxatga olish uchun qoldirilgan
    return saved;
  }

  /*
  async getAriByDate(date: string) {
    return this.ariRepo.find({
      where: { reportDate: date },
      relations: ["organization", "organization.parent"],
    });
  }
  */

  async getAriByDate(date: string, user: User, includeTest = false) {
    const level = getRoleLevel(user.role, user);
    const where: FindOptionsWhere<AriDailyReport> = {
      reportDate: date,
      isTest: includeTest,
    };

    if (level === 2) {
      if (!user.organization) return [];
      where.organization = { parent: { id: user.organization.id } };
    } else if (level === 3) {
      if (!user.organization) return [];
      where.organization = { id: user.organization.id };
    }

    return this.ariRepo.find({
      where,
      relations: ["organization", "organization.parent"],
    });
  }

  async upsertEpidemiology(dto: CreateEpidemiologyReportDto, user: User) {
    this.validateIsolation(user, dto.organizationId);
    let report = await this.epiRepo.findOne({
      where: {
        reportDate: dto.reportDate,
        organization: { id: dto.organizationId },
        isTest: dto.isTest || false,
      },
    });

    if (report) {
      this.validateStatus(report);
      Object.assign(report, dto);
    } else {
      report = this.epiRepo.create({
        ...dto,
        organization: { id: dto.organizationId },
        isTest: dto.isTest || false,
      });
    }
    const saved = await this.epiRepo.save(report);
    // UZ: Bot faqat ro'yxatga olish uchun qoldirilgan
    return saved;
  }

  /*
  async getEpidemiologyByDate(date: string) {
    return this.epiRepo.find({
      where: { reportDate: date },
      relations: ["organization", "organization.parent"],
    });
  }
  */

  async getEpidemiologyByDate(date: string, user: User, includeTest = false) {
    const level = getRoleLevel(user.role, user);
    const where: FindOptionsWhere<EpidemiologyDailyReport> = {
      reportDate: date,
      isTest: includeTest,
    };

    if (level === 2) {
      if (!user.organization) return [];
      where.organization = { parent: { id: user.organization.id } };
    } else if (level === 3) {
      if (!user.organization) return [];
      where.organization = { id: user.organization.id };
    }

    return this.epiRepo.find({
      where,
      relations: ["organization", "organization.parent"],
    });
  }

  /*
    ESKI KOD (Haftalik xulosada viloyat darajasini ham qo'shib yuborishi mumkin edi):
    async getWeeklySummary(startDate: string, endDate: string) {
        const qb = this.fluRepo.createQueryBuilder('report')
            .leftJoin('report.organization', 'organization')
            .select([
                'organization.id AS organization_id',
                'organization.name AS organization_name',
                'organization.parent_id AS parent_id'
            ])
            .addSelect('SUM(report.ari_total)', 'ari_total')
            ... (va hokazo)
            .where('report.reportDate BETWEEN :startDate AND :endDate', { startDate, endDate })
            .groupBy('organization.id')
            .addGroupBy('organization.name')
            .addGroupBy('organization.parent_id');
        ...
    }
    */

  // YANGI YECHIM (Barcha tumanlarni chiqarish uchun Organization dan boshlaymiz):
  async getWeeklySummary(
    startDate: string,
    endDate: string,
    user: User,
    includeTest = false,
  ) {
    const qb = this.orgRepo
      .createQueryBuilder("organization")
      .leftJoin("organization.parent", "parent")
      .leftJoin(
        "organization.flu_reports",
        "report",
        "report.reportDate BETWEEN :startDate AND :endDate AND report.isTest = :includeTest",
        {
          startDate,
          endDate,
          includeTest,
        },
      )
      .select([
        "organization.id AS organization_id",
        "organization.name AS organization_name",
        "organization.parent_id AS parent_id",
      ])
      .addSelect("SUM(COALESCE(report.ari_total, 0))", "ari_total")
      .addSelect("SUM(COALESCE(report.ari_0_1, 0))", "ari_0_1")
      .addSelect("SUM(COALESCE(report.ari_1_2, 0))", "ari_1_2")
      .addSelect("SUM(COALESCE(report.ari_3_6, 0))", "ari_3_6")
      .addSelect("SUM(COALESCE(report.ari_7_14, 0))", "ari_7_14")
      .addSelect("SUM(COALESCE(report.ari_adult, 0))", "ari_adult")
      .addSelect("SUM(COALESCE(report.ari_students, 0))", "ari_students")
      .addSelect("SUM(COALESCE(report.ari_nursery, 0))", "ari_nursery")
      .addSelect("SUM(COALESCE(report.pneu_total, 0))", "pneu_total")
      .addSelect("SUM(COALESCE(report.pneu_0_2, 0))", "pneu_0_2")
      .addSelect("SUM(COALESCE(report.pneu_3_6, 0))", "pneu_3_6")
      .addSelect("SUM(COALESCE(report.pneu_7_14, 0))", "pneu_7_14")
      .addSelect("SUM(COALESCE(report.pneu_adult, 0))", "pneu_adult")
      .addSelect("SUM(COALESCE(report.pneu_students, 0))", "pneu_students")
      .addSelect("SUM(COALESCE(report.pneu_nursery, 0))", "pneu_nursery")
      .addSelect("SUM(COALESCE(report.flu_total, 0))", "flu_total")
      .addSelect("SUM(COALESCE(report.flu_0_1, 0))", "flu_0_1")
      .addSelect("SUM(COALESCE(report.flu_1_2, 0))", "flu_1_2")
      .addSelect("SUM(COALESCE(report.flu_3_6, 0))", "flu_3_6")
      .addSelect("SUM(COALESCE(report.flu_7_14, 0))", "flu_7_14")
      .addSelect("SUM(COALESCE(report.flu_adult, 0))", "flu_adult")
      .addSelect("SUM(COALESCE(report.flu_students, 0))", "flu_students")
      .addSelect("SUM(COALESCE(report.flu_nursery, 0))", "flu_nursery")
      .addSelect("SUM(COALESCE(report.sari_total, 0))", "sari_total")
      .addSelect("SUM(COALESCE(report.sari_0_2, 0))", "sari_0_2")
      .addSelect("SUM(COALESCE(report.sari_3_6, 0))", "sari_3_6")
      .addSelect("SUM(COALESCE(report.sari_7_14, 0))", "sari_7_14")
      .addSelect("SUM(COALESCE(report.sari_adult, 0))", "sari_adult")
      .addSelect("SUM(COALESCE(report.death_total, 0))", "death_total")
      .addSelect("SUM(COALESCE(report.death_pregnant, 0))", "death_pregnant");

    // UZ: Role Level bo'yicha filtr (Qo'shimcha tekshiruv)
    const level = getRoleLevel(user.role, user);
    if (level === 2) {
      if (!user.organization) return [];
      qb.andWhere("organization.parent_id = :orgId", {
        orgId: user.organization.id,
      });
    } else if (level === 3) {
      // UZ: Faqat o'z tashkilotini ko'rsatish (qolganlarni umuman ko'rsatmaslik)
      if (!user.organization) return [];
      qb.andWhere("organization.id = :orgId", { orgId: user.organization.id });
    } else {
      // ADMIN or others: skip the top-level 'Toshkent viloyati'
      qb.andWhere("organization.name NOT ILIKE '%Toshkent viloyati%'");
    }

    qb.groupBy("organization.id")
      .addGroupBy("organization.name")
      .addGroupBy("organization.parent_id")
      .orderBy("organization.name", "ASC");

    const rawResults = await qb.getRawMany();

    return rawResults.map((raw) => ({
      organization: {
        id: raw.organization_id,
        name: raw.organization_name,
        parent: raw.parent_id ? { id: raw.parent_id } : null,
      },
      ari_total: Number(raw.ari_total),
      ari_0_1: Number(raw.ari_0_1),
      ari_1_2: Number(raw.ari_1_2),
      ari_3_6: Number(raw.ari_3_6),
      ari_7_14: Number(raw.ari_7_14),
      ari_adult: Number(raw.ari_adult),
      ari_students: Number(raw.ari_students),
      ari_nursery: Number(raw.ari_nursery),
      pneu_total: Number(raw.pneu_total),
      pneu_0_2: Number(raw.pneu_0_2),
      pneu_3_6: Number(raw.pneu_3_6),
      pneu_7_14: Number(raw.pneu_7_14),
      pneu_adult: Number(raw.pneu_adult),
      pneu_students: Number(raw.pneu_students),
      pneu_nursery: Number(raw.pneu_nursery),
      flu_total: Number(raw.flu_total),
      flu_0_1: Number(raw.flu_0_1),
      flu_1_2: Number(raw.flu_1_2),
      flu_3_6: Number(raw.flu_3_6),
      flu_7_14: Number(raw.flu_7_14),
      flu_adult: Number(raw.flu_adult),
      flu_students: Number(raw.flu_students),
      flu_nursery: Number(raw.flu_nursery),
      sari_total: Number(raw.sari_total),
      sari_0_2: Number(raw.sari_0_2),
      sari_3_6: Number(raw.sari_3_6),
      sari_7_14: Number(raw.sari_7_14),
      sari_adult: Number(raw.sari_adult),
      death_total: Number(raw.death_total),
      death_pregnant: Number(raw.death_pregnant),
    }));
  }

  async upsertCovid(dto: CreateCovidReportDto, user: User) {
    const report = await this.covidRepo.findOne({
      where: {
        reportDate: dto.reportDate,
        organization: { id: dto.organizationId },
        isTest: !!dto.isTest,
      },
    });
    if (report) {
      Object.assign(report, dto);
      return this.covidRepo.save(report);
    }
    const newReport = this.covidRepo.create({
      ...dto,
      organization: { id: dto.organizationId },
      isTest: !!dto.isTest,
    });
    return this.covidRepo.save(newReport);
  }

  async upsertDiarrhea(dto: CreateDiarrheaReportDto, user: User) {
    const report = await this.diarrheaRepo.findOne({
      where: {
        reportDate: dto.reportDate,
        organization: { id: dto.organizationId },
        isTest: !!dto.isTest,
      },
    });
    if (report) {
      Object.assign(report, dto);
      return this.diarrheaRepo.save(report);
    }
    const newReport = this.diarrheaRepo.create({
      ...dto,
      organization: { id: dto.organizationId },
      isTest: !!dto.isTest,
    });
    return this.diarrheaRepo.save(newReport);
  }

  async getCovidByDate(date: string, user: User, includeTest = false) {
    const level = getRoleLevel(user.role, user);
    const where: FindOptionsWhere<CovidDailyReport> = {
      reportDate: date,
      isTest: includeTest,
    };

    if (level === 2) {
      if (!user.organization) return [];
      where.organization = { parent: { id: user.organization.id } };
    } else if (level === 3) {
      if (!user.organization) return [];
      where.organization = { id: user.organization.id };
    }

    return this.covidRepo.find({
      where,
      relations: ["organization", "organization.parent"],
    });
  }

  async getDiarrheaByDate(date: string, user: User, includeTest = false) {
    const level = getRoleLevel(user.role, user);
    const where: FindOptionsWhere<DiarrheaDailyReport> = {
      reportDate: date,
      isTest: includeTest,
    };

    if (level === 2) {
      if (!user.organization) return [];
      where.organization = { parent: { id: user.organization.id } };
    } else if (level === 3) {
      if (!user.organization) return [];
      where.organization = { id: user.organization.id };
    }

    return this.diarrheaRepo.find({
      where,
      relations: ["organization", "organization.parent"],
    });
  }

  async upsertSanitary(dto: CreateSanitaryReportDto, user: User) {
    this.validateIsolation(user, dto.organizationId);
    let report = await this.sanitaryRepo.findOne({
      where: {
        reportDate: dto.reportDate,
        organization: { id: dto.organizationId },
        isTest: dto.isTest || false,
      },
    });

    if (report) {
      this.validateStatus(report);
      Object.assign(report, dto);
    } else {
      report = this.sanitaryRepo.create({
        ...dto,
        organization: { id: dto.organizationId },
        isTest: dto.isTest || false,
      });
    }
    const saved = await this.sanitaryRepo.save(report);
    // UZ: Bot faqat ro'yxatga olish uchun qoldirilgan
    return saved;
  }

  async getSanitaryByDate(date: string, user: User, includeTest = false) {
    const level = getRoleLevel(user.role, user);
    const where: FindOptionsWhere<SanitaryDailyReport> = {
      reportDate: date,
      isTest: includeTest,
    };

    if (level === 2) {
      if (!user.organization) return [];
      where.organization = { parent: { id: user.organization.id } };
    } else if (level === 3) {
      if (!user.organization) return [];
      where.organization = { id: user.organization.id };
    }

    return this.sanitaryRepo.find({
      where,
      relations: ["organization", "organization.parent"],
    });
  }

  async cleanupTest() {
    await this.reportRepo.delete({});
    await this.fluRepo.delete({});
    await this.ariRepo.delete({});
    await this.epiRepo.delete({});
    await this.covidRepo.delete({});
    await this.diarrheaRepo.delete({});
    await this.sanitaryRepo.delete({});
    await this.reportRepo.manager.query("DELETE FROM submissions");
    return {
      success: true,
      message: "Barcha ma'lumotlar muvaffaqiyatli o'chirildi (Full Wipe)",
    };
  }

  async getMonthlyAggregation(
    month: string,
    organizationId: string,
    isTest: boolean,
  ) {
    const start = new Date(month);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);

    const startDate = start.toISOString().split("T")[0];
    const endDate = end.toISOString().split("T")[0];

    const hepatitis = await this.reportRepo
      .createQueryBuilder("r")
      .select("SUM(r.total_cases)", "total")
      .addSelect(
        "SUM(r.age_under_1 + r.age_1_3 + r.age_4_6 + r.age_7_14)",
        "under14",
      )
      .where("r.organizationId = :organizationId", { organizationId })
      .andWhere("r.reportDate BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .andWhere("r.isTest = :isTest", { isTest })
      .getRawOne();

    const flu = await this.fluRepo
      .createQueryBuilder("r")
      .select("SUM(r.flu_total)", "flu")
      .addSelect("SUM(r.ari_total)", "ari")
      .addSelect(
        "SUM(r.flu_0_1 + r.flu_1_2 + r.flu_3_6 + r.flu_7_14)",
        "fluUnder14",
      )
      .addSelect(
        "SUM(r.ari_0_1 + r.ari_1_2 + r.ari_3_6 + r.ari_7_14)",
        "ariUnder14",
      )
      .where("r.organizationId = :organizationId", { organizationId })
      .andWhere("r.reportDate BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .andWhere("r.isTest = :isTest", { isTest })
      .getRawOne();

    const covid = await this.covidRepo
      .createQueryBuilder("r")
      .select("SUM(r.total_cases)", "total")
      .where("r.organizationId = :organizationId", { organizationId })
      .andWhere("r.reportDate BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .andWhere("r.isTest = :isTest", { isTest })
      .getRawOne();

    return {
      hepatitis: {
        total: Number(hepatitis?.total || 0),
        under14: Number(hepatitis?.under14 || 0),
      },
      flu: {
        total: Number(flu?.flu || 0),
        under14: Number(flu?.fluUnder14 || 0),
      },
      ari: {
        total: Number(flu?.ari || 0),
        under14: Number(flu?.ariUnder14 || 0),
      },
      covid: {
        total: Number(covid?.total || 0),
        under14: 0,
      },
    };
  }

  async bulkUpsertBatch(
    payload: {
      hepatitis?: any[];
      flu?: any[];
      ari?: any[];
      epi?: any[];
      covid?: any[];
      diarrhea?: any[];
      reportDate: string;
      isTest: boolean;
    },
    user: User,
  ) {
    const { reportDate, isTest } = payload;

    return await this.reportRepo.manager.transaction(async (manager) => {
      // 1. Hepatitis
      if (payload.hepatitis?.length) {
        for (const data of payload.hepatitis) {
          this.validateIsolation(user, data.organizationId);
          let report = await manager.findOne(HepatitisDailyReport, {
            where: {
              reportDate,
              organization: { id: data.organizationId },
              isTest,
            },
          });
          if (report) Object.assign(report, data);
          else
            report = manager.create(HepatitisDailyReport, {
              ...data,
              reportDate,
              isTest,
              organization: { id: data.organizationId },
            });
          await manager.save(report);
        }
      }

      // 2. Flu
      if (payload.flu?.length) {
        for (const data of payload.flu) {
          this.validateIsolation(user, data.organizationId);
          let report = await manager.findOne(FluDailyReport, {
            where: {
              reportDate,
              organization: { id: data.organizationId },
              isTest,
            },
          });
          if (report) Object.assign(report, data);
          else
            report = manager.create(FluDailyReport, {
              ...data,
              reportDate,
              isTest,
              organization: { id: data.organizationId },
            });
          await manager.save(report);
        }
      }

      // 3. Ari
      if (payload.ari?.length) {
        for (const data of payload.ari) {
          this.validateIsolation(user, data.organizationId);
          let report = await manager.findOne(AriDailyReport, {
            where: {
              reportDate,
              organization: { id: data.organizationId },
              isTest,
            },
          });
          if (report) Object.assign(report, data);
          else
            report = manager.create(AriDailyReport, {
              ...data,
              reportDate,
              isTest,
              organization: { id: data.organizationId },
            });
          await manager.save(report);
        }
      }

      // 4. Epi
      if (payload.epi?.length) {
        for (const data of payload.epi) {
          this.validateIsolation(user, data.organizationId);
          let report = await manager.findOne(EpidemiologyDailyReport, {
            where: {
              reportDate,
              organization: { id: data.organizationId },
              isTest,
            },
          });
          if (report) Object.assign(report, data);
          else
            report = manager.create(EpidemiologyDailyReport, {
              ...data,
              reportDate,
              isTest,
              organization: { id: data.organizationId },
            });
          await manager.save(report);
        }
      }

      // 4a. Sanitary (NEW)
      if (payload.epi?.length) {
        // UZ: Hozircha payload.epi dan kelgan ma'lumotni ham Sanitariyaga yozamiz
        for (const data of payload.epi) {
          this.validateIsolation(user, data.organizationId);
          let report = await manager.findOne(SanitaryDailyReport, {
            where: {
              reportDate,
              organization: { id: data.organizationId },
              isTest,
            },
          });
          if (report) Object.assign(report, data);
          else
            report = manager.create(SanitaryDailyReport, {
              ...data,
              reportDate,
              isTest,
              organization: { id: data.organizationId },
            });
          await manager.save(report);
        }
      }

      // 5. Covid
      if (payload.covid?.length) {
        for (const data of payload.covid) {
          this.validateIsolation(user, data.organizationId);
          let report = await manager.findOne(CovidDailyReport, {
            where: {
              reportDate,
              organization: { id: data.organizationId },
              isTest,
            },
          });
          if (report) Object.assign(report, data);
          else
            report = manager.create(CovidDailyReport, {
              ...data,
              reportDate,
              isTest,
              organization: { id: data.organizationId },
            });
          await manager.save(report);
        }
      }

      // 6. Diarrhea
      if (payload.diarrhea?.length) {
        for (const data of payload.diarrhea) {
          this.validateIsolation(user, data.organizationId);
          let report = await manager.findOne(DiarrheaDailyReport, {
            where: {
              reportDate,
              organization: { id: data.organizationId },
              isTest,
            },
          });
          if (report) Object.assign(report, data);
          else
            report = manager.create(DiarrheaDailyReport, {
              ...data,
              reportDate,
              isTest,
              organization: { id: data.organizationId },
            });
          await manager.save(report);
        }
      }

      return { success: true };
    });
  }

  private getRepoByType(type: string) {
    switch (type) {
      case "hepatitis":
        return this.reportRepo;
      case "flu":
        return this.fluRepo;
      case "ari":
        return this.ariRepo;
      case "epidemiology":
        return this.epiRepo;
      case "covid":
        return this.covidRepo;
      case "diarrhea":
        return this.diarrheaRepo;
      case "sanitary":
        return this.sanitaryRepo;
      default:
        throw new Error("Invalid report type");
    }
  }

  async submit(type: string, id: string, user: User) {
    const repo: Repository<any> = this.getRepoByType(type) as any;
    const report = await repo.findOne({ where: { id } });
    if (!report) throw new Error("Hisobot topilmadi");

    if (
      report.status !== ReportStatus.DRAFT &&
      report.status !== ReportStatus.REJECTED
    ) {
      throw new Error("Hisobot allaqachon yuborilgan");
    }

    report.status = ReportStatus.SUBMITTED;
    report.executor = user;
    return repo.save(report);
  }

  async verify(type: string, id: string, user: User) {
    const repo: Repository<any> = this.getRepoByType(type) as any;
    const report = await repo.findOne({ where: { id } });
    if (!report) throw new Error("Hisobot topilmadi");

    if (report.status !== ReportStatus.SUBMITTED) {
      throw new Error("Hisobot tasdiqlash uchun yuborilmagan");
    }

    report.status = ReportStatus.VERIFIED;
    report.verifiedBy = user;
    report.verifiedAt = new Date();
    return repo.save(report);
  }

  async approve(type: string, id: string, user: User) {
    const repo: Repository<any> = this.getRepoByType(type) as any;
    const report = await repo.findOne({ where: { id } });
    if (!report) throw new Error("Hisobot topilmadi");

    if (report.status !== ReportStatus.VERIFIED) {
      throw new Error("Hisobot mudir tomonidan tasdiqlanmagan");
    }

    report.status = ReportStatus.APPROVED;
    report.approvedBy = user;
    report.approvedAt = new Date();
    return repo.save(report);
  }

  async reject(type: string, id: string, user: User, comment?: string) {
    const repo: Repository<any> = this.getRepoByType(type) as any;
    const report = await repo.findOne({ where: { id } });
    if (!report) throw new Error("Hisobot topilmadi");

    report.status = ReportStatus.REJECTED;
    report.rejectionComment = comment;
    return repo.save(report);
  }
}

/**
 * [ORIGINAL_REDACTED_CODE_PRESERVATION]
 *
 * Modified methods in DailyReportsService:
 * - upsertEpidemiology (Removed sanitary fields from telegram notification)
 * - bulkUpsertBatch (Split epi and sanitary logic)
 * - cleanupTest, getRepoByType (Added sanitaryRepo)
 * - getSanitaryByDate, upsertSanitary (New methods)
 */
