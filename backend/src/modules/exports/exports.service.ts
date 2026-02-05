import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between } from "typeorm";
import { HepatitisDailyReport } from "../daily-reports/entities/hepatitis-daily-report.entity";
import { FluDailyReport } from "../daily-reports/entities/flu-daily-report.entity";
import { Submission } from "../submissions/entities/submission.entity";
import { User } from "../users/entities/user.entity";
import { getRoleLevel } from "../../common/utils/role.util";

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
    }

    return this.fluRepo.find({
      where,
      relations: ["organization"],
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
    }

    return this.hepatitisRepo.find({
      where,
      relations: ["organization"],
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
    }

    return this.submissionRepo.find({
      where,
      relations: ["organization", "template"],
      order: { reportingPeriod: "ASC" },
    });
  }
}
