import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
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
import { Organization } from "../organizations/entities/organization.entity";
import { User } from "../users/entities/user.entity";
import { getRoleLevel } from "../../common/utils/role.util";
import { FindOptionsWhere } from "typeorm";
import { TelegramService } from "../telegram/telegram.service";
import { Inject, forwardRef } from "@nestjs/common";

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
    @InjectRepository(Organization)
    private orgRepo: Repository<Organization>,
    @Inject(forwardRef(() => TelegramService))
    private telegramService: TelegramService,
  ) { }

  private validateIsolation(user: User, organizationId: string) {
    if (!user || !user.organization) return; // Should not happen with JwtGuard

    const level = getRoleLevel(user.role);
    if (level === 3) {
      if (user.organization.id !== organizationId) {
        throw new Error("Siz faqat o'z tashkilotingiz uchun ma'lumot kiritishingiz mumkin.");
      }
    } else if (level === 2) {
      // Viloyat: faqat o'ziga tegishli tumanlar (agar kerak bo'lsa implement qilinadi)
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
      Object.assign(report, dto);
    } else {
      report = this.reportRepo.create({
        ...dto,
        organization: { id: dto.organizationId },
        isTest: dto.isTest || false,
      });
    }
    const saved = await this.reportRepo.save(report);
    if (!dto.isTest) {
      const details = `Jami: ${saved.total_cases}\nMusbat: ${saved.lab_positive}`;
      this.telegramService.sendReportNotification("Gepatit", user.organization?.name || "Tuman", saved.reportDate, details);
    }
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
    const level = getRoleLevel(user.role);
    const where: FindOptionsWhere<HepatitisDailyReport> = {
      reportDate: date,
      isTest: includeTest // UZ: Test yoki Real ma'lumotni tanlash
    };

    // Level 2 (Viloyat): O'z viloyatiga qarashli
    if (level === 2 && user.organization) {
      where.organization = { parent: { id: user.organization.id } };
    }
    // Level 3 (Tuman): O'z tumaniga qarashli
    else if (level === 3 && user.organization) {
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
      Object.assign(report, dto);
    } else {
      report = this.fluRepo.create({
        ...dto,
        organization: { id: dto.organizationId },
        isTest: dto.isTest || false,
      });
    }
    const saved = await this.fluRepo.save(report);
    if (!dto.isTest) {
      const details = `O'RI: ${saved.ari_total}\nZotiljam: ${saved.pneu_total}\nGripp: ${saved.flu_total}\nSARI: ${saved.sari_total}\nVafot: ${saved.death_total}`;
      this.telegramService.sendReportNotification("Gripp va O'RVI (Batafsil)", user.organization?.name || "Tuman", saved.reportDate, details);
    }
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
    const level = getRoleLevel(user.role);
    const where: FindOptionsWhere<FluDailyReport> = {
      reportDate: date,
      isTest: includeTest
    };

    if (level === 2 && user.organization) {
      where.organization = { parent: { id: user.organization.id } };
    } else if (level === 3 && user.organization) {
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
      Object.assign(report, dto);
    } else {
      report = this.ariRepo.create({
        ...dto,
        organization: { id: dto.organizationId },
        isTest: dto.isTest || false,
      });
    }
    const saved = await this.ariRepo.save(report);
    if (!dto.isTest) {
      const details = `O'RI: ${saved.ari}\nZotiljam: ${saved.pneumonia}\nGrippsimon: ${saved.gk}`;
      this.telegramService.sendReportNotification("O'RVI (Qisqa)", user.organization?.name || "Tuman", saved.reportDate, details);
    }
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
    const level = getRoleLevel(user.role);
    const where: FindOptionsWhere<AriDailyReport> = {
      reportDate: date,
      isTest: includeTest
    };

    if (level === 2 && user.organization) {
      where.organization = { parent: { id: user.organization.id } };
    } else if (level === 3 && user.organization) {
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
      Object.assign(report, dto);
    } else {
      report = this.epiRepo.create({
        ...dto,
        organization: { id: dto.organizationId },
        isTest: dto.isTest || false,
      });
    }
    const saved = await this.epiRepo.save(report);
    if (!dto.isTest) {
      const details = `Tekshirildi: ${saved.inspected_total}\nKamchiliklar: ${saved.defects_total}\nJarima: ${saved.fines_total}\nTo'xtatildi: ${saved.suspended_total}`;
      this.telegramService.sendReportNotification("Epidemiologiya", user.organization?.name || "Tuman", saved.reportDate, details);
    }
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
    const level = getRoleLevel(user.role);
    const where: FindOptionsWhere<EpidemiologyDailyReport> = {
      reportDate: date,
      isTest: includeTest
    };

    if (level === 2 && user.organization) {
      where.organization = { parent: { id: user.organization.id } };
    } else if (level === 3 && user.organization) {
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
  async getWeeklySummary(startDate: string, endDate: string, user: User, includeTest = false) {
    const qb = this.orgRepo
      .createQueryBuilder("organization")
      .leftJoin("organization.parent", "parent")
      .leftJoin("organization.flu_reports", "report", "report.reportDate BETWEEN :startDate AND :endDate AND report.isTest = :includeTest", {
        startDate,
        endDate,
        includeTest
      })
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

    // UZ: Role Level bo'yicha filtr
    const level = getRoleLevel(user.role);
    if (level === 2 && user.organization) {
      qb.andWhere("organization.parent_id = :orgId", { orgId: user.organization.id });
    } else if (level === 3 && user.organization) {
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
    this.validateIsolation(user, dto.organizationId);
    let report = await this.covidRepo.findOne({
      where: {
        reportDate: dto.reportDate,
        organization: { id: dto.organizationId },
        isTest: dto.isTest || false,
      },
    });

    if (report) {
      Object.assign(report, dto);
    } else {
      report = this.covidRepo.create({
        ...dto,
        organization: { id: dto.organizationId },
        isTest: dto.isTest || false,
      });
    }
    const saved = await this.covidRepo.save(report);
    if (!dto.isTest) {
      const details = `Jami: ${saved.total_cases}\nHospital: ${saved.hospitalized_count}\nQayta: ${saved.reinfected}`;
      this.telegramService.sendReportNotification("Covid", user.organization?.name || "Tuman", saved.reportDate, details);
    }
    return saved;
  }

  /*
  async getCovidByDate(date: string) {
    return this.covidRepo.find({
      where: { reportDate: date },
      relations: ["organization", "organization.parent"],
    });
  }
  */

  async getCovidByDate(date: string, user: User, includeTest = false) {
    const level = getRoleLevel(user.role);
    const where: FindOptionsWhere<CovidDailyReport> = {
      reportDate: date,
      isTest: includeTest
    };

    if (level === 2 && user.organization) {
      where.organization = { parent: { id: user.organization.id } };
    } else if (level === 3 && user.organization) {
      where.organization = { id: user.organization.id };
    }

    return this.covidRepo.find({
      where,
      relations: ["organization", "organization.parent"],
    });
  }

  async cleanupTest() {
    await this.reportRepo.delete({ isTest: true });
    await this.fluRepo.delete({ isTest: true });
    await this.ariRepo.delete({ isTest: true });
    await this.epiRepo.delete({ isTest: true });
    await this.covidRepo.delete({ isTest: true });
    return { success: true, message: "Test ma'lumotlari muvaffaqiyatli o'chirildi" };
  }

  /**
   * UZ: Bir oylik kunlik hisobotlarni jamlash (Forma-1 uchun)
   */
  async getMonthlyAggregation(month: string, organizationId: string, isTest: boolean) {
    const start = new Date(month);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);

    const startDate = start.toISOString().split('T')[0];
    const endDate = end.toISOString().split('T')[0];

    // 1. Gepatit
    const hepatitis = await this.reportRepo.createQueryBuilder("r")
      .select("SUM(r.total_cases)", "total")
      .addSelect("SUM(r.age_under_1 + r.age_1_3 + r.age_4_6 + r.age_7_14)", "under14")
      .where("r.organizationId = :organizationId", { organizationId })
      .andWhere("r.reportDate BETWEEN :startDate AND :endDate", { startDate, endDate })
      .andWhere("r.isTest = :isTest", { isTest })
      .getRawOne();

    // 2. Gripp va O'RVI
    const flu = await this.fluRepo.createQueryBuilder("r")
      .select("SUM(r.flu_total)", "flu")
      .addSelect("SUM(r.ari_total)", "ari")
      .addSelect("SUM(r.flu_0_1 + r.flu_1_2 + r.flu_3_6 + r.flu_7_14)", "fluUnder14")
      .addSelect("SUM(r.ari_0_1 + r.ari_1_2 + r.ari_3_6 + r.ari_7_14)", "ariUnder14")
      .where("r.organizationId = :organizationId", { organizationId })
      .andWhere("r.reportDate BETWEEN :startDate AND :endDate", { startDate, endDate })
      .andWhere("r.isTest = :isTest", { isTest })
      .getRawOne();

    // 3. Koronavirus
    const covid = await this.covidRepo.createQueryBuilder("r")
      .select("SUM(r.total_cases)", "total")
      .where("r.organizationId = :organizationId", { organizationId })
      .andWhere("r.reportDate BETWEEN :startDate AND :endDate", { startDate, endDate })
      .andWhere("r.isTest = :isTest", { isTest })
      .getRawOne();

    return {
      hepatitis: {
        total: Number(hepatitis?.total || 0),
        under14: Number(hepatitis?.under14 || 0)
      },
      flu: {
        total: Number(flu?.flu || 0),
        under14: Number(flu?.fluUnder14 || 0)
      },
      ari: {
        total: Number(flu?.ari || 0),
        under14: Number(flu?.ariUnder14 || 0)
      },
      covid: {
        total: Number(covid?.total || 0),
        under14: 0 // Covid report doesn't have age breakdown in current entity
      }
    };
  }
}
