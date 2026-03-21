import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as ExcelJS from "exceljs";
import * as xlsx from "xlsx";
import { AppealsTable1 } from "./entities/appeals-table-1.entity";
import { AppealsTable2 } from "./entities/appeals-table-2.entity";
import { AppealsTable3 } from "./entities/appeals-table-3.entity";
import { AppealsTable4 } from "./entities/appeals-table-4.entity";
import { AppealsTable5 } from "./entities/appeals-table-5.entity";
import { AppealsTable6 } from "./entities/appeals-table-6.entity";
import { AppealsTable7 } from "./entities/appeals-table-7.entity";
import { Organization } from "../organizations/entities/organization.entity";

@Injectable()
export class AppealsImportService {
  private readonly logger = new Logger(AppealsImportService.name);

  constructor(
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
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
  ) {}

  /**
   * Bulk import multiple files and then aggregate
   */
  async importBulk(files: Array<any>, month: string, parentId: string) {
    const results = [];
    if (!files || !Array.isArray(files) || files.length === 0) {
      console.error("[IMPORT DEBUG] No files array received!", files);
      throw new BadRequestException(
        "Fayllar topilmadi yoki xato formatda yuborildi",
      );
    }
    const organizations = await this.orgRepo.find();

    for (const file of files) {
      // Try to find organization in filename
      const org = organizations.find(
        (o) =>
          file.originalname.toLowerCase().includes(o.name.toLowerCase()) ||
          o.name
            .toLowerCase()
            .includes(file.originalname.toLowerCase().split(".")[0]),
      );

      if (org) {
        try {
          if (
            file.originalname.endsWith(".xlsx") ||
            file.originalname.endsWith(".xls")
          ) {
            await this.importExcel(file.buffer, org.id, month);
          }
          results.push({
            filename: file.originalname,
            status: "SUCCESS",
            org: org.name,
          });
        } catch (e) {
          results.push({
            filename: file.originalname,
            status: "ERROR",
            error: e.message,
          });
        }
      } else {
        results.push({
          filename: file.originalname,
          status: "SKIPPED",
          reason: "Organization not identified from filename",
        });
      }
    }

    // After all imports, trigger aggregation
    const aggregation = await this.aggregateDistricts(parentId, month);

    return {
      results,
      aggregation,
      total_files: files.length,
      success_count: results.filter((r) => r.status === "SUCCESS").length,
    };
  }

  /**
   * Import data from an Excel buffer for a specific district and month
   */
  async importExcel(buffer: Buffer, organizationId: string, month: string) {
    this.logger.log(
      `Starting Excel import for org: ${organizationId}, month: ${month}`,
    );
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);

    // Map each sheet to a table
    const sheetMappings = [
      { name: "1-Jadval", tableNum: 1 },
      { name: "2-Jadval", tableNum: 2 },
      { name: "3-Jadval", tableNum: 3 },
      { name: "4-Jadval", tableNum: 4 },
      { name: "5-Jadval", tableNum: 5 },
      { name: "6-Jadval", tableNum: 6 },
      { name: "7-Jadval", tableNum: 7 },
    ];

    const sheets = workbook.worksheets;
    this.logger.log(
      `Workbook has ${sheets.length} sheets: ${sheets.map((s) => s.name).join(", ")}`,
    );

    for (const mapping of sheetMappings) {
      const targetName = mapping.name.toLowerCase().replace(/\s/g, "");
      const cyrillicName = mapping.name
        .toLowerCase()
        .replace("j", "ж")
        .replace(/\s/g, "");

      // Find sheet by exact name, number, or fuzzy name (Latin/Cyrillic)
      const sheet =
        workbook.getWorksheet(mapping.name) ||
        sheets.find((s) => {
          const sName = s.name.toLowerCase().replace(/\s/g, "");
          return (
            sName === targetName ||
            sName === cyrillicName ||
            sName.includes(`${mapping.tableNum}-`)
          );
        });

      if (sheet) {
        await this.importTableFromSheet(
          sheet,
          mapping.tableNum,
          organizationId,
          month,
        );
      } else {
        this.logger.warn(
          `Sheet for table ${mapping.tableNum} (expected: ${mapping.name}) not found in file.`,
        );
      }
    }

    return { success: true };
  }

  private async importTableFromSheet(
    sheet: ExcelJS.Worksheet,
    tableNum: number,
    orgId: string,
    month: string,
  ) {
    const repo = this.getRepo(tableNum);
    const fields = this.getNumericFields(tableNum);

    this.logger.log(`Importing table ${tableNum} from sheet: ${sheet.name}`);

    // Convert to array to use for...of for sequential await
    const rows: ExcelJS.Row[] = [];
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber >= 5) {
        rows.push(row);
      }
    });

    for (const row of rows) {
      const rowNumber = row.number;
      let rowKey =
        row.getCell(1).value?.toString()?.trim() || `row_${rowNumber}`;

      // Universal normalization: Total/Jami -> summary
      const lowerKey = rowKey.toLowerCase();
      if (
        lowerKey === "jami" ||
        lowerKey === "итого" ||
        lowerKey === "total" ||
        lowerKey.includes("жами (жами)")
      ) {
        rowKey = "summary";
      }

      // Normalize common Table 1 keys to programmatic values
      if (tableNum === 1) {
        if (lowerKey.includes("boshlig'i") && !lowerKey.includes("o'rinbosari"))
          rowKey = "head";
        if (lowerKey.includes("epidemiologiya")) rowKey = "deputy_epid";
        if (lowerKey.includes("sanitariya")) rowKey = "deputy_san";
      }

      // Normalize Table 2 & 4 subject keys
      if (tableNum === 2 || tableNum === 4) {
        if (lowerKey.includes("sanitariya") || lowerKey.includes("эпид"))
          rowKey = "san_epid";
        else if (lowerKey.includes("korona") || lowerKey.includes("корона"))
          rowKey = "coronavirus";
        else if (lowerKey.includes("mehnat") || lowerKey.includes("труд"))
          rowKey = "labor_relations";
        else if (lowerKey.includes("tibb") || lowerKey.includes("мед"))
          rowKey = "medical_activity";
        else if (lowerKey.includes("shikoyat") || lowerKey.includes("жалоб"))
          rowKey = "complaint_head";
        else if (lowerKey.includes("odob") || lowerKey.includes("этик"))
          rowKey = "staff_conduct";
        else if (lowerKey.includes("dezinfek") || lowerKey.includes("дезинфек"))
          rowKey = "disinfection";
        else if (lowerKey.includes("jarima") || lowerKey.includes("штраф"))
          rowKey = "fines_objection";
        else if (lowerKey.includes("boshqa") || lowerKey.includes("проч"))
          rowKey = "other";
      }

      const rowData: any = {
        organization_id: orgId,
        period_month: month,
        row_key: rowKey,
      };

      fields.forEach((field, index) => {
        const val = row.getCell(index + 3).value;
        rowData[field] = typeof val === "number" ? val : 0;
      });

      try {
        await this.saveTableRow(repo, rowData);
      } catch (e) {
        this.logger.error(
          `Error saving row ${rowNumber} in table ${tableNum}: ${e.message}`,
        );
        throw e; // Propagate to catch at higher level
      }
    }
  }

  private async saveTableRow(repo: Repository<any>, data: any) {
    const existing = await repo.findOne({
      where: {
        organization_id: data.organization_id,
        period_month: data.period_month,
        row_key: data.row_key,
      },
    });

    if (existing) {
      Object.assign(existing, data);
      await repo.save(existing);
    } else {
      await repo.save(repo.create(data));
    }
  }

  /**
   * Helper to find organization by name (useful if ID is not provided)
   */
  async findOrgByName(name: string): Promise<Organization | null> {
    return this.orgRepo.findOne({ where: { name } });
  }

  /**
   * Aggregate data from all districts into the regional head organization
   */
  async aggregateDistricts(regionId: string, month: string) {
    this.logger.log(
      `Aggregating data for region: ${regionId}, month: ${month}`,
    );
    // 1. Get all child organizations
    const region = await this.orgRepo.findOne({
      where: { id: regionId },
      relations: ["children"],
    });

    if (!region || !region.children) {
      throw new Error("Region or districts not found");
    }

    const districtIds = region.children.map((d) => d.id);

    // 2. Aggregate each of the 7 tables
    for (let i = 1; i <= 7; i++) {
      await this.aggregateTable(i, regionId, districtIds, month);
    }

    return {
      success: true,
      message: `Aggregated data for ${region.children.length} districts`,
    };
  }

  private async aggregateTable(
    tableNum: number,
    parentId: string,
    childIds: string[],
    month: string,
  ) {
    const repo = this.getRepo(tableNum);

    // Get all records for children
    const childData = await repo.find({
      where: [
        { organization_id: parentId, period_month: month }, // Maybe exclude parent or update it
        ...childIds.map((id) => ({ organization_id: id, period_month: month })),
      ],
    });

    // Group by row_key
    const groupedByRow: Record<string, any[]> = {};
    childData.forEach((row) => {
      if (row.organization_id === parentId) return;
      let normalizedKey = row.row_key?.trim();
      if (!normalizedKey) return;

      const lowerKey = normalizedKey.toLowerCase();
      if (
        lowerKey === "jami" ||
        lowerKey === "итого" ||
        lowerKey === "total" ||
        lowerKey.includes("жами (жами)")
      ) {
        normalizedKey = "summary";
      }

      if (!groupedByRow[normalizedKey]) {
        groupedByRow[normalizedKey] = [];
      }
      groupedByRow[normalizedKey].push(row);
    });

    // Sum values for each row_key
    for (const rowKey in groupedByRow) {
      const rows = groupedByRow[rowKey];
      const aggregatedRow = this.sumRows(
        rows,
        parentId,
        month,
        rowKey,
        tableNum,
      );

      // Save or Update parent's record
      const existing = await repo.findOne({
        where: {
          organization_id: parentId,
          period_month: month,
          row_key: rowKey,
        },
      });

      if (existing) {
        Object.assign(existing, aggregatedRow);
        await repo.save(existing);
      } else {
        const newRecord = repo.create(aggregatedRow);
        await repo.save(newRecord);
      }
    }
  }

  private sumRows(
    rows: any[],
    organization_id: string,
    period_month: string,
    row_key: string,
    tableNum: number,
  ) {
    const result: any = { organization_id, period_month, row_key };

    const numericFields = this.getNumericFields(tableNum);

    numericFields.forEach((field) => {
      result[field] = rows.reduce((sum, row) => sum + (row[field] || 0), 0);
    });

    return result;
  }

  private getRepo(num: number): Repository<any> {
    switch (num) {
      case 1:
        return this.table1Repo;
      case 2:
        return this.table2Repo;
      case 3:
        return this.table3Repo;
      case 4:
        return this.table4Repo;
      case 5:
        return this.table5Repo;
      case 6:
        return this.table6Repo;
      case 7:
        return this.table7Repo;
      default:
        throw new Error(`Invalid table number: ${num}`);
    }
  }

  private getNumericFields(num: number): string[] {
    switch (num) {
      case 1:
        return [
          "oral_prev",
          "oral_curr",
          "written_prev",
          "written_curr",
          "electronic_prev",
          "electronic_curr",
          "total_prev",
          "total_curr",
        ];
      case 2:
        return [
          "total_prev",
          "total_curr",
          "written_prev",
          "written_curr",
          "electronic_prev",
          "electronic_curr",
          "oral_prev",
          "oral_curr",
          "under_control",
          "measures_taken",
          "explained",
          "rejected",
          "being_considered",
          "repeated",
          "overdue",
        ];
      case 3:
        return [
          "total_prev",
          "total_curr",
          "phys_prev",
          "phys_curr",
          "legal_prev",
          "legal_curr",
          "written",
          "electronic",
          "oral_total",
          "oral_leader_personal",
          "oral_leader_field",
          "oral_staff",
          "oral_phone",
          "ministry_routing",
          "regional_routing",
          "local_routing",
          "being_considered",
          "ministry_from_prev",
          "ministry_from_curr",
          "field_meetings_prev",
          "field_meetings_curr",
        ];
      case 4:
        return ["count_prev", "count_curr"];
      case 5:
        return [
          "total_prev",
          "total_curr",
          "phys_total_prev",
          "phys_total_curr",
          "phys_ariza_prev",
          "phys_ariza_curr",
          "phys_shikoyat_prev",
          "phys_shikoyat_curr",
          "phys_taklif_prev",
          "phys_taklif_curr",
          "legal_total_prev",
          "legal_total_curr",
          "legal_ariza_prev",
          "legal_ariza_curr",
          "legal_shikoyat_prev",
          "legal_shikoyat_curr",
          "legal_taklif_prev",
          "legal_taklif_curr",
        ];
      case 6:
        return [
          "people_total_prev",
          "people_total_curr",
          "people_satisfied_prev",
          "people_satisfied_curr",
          "people_explained_prev",
          "people_explained_curr",
          "people_routed_prev",
          "people_routed_curr",
          "people_rejected_prev",
          "people_rejected_curr",
          "people_not_considered_prev",
          "people_not_considered_curr",
          "people_being_considered_prev",
          "people_being_considered_curr",
          "people_overdue_prev",
          "people_overdue_curr",
          "virtual_total_prev",
          "virtual_total_curr",
          "virtual_satisfied_prev",
          "virtual_satisfied_curr",
          "virtual_explained_prev",
          "virtual_explained_curr",
          "virtual_routed_prev",
          "virtual_routed_curr",
          "virtual_rejected_prev",
          "virtual_rejected_curr",
          "virtual_not_considered_prev",
          "virtual_not_considered_curr",
          "virtual_being_considered_prev",
          "virtual_being_considered_curr",
          "virtual_overdue_prev",
          "virtual_overdue_curr",
        ];
      case 7:
        return [
          "fine_prev",
          "fine_curr",
          "reprimand_prev",
          "reprimand_curr",
          "dismissal_prev",
          "dismissal_curr",
          "disciplinary_total_prev",
          "disciplinary_total_curr",
          "administrative_prev",
          "administrative_curr",
          "criminal_prev",
          "criminal_curr",
          "grand_total_prev",
          "grand_total_curr",
        ];
      default:
        return [];
    }
  }
}

/*
 * [ORIGINAL_REDACTED_CODE_PRESERVATION]
 *
 * async saveTableRow(repo: Repository<any>, data: any) {
 *   const existing = await repo.findOne({ ... });
 *   if (existing) { Object.assign(existing, data); await repo.save(existing); }
 *   else { await repo.save(repo.create(data)); }
 * }
 */
