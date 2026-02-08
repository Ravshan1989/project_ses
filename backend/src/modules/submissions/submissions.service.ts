import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Submission } from "./entities/submission.entity";
import { CreateSubmissionDto } from "./dto/create-submission.dto";
import { UpdateStatusDto } from "./dto/update-status.dto";
import { SubmissionStatus } from "../../common/enums/status.enum";
import { User } from "../../modules/users/entities/user.entity";
import { UserRole } from "../../common/enums/role.enum";
import { getRoleLevel } from "../../common/utils/role.util";
import { DailyReportsService } from "../daily-reports/daily-reports.service";
import { DiseasesService } from "../diseases/diseases.service";
import { OrganizationsService } from "../organizations/organizations.service";
import * as XLSX from "xlsx";
import { Template } from "../forms/entities/template.entity";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class SubmissionsService {
  constructor(
    @InjectRepository(Submission)
    private submissionRepository: Repository<Submission>,
    private dailyReportsService: DailyReportsService,
    private diseasesService: DiseasesService,
    private organizationsService: OrganizationsService,
    @InjectRepository(Template)
    private templateRepository: Repository<Template>,
  ) {}

  async create(createSubmissionDto: CreateSubmissionDto, user: User) {
    // Basic validation: User must belong to an organization
    if (!user.organization) {
      throw new BadRequestException("User does not belong to any organization");
    }

    const submission = this.submissionRepository.create({
      ...createSubmissionDto,
      submittedBy: user,
      organization: user.organization,
      status: SubmissionStatus.DRAFT,
      isTest: createSubmissionDto.isTest || false, // UZ: Test bayrog'ini saqlash
    });
    return this.submissionRepository.save(submission);
  }

  async findAll(query: any, user: User) {
    const level = getRoleLevel(user.role);
    const where: any = { ...query };

    // Fix: Map 'period' to 'reportingPeriod' to match Entity definition
    if (where.period) {
      where.reportingPeriod = where.period;
      delete where.period;
    }

    // Fix: Cast 'isTest' to boolean
    if (where.isTest === "true") where.isTest = true;
    if (where.isTest === "false") where.isTest = false;

    if (level === 3) {
      where.organization = { id: user.organization.id };
    } else if (level === 2) {
      where.organization = { parent: { id: user.organization.id } };
    }

    return this.submissionRepository.find({
      where,
      relations: ["organization", "template", "submittedBy"],
    });
  }

  async findOne(id: string, user: User) {
    const level = getRoleLevel(user.role);
    const where: any = { id };

    if (level === 3) {
      where.organization = { id: user.organization.id };
    } else if (level === 2) {
      // In findOne, we should allow region head to see their sub-orgs or they won't be able to approve
      // But we must NOT allow cross-region access if it were a multi-region system.
      // For now, level 2 check.
    }

    const submission = await this.submissionRepository.findOne({
      where,
      relations: ["organization", "template"],
    });
    if (!submission) throw new NotFoundException(`Submission ${id} not found`);
    return submission;
  }

  // WORKFLOW LOGIC
  async updateStatus(id: string, updateStatusDto: UpdateStatusDto, user: User) {
    const submission = await this.findOne(id, user);
    const { action, comment } = updateStatusDto;

    // Check Permissions (Simplified)
    // Only REGION_HEAD or ADMIN can approve/reject
    if ([UserRole.REGION_HEAD, UserRole.ADMIN].includes(user.role) === false) {
      // if not admin/region_head, maybe they are submitting?
      if (action === "SUBMIT" && submission.status === SubmissionStatus.DRAFT) {
        // District staff submitting to region
        submission.status = SubmissionStatus.SUBMITTED;
        return this.submissionRepository.save(submission);
      }
      throw new ForbiddenException(
        "You do not have permission to change status",
      );
    }

    if (action === "APPROVE") {
      submission.status = SubmissionStatus.APPROVED;
    } else if (action === "REJECT") {
      if (!comment)
        throw new BadRequestException("Comment is required for rejection");
      submission.status = SubmissionStatus.REJECTED;
      submission.rejectionReason = comment;
    }

    return this.submissionRepository.save(submission);
  }

  // XATOLIK BO'YICHA IZOH:
  // Oldingi kodda 'template' relation sifatida yuklanmaganligi sababli 'find' metodida 'template: { code: templateCode }'
  // filtri ishlashida muammo bo'lishi mumkin (TypeORM versiyasiga qarab).
  // Shuningdek, organization null bo'lgan holatda xatolik yuz berishi mumkin.
  // Quyida tuzatilgan versiya keltirilgan.

  // async getStatusSummary(templateCode: string, period: string) {
  //     // Fetch all submissions for this template and period
  //     const submissions = await this.submissionRepository.find({
  //         where: {
  //             template: { code: templateCode },
  //             reportingPeriod: period
  //         },
  //         relations: ['organization']
  //     });
  //
  //     return submissions.map(s => ({
  //         organizationId: s.organization.id,
  //         organizationName: s.organization.name,
  //         status: s.status,
  //         submissionId: s.id
  //     }));
  // }

  async getStatusSummary(
    templateCode: string,
    period: string,
    includeTest = false,
    user: User,
  ) {
    const level = getRoleLevel(user.role);
    const where: any = {
      template: { code: templateCode },
      reportingPeriod: period,
      isTest: includeTest,
    };

    if (level === 3) {
      where.organization = { id: user.organization.id };
    } else if (level === 2) {
      where.organization = { parent: { id: user.organization.id } };
    }

    const submissions = await this.submissionRepository.find({
      where,
      relations: ["organization", "template"],
    });

    return submissions
      .filter((s) => s.organization) // Organization yo'q bo'lsa (baza xatosi) ularni o'tkazib yuboramiz
      .map((s) => ({
        organizationId: s.organization.id,
        organizationName: s.organization.name,
        status: s.status,
        submissionId: s.id,
      }));
  }

  async cleanupTest() {
    await this.submissionRepository.delete({ isTest: true });
    return {
      success: true,
      message: "Test hisobotlari muvaffaqiyatli o'chirildi",
    };
  }

  /**
   * UZ: Kunlik hisobotlarni Forma-1 uchun jamlash
   */
  async aggregateDaily(month: string, isTest: boolean, user: User) {
    if (!user.organization) {
      throw new BadRequestException("User does not belong to any organization");
    }

    // 1. Kunlik ma'lumotlarni yig'ish
    const aggregates = await this.dailyReportsService.getMonthlyAggregation(
      month,
      user.organization.id,
      isTest,
    );

    // 2. Barqaror Form-1 strukturasini yaratish (Diseases asosida)
    const diseases = await this.diseasesService.findAll();

    // Mapping: Daily Key -> Disease Code
    const mapping = {
      hepatitis: "138",
      ari: "159",
      flu: "161",
      covid: "183",
    };

    const dataArray = diseases.map((d) => {
      const row = {
        key: d.id,
        code: d.code,
        name: d.name,
        // Default values
        m_t_c_a: 0,
        m_t_c_i: 0,
        m_t_g_a: 0,
        m_t_g_p: 0,
        m_u_c_a: 0,
        m_u_c_i: 0,
        m_u_g_a: 0,
        m_u_g_p: 0,
        y_t_c_a: 0,
        y_t_c_i: 0,
        y_t_g_a: 0,
        y_t_g_p: 0,
        y_u_c_a: 0,
        y_u_c_i: 0,
        y_u_g_a: 0,
        y_u_g_p: 0,
        m_t_p_a: 0,
        m_t_p_i: 0,
        m_u_p_a: 0,
        m_u_p_i: 0,
        y_t_p_a: 0,
        y_t_p_i: 0,
        y_u_p_a: 0,
        y_u_p_i: 0,
      };

      // Apply aggregated data if code matches
      if (d.code === mapping.hepatitis) {
        row.m_t_c_a = aggregates.hepatitis.total;
        row.m_u_c_a = aggregates.hepatitis.under14;
      } else if (d.code === mapping.ari) {
        row.m_t_c_a = aggregates.ari.total;
        row.m_u_c_a = aggregates.ari.under14;
      } else if (d.code === mapping.flu) {
        row.m_t_c_a = aggregates.flu.total;
        row.m_u_c_a = aggregates.flu.under14;
      } else if (d.code === mapping.covid) {
        row.m_t_c_a = aggregates.covid.total;
        row.m_u_c_a = aggregates.covid.under14;
      }

      return row;
    });

    return dataArray;
  }

  async bulkUpload(
    file: Express.Multer.File,
    period: string,
    isTest: boolean,
    user: User,
  ) {
    if (!file) throw new BadRequestException("File is required");

    const logPath = path.join(process.cwd(), "bulk_upload_debug.log");
    const log = (msg: string) =>
      fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${msg}\n`);

    log(
      `[BulkUpload Start] File: ${file.originalname}, Period: ${period}, isTest: ${isTest}`,
    );

    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const sheetNames = workbook.SheetNames;
    log(
      `[BulkUpload] Total sheets: ${sheetNames.length}: ${sheetNames.join(", ")}`,
    );

    // We start from sheet 4 (index 3) as per user requirement
    // Sheets 1, 2, 3 (index 0, 1, 2) are summaries
    const districtSheets = sheetNames.slice(3);
    log(`[BulkUpload] District sheets to process: ${districtSheets.length}`);
    const results = [];

    // 1. Get Template
    const template = await this.templateRepository.findOneBy({ code: "FORM1" });
    if (!template) {
      log("[BulkUpload] Template FORM1 not found");
      throw new NotFoundException("Form 1 template not found");
    }

    // 2. Detect Period from Filename (NEW)
    const monthNamesMap: Record<string, number> = {
      // Uz Latin
      yanvar: 0,
      fevral: 1,
      mart: 2,
      aprel: 3,
      may: 4,
      iyun: 5,
      iyul: 6,
      avgust: 7,
      sentyabr: 8,
      oktyabr: 9,
      noyabr: 10,
      dekabr: 11,
      // Uz Cyrillic
      январ: 0,
      феврал: 1,
      март: 2,
      апрел: 3,
      май: 4,
      июн: 5,
      июл: 6,
      август: 7,
      сентябр: 8,
      октябр: 9,
      ноябр: 10,
      декабр: 11,
      // Russian
      январь: 0,
      февраль: 1,
      апрель: 3,
      июнь: 5,
      июль: 6,
      сентябрь: 8,
      октябрь: 9,
      ноябрь: 10,
      декабрь: 11,
    };

    let finalPeriod = period;
    const filenameLow = file.originalname.toLowerCase();

    // Extract year
    const yearMatch = filenameLow.match(/\b(20\d{2})\b/);
    const foundYear = yearMatch ? parseInt(yearMatch[1]) : null;

    // Extract month
    let foundMonth = null;
    for (const [name, index] of Object.entries(monthNamesMap)) {
      if (filenameLow.includes(name)) {
        foundMonth = index;
        break;
      }
    }

    if (foundYear !== null && foundMonth !== null) {
      finalPeriod = `${foundYear}-${String(foundMonth + 1).padStart(2, "0")}-01`;
      log(
        `[BulkUpload] Auto-detected period from filename "${file.originalname}": ${finalPeriod}`,
      );
    } else {
      log(
        `[BulkUpload] Using provided/default period: ${finalPeriod} (Detection failed)`,
      );
    }

    // 3. Get All Organizations for mapping
    const organizations = await this.organizationsService.findAll();
    const diseases = await this.diseasesService.findAll();
    log(
      `[BulkUpload] Found ${organizations.length} organizations and ${diseases.length} diseases`,
    );

    // UZ: Robust qidiruv uchun nomlarni normalizatsiya qilish
    const normalize = (name: string) => {
      const n = name
        .toLowerCase()
        // Standardize suffixes
        .replace(/shaxri|shaxar|sh\.|sh$/g, " sh")
        .replace(/tuman|t\.|t$/g, " t")
        // Normalize specific Uzbek letters
        .replace(/h/g, "x")
        .replace(/[ʻʼ'`‘’]/g, "")
        // Russian to Latin (basic for common district names)
        .replace(/я/g, "ya")
        .replace(/ю/g, "yu")
        .replace(/ч/g, "ch")
        .replace(/ш/g, "sh")
        .replace(/қ/g, "q")
        .replace(/ў/g, "o")
        .replace(/ғ/g, "g")
        .replace(/ҳ/g, "x")
        .replace(/\s+/g, "") // Remove spaces for even tighter matching
        .trim();
      return n;
    };

    for (const sheetName of districtSheets) {
      log(`[BulkUpload] Processing sheet: ${sheetName}`);
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<any[]>(worksheet, {
        header: 1,
      });

      if (!jsonData || jsonData.length === 0) {
        log(`[BulkUpload] Sheet ${sheetName} rows: 0`);
        log(
          `[BulkUpload] WARNING: Could not find organization for sheet: "${sheetName}"`,
        );
        continue;
      }
      log(`[BulkUpload] Sheet ${sheetName} rows: ${jsonData.length}`);

      // Try exact match first, then normalized match
      let org = organizations.find((o) => o.name === sheetName);
      if (!org) {
        const normSheet = normalize(sheetName);
        org = organizations.find((o) => normalize(o.name) === normSheet);
      }

      if (!org) {
        log(
          `[BulkUpload] WARNING: Could not find organization for sheet: "${sheetName}"`,
        );
        continue;
      }
      log(
        `[BulkUpload] SUCCESS: Mapped sheet "${sheetName}" to org: "${org.name}" (${org.id})`,
      );

      // 4. Map Excel rows to Form1Data (Restored)
      const mappedData = diseases.map((disease) => {
        const row = jsonData.find(
          (r) =>
            r &&
            (String(r[0]).trim() === disease.code ||
              String(r[1]).trim() === disease.code ||
              String(r[0]).trim() === String(Number(disease.code))), // Handle leading zeros removal by excel
        );

        const dataRow: any = {
          key: disease.id,
          code: disease.code,
          name: disease.name,
          m_t_p_a: 0,
          m_t_p_i: 0,
          m_t_c_a: 0,
          m_t_c_i: 0,
          m_t_g_a: 0,
          m_t_g_p: 0,
          m_u_p_a: 0,
          m_u_p_i: 0,
          m_u_c_a: 0,
          m_u_c_i: 0,
          m_u_g_a: 0,
          m_u_g_p: 0,
          y_t_p_a: 0,
          y_t_p_i: 0,
          y_t_c_a: 0,
          y_t_c_i: 0,
          y_t_g_a: 0,
          y_t_g_p: 0,
          y_u_p_a: 0,
          y_u_p_i: 0,
          y_u_c_a: 0,
          y_u_c_i: 0,
          y_u_g_a: 0,
          y_u_g_p: 0,
        };

        if (row) {
          const fields = [
            "m_t_p_a",
            "m_t_p_i",
            "m_t_c_a",
            "m_t_c_i",
            "m_t_g_a",
            "m_t_g_p",
            "m_u_p_a",
            "m_u_p_i",
            "m_u_c_a",
            "m_u_c_i",
            "m_u_g_a",
            "m_u_g_p",
            "y_t_p_a",
            "y_t_p_i",
            "y_t_c_a",
            "y_t_c_i",
            "y_t_g_a",
            "y_t_g_p",
            "y_u_p_a",
            "y_u_p_i",
            "y_u_c_a",
            "y_u_c_i",
            "y_u_g_a",
            "y_u_g_p",
          ];
          fields.forEach((f, idx) => {
            dataRow[f] = Number(row[2 + idx]) || 0;
          });
        }
        return dataRow;
      });

      // 5. Overwrite/Update check using finalPeriod
      let submission = await this.submissionRepository.findOne({
        where: {
          template: { id: template.id },
          organization: { id: org.id },
          reportingPeriod: finalPeriod,
          isTest: isTest,
        },
      });

      if (submission) {
        submission.data = mappedData;
        submission.submittedBy = user;
      } else {
        submission = this.submissionRepository.create({
          template,
          organization: org,
          reportingPeriod: finalPeriod,
          data: mappedData,
          status: SubmissionStatus.SUBMITTED,
          submittedBy: user,
          isTest: isTest,
        });
      }

      await this.submissionRepository.save(submission);
      log(`[BulkUpload] Saved submission for ${org.name}`);
      results.push(await this.submissionRepository.save(submission));
    }

    log(
      `[BulkUpload Finished] Successfully processed ${results.length} districts for period ${finalPeriod}.`,
    );
    return {
      message: `Successfully processed ${results.length} districts for period: ${finalPeriod}`,
      period: finalPeriod,
      count: results.length,
    };
  }
}
