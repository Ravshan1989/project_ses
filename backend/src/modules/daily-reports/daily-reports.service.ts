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
import { User } from "../users/entities/user.entity";
import { getRoleLevel } from "../../common/utils/role.util";
import { FindOptionsWhere } from "typeorm";

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
    return this.reportRepo.save(report);
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
    return this.fluRepo.save(report);
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
    return this.ariRepo.save(report);
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
    return this.epiRepo.save(report);
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

  // YANGI YECHIM (Viloyat darajasini bazadan olishdayoq filtrlaymiz):
  async getWeeklySummary(startDate: string, endDate: string, user: User, includeTest = false) {
    const qb = this.fluRepo
      .createQueryBuilder("report")
      .leftJoin("report.organization", "organization")
      .select([
        "organization.id AS organization_id",
        "organization.name AS organization_name",
        "organization.parent_id AS parent_id",
      ])
      .addSelect("SUM(report.ari_total)", "ari_total")
      .addSelect("SUM(report.ari_0_1)", "ari_0_1")
      .addSelect("SUM(report.ari_1_2)", "ari_1_2")
      .addSelect("SUM(report.ari_3_6)", "ari_3_6")
      .addSelect("SUM(report.ari_7_14)", "ari_7_14")
      .addSelect("SUM(report.ari_adult)", "ari_adult")
      .addSelect("SUM(report.ari_students)", "ari_students")
      .addSelect("SUM(report.ari_nursery)", "ari_nursery")
      .addSelect("SUM(report.pneu_total)", "pneu_total")
      .addSelect("SUM(report.pneu_0_2)", "pneu_0_2")
      .addSelect("SUM(report.pneu_3_6)", "pneu_3_6")
      .addSelect("SUM(report.pneu_7_14)", "pneu_7_14")
      .addSelect("SUM(report.pneu_adult)", "pneu_adult")
      .addSelect("SUM(report.pneu_students)", "pneu_students")
      .addSelect("SUM(report.pneu_nursery)", "pneu_nursery")
      .addSelect("SUM(report.flu_total)", "flu_total")
      .addSelect("SUM(report.flu_0_1)", "flu_0_1")
      .addSelect("SUM(report.flu_1_2)", "flu_1_2")
      .addSelect("SUM(report.flu_3_6)", "flu_3_6")
      .addSelect("SUM(report.flu_7_14)", "flu_7_14")
      .addSelect("SUM(report.flu_adult)", "flu_adult")
      .addSelect("SUM(report.flu_students)", "flu_students")
      .addSelect("SUM(report.flu_nursery)", "flu_nursery")
      .addSelect("SUM(report.sari_total)", "sari_total")
      .addSelect("SUM(report.sari_0_2)", "sari_0_2")
      .addSelect("SUM(report.sari_3_6)", "sari_3_6")
      .addSelect("SUM(report.sari_7_14)", "sari_7_14")
      .addSelect("SUM(report.sari_adult)", "sari_adult")
      .addSelect("SUM(report.death_total)", "death_total")
      .addSelect("SUM(report.death_pregnant)", "death_pregnant")
      .where("report.reportDate BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .andWhere("report.isTest = :includeTest", { includeTest })
      // QAT'IY FILTR: Faqat ota-onasi bor (tuman) tashkilotlarni olamiz
      .andWhere("organization.parent_id IS NOT NULL");

    // UZ: Role Level bo'yicha filtr
    const level = getRoleLevel(user.role);
    if (level === 2 && user.organization) {
      // Viloyat: Faqat o'ziga tegishli tumanlar
      qb.andWhere("organization.parent_id = :orgId", { orgId: user.organization.id });
    } else if (level === 3 && user.organization) {
      // Tuman: Faqat o'zi
      qb.andWhere("organization.id = :orgId", { orgId: user.organization.id });
    }

    qb.groupBy("organization.id")
      .addGroupBy("organization.name")
      .addGroupBy("organization.parent_id");

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
    return this.covidRepo.save(report);
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
}
