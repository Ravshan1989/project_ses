import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ChSchoolSanitaryReport } from "./entities/ch-school-sanitary-report.entity";
import { ChLabSupervisionReport } from "./entities/ch-lab-supervision-report.entity";
import { ChLabTestsReport } from "./entities/ch-lab-tests-report.entity";
import { ChChemTestsReport } from "./entities/ch-chem-tests-report.entity";
import { ChParasitoMicroReport } from "./entities/ch-parasito-micro-report.entity";
import { ChFinesReport } from "./entities/ch-fines-report.entity";
import { SaveChSchoolSanitaryReportDto } from "./dto/ch-school-sanitary-report.dto";
import { SaveChLabSupervisionReportDto } from "./dto/ch-lab-supervision-report.dto";
import { SaveChLabTestsReportDto } from "./dto/ch-lab-tests-report.dto";
import { SaveChChemTestsReportDto } from "./dto/ch-chem-tests-report.dto";
import { SaveChParasitoMicroReportDto } from "./dto/ch-parasito-micro-report.dto";
import { SaveChFinesReportDto } from "./dto/ch-fines-report.dto";
import { OrganizationsService } from "../organizations/organizations.service";

@Injectable()
export class ChildrenHygieneService {
  constructor(
    @InjectRepository(ChSchoolSanitaryReport)
    private readonly chSchoolSanitaryReportRepo: Repository<ChSchoolSanitaryReport>,
    @InjectRepository(ChLabSupervisionReport)
    private readonly chLabSupervisionReportRepo: Repository<ChLabSupervisionReport>,
    @InjectRepository(ChLabTestsReport)
    private readonly chLabTestsReportRepo: Repository<ChLabTestsReport>,
    @InjectRepository(ChChemTestsReport)
    private readonly chChemTestsReportRepo: Repository<ChChemTestsReport>,
    @InjectRepository(ChParasitoMicroReport)
    private readonly chParasitoMicroReportRepo: Repository<ChParasitoMicroReport>,
    @InjectRepository(ChFinesReport)
    private readonly chFinesReportRepo: Repository<ChFinesReport>,
    private readonly orgService: OrganizationsService,
  ) {}

  async getTable1Report(month: string, organizationId: string) {
    return await this.chSchoolSanitaryReportRepo.find({
      where: { period_month: month, organization_id: organizationId },
    });
  }

  async saveTable1Report(dto: SaveChSchoolSanitaryReportDto) {
    const { month, organizationId, rows } = dto;
    const existingReports = await this.chSchoolSanitaryReportRepo.find({
      where: { period_month: month, organization_id: organizationId },
    });

    const reportMap = new Map(existingReports.map((r) => [r.row_key, r]));

    for (const rowData of rows) {
      if (reportMap.has(rowData.row_key)) {
        const existing = reportMap.get(rowData.row_key);
        Object.assign(existing, rowData);
        await this.chSchoolSanitaryReportRepo.save(existing);
      } else {
        const newReport = this.chSchoolSanitaryReportRepo.create({
          organization_id: organizationId,
          period_month: month,
          row_key: rowData.row_key,
          ...rowData,
        });
        await this.chSchoolSanitaryReportRepo.save(newReport);
      }
    }

    await this.recalculateHierarchy(
      this.chSchoolSanitaryReportRepo,
      month,
      organizationId,
    );
    return { success: true };
  }

  async getTable2Report(month: string, organizationId: string) {
    return await this.chLabSupervisionReportRepo.find({
      where: { period_month: month, organization_id: organizationId },
    });
  }

  async saveTable2Report(dto: SaveChLabSupervisionReportDto) {
    const { month, organizationId, rows } = dto;
    const existingReports = await this.chLabSupervisionReportRepo.find({
      where: { period_month: month, organization_id: organizationId },
    });

    const reportMap = new Map(existingReports.map((r) => [r.row_key, r]));

    for (const rowData of rows) {
      if (reportMap.has(rowData.row_key)) {
        const existing = reportMap.get(rowData.row_key);
        Object.assign(existing, rowData);
        await this.chLabSupervisionReportRepo.save(existing);
      } else {
        const newReport = this.chLabSupervisionReportRepo.create({
          organization_id: organizationId,
          period_month: month,
          row_key: rowData.row_key,
          ...rowData,
        });
        await this.chLabSupervisionReportRepo.save(newReport);
      }
    }

    await this.recalculateHierarchy(
      this.chLabSupervisionReportRepo,
      month,
      organizationId,
    );
    return { success: true };
  }

  async getTable3Report(month: string, organizationId: string) {
    return await this.chLabTestsReportRepo.find({
      where: { period_month: month, organization_id: organizationId },
    });
  }

  async saveTable3Report(dto: SaveChLabTestsReportDto) {
    const { month, organizationId, rows } = dto;
    const existingReports = await this.chLabTestsReportRepo.find({
      where: { period_month: month, organization_id: organizationId },
    });

    const reportMap = new Map(existingReports.map((r) => [r.row_key, r]));

    for (const rowData of rows) {
      if (reportMap.has(rowData.row_key)) {
        const existing = reportMap.get(rowData.row_key);
        Object.assign(existing, rowData);
        await this.chLabTestsReportRepo.save(existing);
      } else {
        const newReport = this.chLabTestsReportRepo.create({
          organization_id: organizationId,
          period_month: month,
          row_key: rowData.row_key,
          ...rowData,
        });
        await this.chLabTestsReportRepo.save(newReport);
      }
    }

    await this.recalculateHierarchy(
      this.chLabTestsReportRepo,
      month,
      organizationId,
    );
    return { success: true };
  }

  async getTable3_1Report(month: string, organizationId: string) {
    return await this.chChemTestsReportRepo.find({
      where: { period_month: month, organization_id: organizationId },
    });
  }

  async saveTable3_1Report(dto: SaveChChemTestsReportDto) {
    const { month, organizationId, rows } = dto;
    const existingReports = await this.chChemTestsReportRepo.find({
      where: { period_month: month, organization_id: organizationId },
    });

    const reportMap = new Map(existingReports.map((r) => [r.row_key, r]));

    for (const rowData of rows) {
      if (reportMap.has(rowData.row_key)) {
        const existing = reportMap.get(rowData.row_key);
        Object.assign(existing, rowData);
        await this.chChemTestsReportRepo.save(existing);
      } else {
        const newReport = this.chChemTestsReportRepo.create({
          organization_id: organizationId,
          period_month: month,
          row_key: rowData.row_key,
          ...rowData,
        });
        await this.chChemTestsReportRepo.save(newReport);
      }
    }

    await this.recalculateHierarchy(
      this.chChemTestsReportRepo,
      month,
      organizationId,
    );
    await this.updateTable2Summary(month, organizationId);
    return { success: true };
  }

  async getTable3_2Report(month: string, organizationId: string) {
    return await this.chParasitoMicroReportRepo.find({
      where: { period_month: month, organization_id: organizationId },
    });
  }

  async saveTable3_2Report(dto: SaveChParasitoMicroReportDto) {
    const { month, organizationId, rows } = dto;
    const existingReports = await this.chParasitoMicroReportRepo.find({
      where: { period_month: month, organization_id: organizationId },
    });

    const reportMap = new Map(existingReports.map((r) => [r.row_key, r]));

    for (const rowData of rows) {
      if (reportMap.has(rowData.row_key)) {
        const existing = reportMap.get(rowData.row_key);
        Object.assign(existing, rowData);
        await this.chParasitoMicroReportRepo.save(existing);
      } else {
        const newReport = this.chParasitoMicroReportRepo.create({
          organization_id: organizationId,
          period_month: month,
          row_key: rowData.row_key,
          ...rowData,
        });
        await this.chParasitoMicroReportRepo.save(newReport);
      }
    }

    await this.recalculateHierarchy(
      this.chParasitoMicroReportRepo,
      month,
      organizationId,
    );
    await this.updateTable2Summary(month, organizationId);
    return { success: true };
  }

  async getTable4Report(month: string, organizationId: string) {
    return await this.chFinesReportRepo.find({
      where: { period_month: month, organization_id: organizationId },
    });
  }

  async saveTable4Report(dto: SaveChFinesReportDto) {
    const { month, organizationId, rows } = dto;
    const existingReports = await this.chFinesReportRepo.find({
      where: { period_month: month, organization_id: organizationId },
    });
    const reportMap = new Map(existingReports.map((r) => [r.row_key, r]));
    for (const rowData of rows) {
      if (reportMap.has(rowData.row_key)) {
        const existing = reportMap.get(rowData.row_key);
        Object.assign(existing, rowData);
        await this.chFinesReportRepo.save(existing);
      } else {
        const newReport = this.chFinesReportRepo.create({
          organization_id: organizationId,
          period_month: month,
          row_key: rowData.row_key,
          ...rowData,
        });
        await this.chFinesReportRepo.save(newReport);
      }
    }
    await this.recalculateHierarchy(
      this.chFinesReportRepo,
      month,
      organizationId,
    );
    return { success: true };
  }

  async getRegionalStatus(month: string) {
    // Fetch all child organizations (districts)
    const allOrgs = await this.orgService.findAll();
    const districts = allOrgs.filter((o) => o.parent !== null);

    // Fetch data for all 6 tables in parallel
    const [t1Data, t2Data, t3Data, t31Data, t32Data, t4Data] =
      await Promise.all([
        this.chSchoolSanitaryReportRepo.find({
          where: { period_month: month },
        }),
        this.chLabSupervisionReportRepo.find({
          where: { period_month: month },
        }),
        this.chLabTestsReportRepo.find({ where: { period_month: month } }),
        this.chChemTestsReportRepo.find({ where: { period_month: month } }),
        this.chParasitoMicroReportRepo.find({ where: { period_month: month } }),
        this.chFinesReportRepo.find({ where: { period_month: month } }),
      ]);

    const results = districts.map((d) => {
      const dt1 = t1Data.filter((r) => r.organization_id === d.id);
      const dt2 = t2Data.filter((r) => r.organization_id === d.id);
      const dt3 = t3Data.filter((r) => r.organization_id === d.id);
      const dt31 = t31Data.filter((r) => r.organization_id === d.id);
      const dt32 = t32Data.filter((r) => r.organization_id === d.id);
      const dt4 = t4Data.filter((r) => r.organization_id === d.id);

      // Inspected institutions count (T1: total row)
      const inspectedInstitutions = dt1.reduce(
        (a, r: any) => a + (r.institutionsCount || 0),
        0,
      );

      // Lab tests: total and non-compliant from T1 (lab_supervisions_count) + T3 + T3.1 + T3.2
      // Note: T2 is a summary of T3.1 and T3.2, so we don't double count.
      const t3Total = dt3.reduce(
        (a, r: any) =>
          a +
          (r.airSamplesTotal || 0) +
          (r.microSamplesTotal || 0) +
          (r.vibSamplesTotal || 0) +
          (r.emfSamplesTotal || 0) +
          (r.lightSamplesTotal || 0) +
          (r.noiseSamplesTotal || 0),
        0,
      );
      const t3NonCompliant = dt3.reduce(
        (a, r: any) =>
          a +
          (r.airRemExceededTotal || 0) +
          (r.microRemExceededTotal || 0) +
          (r.vibRemExceededTotal || 0) +
          (r.emfRemExceededTotal || 0) +
          (r.lightRemExceededTotal || 0) +
          (r.noiseRemExceededTotal || 0),
        0,
      );

      const t31Total = dt31.reduce(
        (a, r: any) =>
          a +
          (r.rationTotal || 0) +
          (r.saltTotal || 0) +
          (r.nitrateTotal || 0) +
          (r.toxicTotal || 0) +
          (r.thermalTotal || 0) +
          (r.mineralTotal || 0) +
          (r.soilTotal || 0) +
          (r.waterTotal || 0) +
          (r.pesticideTotal || 0) +
          (r.nutritionTotal || 0),
        0,
      );
      const t31NonCompliant = dt31.reduce(
        (a, r: any) =>
          a +
          (r.rationNonCompliant || 0) +
          (r.saltNonCompliant || 0) +
          (r.nitrateNonCompliant || 0) +
          (r.toxicNonCompliant || 0) +
          (r.thermalNonCompliant || 0) +
          (r.mineralNonCompliant || 0) +
          (r.soilNonCompliant || 0) +
          (r.waterNonCompliant || 0) +
          (r.pesticideNonCompliant || 0) +
          (r.nutritionNonCompliant || 0),
        0,
      );

      const t32Total = dt32.reduce(
        (a, r: any) =>
          a +
          (r.paraVegTotal || 0) +
          (r.paraWaterTotal || 0) +
          (r.paraSoilTotal || 0) +
          (r.microSmearTotal || 0) +
          (r.microFoodTotal || 0) +
          (r.microWaterTotal || 0) +
          (r.microSoilTotal || 0),
        0,
      );
      const t32NonCompliant = dt32.reduce(
        (a, r: any) =>
          a +
          (r.paraVegNonCompliant || 0) +
          (r.paraWaterNonCompliant || 0) +
          (r.paraSoilNonCompliant || 0) +
          (r.microSmearNonCompliant || 0) +
          (r.microFoodNonCompliant || 0) +
          (r.microWaterNonCompliant || 0) +
          (r.microSoilNonCompliant || 0),
        0,
      );

      const totalTests = t3Total + t31Total + t32Total;
      const nonCompliantTests =
        t3NonCompliant + t31NonCompliant + t32NonCompliant;

      // Fines from T4
      const fineCount = dt4.reduce(
        (a, r: any) => a + (r.fineCountImposed || 0),
        0,
      );

      const compliancePct =
        totalTests > 0
          ? ((1 - nonCompliantTests / totalTests) * 100).toFixed(1)
          : "100.0";

      return {
        id: d.id,
        name: d.name,
        t1: dt1.length > 0,
        t2: dt2.length > 0,
        t3: dt3.length > 0,
        t31: dt31.length > 0,
        t32: dt32.length > 0,
        t4: dt4.length > 0,
        inspectedInstitutions,
        totalTests,
        nonCompliantTests,
        fineCount,
        compliancePct,
      };
    });

    // Regional totals
    const summary = {
      inspectedInstitutions: results.reduce(
        (a, r) => a + r.inspectedInstitutions,
        0,
      ),
      totalTests: results.reduce((a, r) => a + r.totalTests, 0),
      nonCompliantTests: results.reduce((a, r) => a + r.nonCompliantTests, 0),
      fineCount: results.reduce((a, r) => a + r.fineCount, 0),
    };
    const avgCompliance =
      summary.totalTests > 0
        ? ((1 - summary.nonCompliantTests / summary.totalTests) * 100).toFixed(
            1,
          )
        : "100.0";

    return {
      districts: results,
      summary: { ...summary, compliancePct: avgCompliance },
    };
  }

  private async updateTable2Summary(month: string, organizationId: string) {
    // Fetch data from T3.1 and T3.2
    const t31 = await this.chChemTestsReportRepo.find({
      where: { period_month: month, organization_id: organizationId },
    });
    const t32 = await this.chParasitoMicroReportRepo.find({
      where: { period_month: month, organization_id: organizationId },
    });

    // Build a unique set of row keys that have data
    const rowKeys = new Set<string>();
    t31.forEach((r) => rowKeys.add(r.row_key));
    t32.forEach((r) => rowKeys.add(r.row_key));

    const existingT2 = await this.chLabSupervisionReportRepo.find({
      where: { period_month: month, organization_id: organizationId },
    });
    const reportMap = new Map(existingT2.map((r) => [r.row_key, r]));

    for (const key of rowKeys) {
      if (key === "total" || key.length <= 3) continue; // Skip parent rows, we will recalculate them later

      const chemRows = t31.filter((r) => r.row_key === key);
      const paraRows = t32.filter((r) => r.row_key === key);

      // Chem Summary (T3.1)
      const chemTotal = chemRows.reduce(
        (a, r) =>
          a +
          (r.rationTotal || 0) +
          (r.saltTotal || 0) +
          (r.nitrateTotal || 0) +
          (r.toxicTotal || 0) +
          (r.thermalTotal || 0) +
          (r.mineralTotal || 0) +
          (r.soilTotal || 0) +
          (r.waterTotal || 0) +
          (r.pesticideTotal || 0) +
          (r.nutritionTotal || 0),
        0,
      );
      const chemNonCompliant = chemRows.reduce(
        (a, r) =>
          a +
          (r.rationNonCompliant || 0) +
          (r.saltNonCompliant || 0) +
          (r.nitrateNonCompliant || 0) +
          (r.toxicNonCompliant || 0) +
          (r.thermalNonCompliant || 0) +
          (r.mineralNonCompliant || 0) +
          (r.soilNonCompliant || 0) +
          (r.waterNonCompliant || 0) +
          (r.pesticideNonCompliant || 0) +
          (r.nutritionNonCompliant || 0),
        0,
      );

      // Para Summary (T3.2 - Para part)
      const paraTotal = paraRows.reduce(
        (a, r) =>
          a +
          (r.paraVegTotal || 0) +
          (r.paraWaterTotal || 0) +
          (r.paraSoilTotal || 0),
        0,
      );
      const paraNonCompliant = paraRows.reduce(
        (a, r) =>
          a +
          (r.paraVegNonCompliant || 0) +
          (r.paraWaterNonCompliant || 0) +
          (r.paraSoilNonCompliant || 0),
        0,
      );

      // Bact Summary (T3.2 - Micro part)
      const bactTotal = paraRows.reduce(
        (a, r) =>
          a +
          (r.microSmearTotal || 0) +
          (r.microFoodTotal || 0) +
          (r.microWaterTotal || 0) +
          (r.microSoilTotal || 0),
        0,
      );
      const bactNonCompliant = paraRows.reduce(
        (a, r) =>
          a +
          (r.microSmearNonCompliant || 0) +
          (r.microFoodNonCompliant || 0) +
          (r.microWaterNonCompliant || 0) +
          (r.microSoilNonCompliant || 0),
        0,
      );

      let report = reportMap.get(key);
      if (!report) {
        report = this.chLabSupervisionReportRepo.create({
          period_month: month,
          organization_id: organizationId,
          row_key: key,
        });
      }
      report.chemTotal = chemTotal;
      report.chemNonCompliant = chemNonCompliant;
      report.paraTotal = paraTotal;
      report.paraNonCompliant = paraNonCompliant;
      report.bactTotal = bactTotal;
      report.bactNonCompliant = bactNonCompliant;

      await this.chLabSupervisionReportRepo.save(report);
    }

    // Recalculate hierarchy for Table 2
    await this.recalculateHierarchy(
      this.chLabSupervisionReportRepo,
      month,
      organizationId,
    );
  }

  private async recalculateHierarchy(
    repo: Repository<any>,
    month: string,
    organizationId: string,
  ) {
    const data = await repo.find({
      where: { period_month: month, organization_id: organizationId },
    });
    const reportMap = new Map(data.map((r) => [r.row_key, r]));

    // Identify unique parent keys in the current data
    // Pairs like [parentKey, [childrenKeys]]
    const hierarchy: Record<string, string[]> = {
      total: ["1_1", "1_2", "1_3", "1_4", "1_5", "1_6"],
      "1_1": [
        "1_1_1",
        "1_1_1_outsourcing",
        "1_1_2",
        "1_1_3",
        "1_1_4",
        "1_1_5",
        "1_1_7",
        "1_1_8",
      ],
      "1_2": ["1_2_1", "1_2_2", "1_2_3", "1_2_4"],
      "1_3": ["1_3_1", "1_3_2", "1_3_3"],
      "1_4": ["1_4_1"],
      "1_5": ["1_5_1", "1_5_2", "1_5_3"],
      "1_6": ["1_6_1", "1_6_1_pools", "1_6_2", "1_6_3"],
      "1_7": ["1_7_1", "1_7_2", "1_7_3", "1_7_4", "1_7_5", "1_7_6"],
    };

    // Fields to sum (generic across all Hygiene entities)
    const fieldsToSum = [
      "institutionsCount",
      "supervisionPlan",
      "totalSupervisionsConducted",
      "plannedSupervisionsConducted",
      "unplannedSupervisionsConducted",
      "labSupervisionsCount",
      "chemTotal",
      "chemNonCompliant",
      "bactTotal",
      "bactNonCompliant",
      "paraTotal",
      "paraNonCompliant",
      "airInspectedCount",
      "airSamplesTotal",
      "airSamples12k",
      "airRemExceededTotal",
      "airRemExceeded12k",
      "microInspectedCount",
      "microSamplesTotal",
      "microSamplesNonCompliant",
      "vibInspectedCount",
      "vibSamplesTotal",
      "vibSamplesNonCompliant",
      "emfInspectedCount",
      "emfSamplesTotal",
      "emfSamplesNonCompliant",
      "lightInspectedCount",
      "lightSamplesTotal",
      "lightSamplesNonCompliant",
      "noiseInspectedCount",
      "noiseSamplesTotal",
      "noiseSamplesNonCompliant",
      "rationTotal",
      "rationNonCompliant",
      "saltTotal",
      "saltNonCompliant",
      "nitrateTotal",
      "nitrateNonCompliant",
      "toxicTotal",
      "toxicNonCompliant",
      "thermalTotal",
      "thermalNonCompliant",
      "mineralTotal",
      "mineralNonCompliant",
      "soilTotal",
      "soilNonCompliant",
      "waterTotal",
      "waterNonCompliant",
      "pesticideTotal",
      "pesticideNonCompliant",
      "nutritionTotal",
      "nutritionNonCompliant",
      "paraVegTotal",
      "paraVegNonCompliant",
      "paraWaterTotal",
      "paraWaterNonCompliant",
      "paraSoilTotal",
      "paraSoilNonCompliant",
      "microSmearTotal",
      "microSmearNonCompliant",
      "microFoodTotal",
      "microFoodNonCompliant",
      "microWaterTotal",
      "microWaterNonCompliant",
      "microSoilTotal",
      "microSoilNonCompliant",
      "fineCountImposed",
      "fineCountCollected",
      "fineAmountImposed",
      "fineAmountCollected",
      "activitySuspended",
      "employeesSuspended",
      "referredToInvestigation",
      "brakera",
    ];

    // Bottom-up recalculation (children first, then parents)
    // Group 1: 3-level depth (e.g. 1_1, 1_2...)
    const intermediateParents = [
      "1_1",
      "1_2",
      "1_3",
      "1_4",
      "1_5",
      "1_6",
      "1_7",
    ];
    for (const parentKey of intermediateParents) {
      await this.sumChildren(
        repo,
        reportMap,
        parentKey,
        hierarchy[parentKey],
        fieldsToSum,
        month,
        organizationId,
      );
    }

    // Group 2: Top-level (total)
    await this.sumChildren(
      repo,
      reportMap,
      "total",
      hierarchy["total"],
      fieldsToSum,
      month,
      organizationId,
    );
  }

  private async sumChildren(
    repo: Repository<any>,
    reportMap: Map<string, any>,
    parentKey: string,
    childrenKeys: string[],
    fields: string[],
    month: string,
    orgId: string,
  ) {
    if (!childrenKeys) return;

    let parent = reportMap.get(parentKey);
    if (!parent) {
      parent = repo.create({
        period_month: month,
        organization_id: orgId,
        row_key: parentKey,
      });
    }

    // Initialize/Reset fields
    fields.forEach((f) => {
      if (parent.hasOwnProperty(f)) parent[f] = 0;
    });

    for (const childKey of childrenKeys) {
      const child = reportMap.get(childKey);
      if (child) {
        fields.forEach((f) => {
          if (parent.hasOwnProperty(f)) {
            parent[f] = (parent[f] || 0) + (child[f] || 0);
          }
        });
      }
    }

    await repo.save(parent);
    reportMap.set(parentKey, parent);
  }
}
