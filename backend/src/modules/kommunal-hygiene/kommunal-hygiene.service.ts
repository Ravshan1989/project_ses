import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { KgWaterReport } from "./entities/water-report.entity";
import { KgOpenWaterReport } from "./entities/open-water-report.entity";
import { KgWaterUsageReport } from "./entities/water-usage-report.entity";
import { OrganizationsService } from "../organizations/organizations.service";

@Injectable()
export class KommunalHygieneService {
  constructor(
    @InjectRepository(KgWaterReport)
    private readonly waterRepo: Repository<KgWaterReport>,
    @InjectRepository(KgOpenWaterReport)
    private readonly openWaterRepo: Repository<KgOpenWaterReport>,
    @InjectRepository(KgWaterUsageReport)
    private readonly waterUsageRepo: Repository<KgWaterUsageReport>,
    private readonly orgService: OrganizationsService,
  ) {}

  async findByMonthAndOrg(month: string, organizationId?: string) {
    const m = month.length === 7 ? `${month}-01` : month;
    const qb = this.waterRepo
      .createQueryBuilder("r")
      .leftJoinAndSelect("r.organization", "org")
      .where("r.reportMonth = :m", { m });

    if (organizationId) {
      qb.andWhere("org.id = :oid", { oid: organizationId });
    }

    return qb.getMany();
  }

  async upsertRow(dto: any) {
    const { organizationId, reportMonth, row_type, ...fields } = dto;
    const month = reportMonth.length === 7 ? `${reportMonth}-01` : reportMonth;

    const record = await this.waterRepo.findOne({
      where: {
        reportMonth: month,
        row_type,
        organization: { id: organizationId },
      },
    });

    if (record) {
      Object.assign(record, fields);
      return this.waterRepo.save(record);
    }

    return this.waterRepo.save(
      this.waterRepo.create({
        ...fields,
        reportMonth: month,
        row_type,
        organization: { id: organizationId } as any,
      }),
    );
  }

  // ─── TABLE 2: OPEN WATER ───────────────────────────────────────────────

  async findOpenWater(month: string, organizationId?: string) {
    const m = month.length === 7 ? `${month}-01` : month;
    const qb = this.openWaterRepo
      .createQueryBuilder("r")
      .leftJoinAndSelect("r.organization", "org")
      .where("r.reportMonth = :m", { m });

    if (organizationId) {
      qb.andWhere("org.id = :oid", { oid: organizationId });
    }

    return qb.getMany();
  }

  async saveOpenWaterRows(dtos: any[], month: string, organizationId: string) {
    const m = month.length === 7 ? `${month}-01` : month;

    // Simpler approach: delete existing for this month/org and insert new list
    // Or we can do a proper sync. Given it's a dynamic list, sync is better or overwrite.
    // User will send the full list of rows or it's cumulative.

    // For dynamic rows, we usually delete old ones and insert new ones or match by ID.
    // Let's do overwrite for now as it's common for these types of reports.

    await this.openWaterRepo.delete({
      reportMonth: m,
      organization: { id: organizationId },
    });

    const entities = this.openWaterRepo.create(
      dtos.map((dto) => ({
        ...dto,
        reportMonth: m,
        organization: { id: organizationId } as any,
      })),
    );

    return this.openWaterRepo.save(entities);
  }

  // ─── TABLE 3: WATER USAGE ─────────────────────────────────────────────

  async findWaterUsage(month: string, organizationId?: string) {
    const m = month.length === 7 ? `${month}-01` : month;
    const qb = this.waterUsageRepo
      .createQueryBuilder("r")
      .leftJoinAndSelect("r.organization", "org")
      .where("r.reportMonth = :m", { m });

    if (organizationId) {
      qb.andWhere("org.id = :oid", { oid: organizationId });
    }

    return qb.getMany();
  }

  async saveWaterUsageRows(dtos: any[], month: string, organizationId: string) {
    const m = month.length === 7 ? `${month}-01` : month;

    await this.waterUsageRepo.delete({
      reportMonth: m,
      organization: { id: organizationId },
    });

    const entities = this.waterUsageRepo.create(
      dtos.map((dto) => ({
        ...dto,
        reportMonth: m,
        organization: { id: organizationId } as any,
      })),
    );

    return this.waterUsageRepo.save(entities);
  }

  // ─── REGIONAL STATUS AGGREGATION ──────────────────────────────────────

  async getRegionalStatus(month: string) {
    const m = month.length === 7 ? `${month}-01` : month;

    // Fetch all districts
    const allOrgs = await this.orgService.findAll();
    const districts = allOrgs.filter((o) => o.parent !== null);

    // Fetch data for all three tables for the given month
    const [waterData, openWaterData, usageData] = await Promise.all([
      this.waterRepo.find({
        where: { reportMonth: m },
        relations: ["organization"],
      }),
      this.openWaterRepo.find({
        where: { reportMonth: m },
        relations: ["organization"],
      }),
      this.waterUsageRepo.find({
        where: { reportMonth: m },
        relations: ["organization"],
      }),
    ]);

    const results = districts.map((d) => {
      const districtWater = waterData.filter(
        (w) => w.organization?.id === d.id,
      );
      const districtOpenWater = openWaterData.filter(
        (ow) => ow.organization?.id === d.id,
      );
      const districtUsage = usageData.filter(
        (u) => u.organization?.id === d.id,
      );

      const totalSamplesT1 = districtWater.reduce(
        (acc, r: any) => acc + (r.chem_total || 0),
        0,
      );
      const badSamplesT1 = districtWater.reduce(
        (acc, r: any) =>
          acc +
          ((r.chem_bad_ammiak || 0) +
            (r.chem_bad_nitrat || 0) +
            (r.chem_bad_nitrit || 0) +
            (r.chem_bad_qoldiq || 0) +
            (r.chem_bad_xlorid || 0) +
            (r.chem_bad_sulfat || 0) +
            (r.chem_bad_loyqa || 0) +
            (r.chem_bad_qattiq || 0) +
            (r.chem_bad_other || 0)),
        0,
      );

      const totalSamplesT2 = districtOpenWater.reduce(
        (acc, r: any) => acc + (r.chem_before_total || 0),
        0,
      );
      const badSamplesT2 = districtOpenWater.reduce(
        (acc, r: any) => acc + (r.chem_before_bad || 0),
        0,
      );

      const totalSamplesT3 = districtUsage.reduce(
        (acc, r: any) => acc + (r.samples_taken || 0),
        0,
      );
      const badSamplesT3 = districtUsage.reduce(
        (acc, r: any) => acc + (r.samples_bad || 0),
        0,
      );

      const totalSamples = totalSamplesT1 + totalSamplesT2 + totalSamplesT3;
      const totalBad = badSamplesT1 + badSamplesT2 + badSamplesT3;
      const badPercent =
        totalSamples > 0 ? ((totalBad / totalSamples) * 100).toFixed(1) : "0";

      return {
        id: d.id,
        name: d.name,
        t1: districtWater.length > 0,
        t2: districtOpenWater.length > 0,
        t3: districtUsage.length > 0,
        totalSamples,
        totalBad,
        badPercent,
      };
    });

    // Add regional totals summary
    const regionTotalSamples = results.reduce(
      (acc, r) => acc + r.totalSamples,
      0,
    );
    const regionTotalBad = results.reduce((acc, r) => acc + r.totalBad, 0);
    const regionBadPercent =
      regionTotalSamples > 0
        ? ((regionTotalBad / regionTotalSamples) * 100).toFixed(1)
        : "0";

    return {
      districts: results,
      summary: {
        totalSamples: regionTotalSamples,
        totalBad: regionTotalBad,
        badPercent: regionBadPercent,
      },
    };
  }
}
