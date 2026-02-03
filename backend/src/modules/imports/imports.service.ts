import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as XLSX from "xlsx";
import { HepatitisDailyReport } from "../daily-reports/entities/hepatitis-daily-report.entity";
import { FluDailyReport } from "../daily-reports/entities/flu-daily-report.entity";
import { Organization } from "../organizations/entities/organization.entity";
import { Submission } from "../submissions/entities/submission.entity";
import { Template } from "../forms/entities/template.entity";
import { SubmissionStatus } from "../../common/enums/status.enum";

@Injectable()
export class ImportsService {
  constructor(
    @InjectRepository(HepatitisDailyReport)
    private readonly hepatitisRepo: Repository<HepatitisDailyReport>,

    @InjectRepository(FluDailyReport)
    private readonly fluRepo: Repository<FluDailyReport>,

    @InjectRepository(Organization)
    private readonly organizationRepo: Repository<Organization>,

    @InjectRepository(Submission)
    private readonly submissionRepo: Repository<Submission>,

    @InjectRepository(Template)
    private readonly templateRepo: Repository<Template>,
  ) {}

  async processImport(file: Express.Multer.File, type: string) {
    try {
      const workbook = XLSX.read(file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);

      if (!data || data.length === 0) {
        throw new BadRequestException("Fayl bo'sh yoki noto'g'ri formatda");
      }

      // Viloyat darajasida tumanlarni aniqlashimiz kerak.
      // Excelda 'Tuman' yoki 'district_name' ustuni bo'lishi kerak.
      // Biz avval barcha tumanlarni olib olamiz map qilish uchun
      const organizations = await this.organizationRepo.find();

      let savedCount = 0;
      const errors = [];

      for (const row of data) {
        try {
          const orgName = row["Tuman"] || row["district_name"] || row["Hudud"];
          if (!orgName) continue; // Tuman nomi yo'q qatorlarni tashlab ketamiz

          const organization = organizations.find(
            (o) =>
              o.name.toLowerCase().includes(orgName.toString().toLowerCase()) ||
              orgName.toString().toLowerCase().includes(o.name.toLowerCase()),
          );

          if (!organization) {
            errors.push(`Tuman topilmadi: ${orgName}`);
            continue;
          }

          // Sanani aniqlash (Excelda sana turli formatda bo'lishi mumkin)
          // Row da 'Sanasi' yoki 'reportDate' bo'lishi kutiladi
          let reportDate = row["Sanasi"] || row["reportDate"];

          // Excel date serial number fix or string parse here if needed
          // Assuming standard string for simplicity or ISO
          if (!reportDate) {
            // Agar sana qatorda bo'lmasa, bugungi kunni olish noto'g'ri bo'lishi mumkin tarixiy data uchun.
            // Lekin talabda "yil va hajmidan qat'i nazar" deyilgan.
            // Demak sana bo'lishi SHART.
            errors.push(`${orgName}: Sana ko'rsatilmagan`);
            continue;
          }

          // Excel sana formatini to'g'irlash (agar raqam kelsa)
          if (typeof reportDate === "number") {
            // Excel epoch dates conversion roughly
            const date = new Date((reportDate - (25567 + 2)) * 86400 * 1000);
            reportDate = date.toISOString().split("T")[0];
          }

          if (type === "hepatitis") {
            await this.upsertHepatitis(row, organization, reportDate);
          } else if (type === "flu") {
            await this.upsertFlu(row, organization, reportDate);
          } else if (type === "form1") {
            await this.upsertForm1(row, organization, reportDate);
          }
          savedCount++;
        } catch (e) {
          errors.push(`Xatolik qatorda: ${JSON.stringify(row)} - ${e.message}`);
        }
      }

      return {
        success: true,
        imported_count: savedCount,
        errors: errors,
      };
    } catch (error) {
      console.error("Import error:", error);
      throw new BadRequestException(
        "Faylni o'qishda xatolik: " + error.message,
      );
    }
  }

  private async upsertHepatitis(
    row: any,
    organization: Organization,
    reportDate: string,
  ) {
    // Map row keys to entity columns.
    // E.g 'Jami holatlar' -> total_cases

    const entityData = {
      reportDate: reportDate,
      organization: { id: organization.id },
      total_cases: Number(row["Jami holatlar"] || row["total_cases"] || 0),
      age_under_1: Number(row["1 yoshgacha"] || row["age_under_1"] || 0),
      age_1_3: Number(row["1-3 yosh"] || row["age_1_3"] || 0),
      age_4_6: Number(row["4-6 yosh"] || row["age_4_6"] || 0),
      age_7_14: Number(row["7-14 yosh"] || row["age_7_14"] || 0),
      age_15_19: Number(row["15-19 yosh"] || row["age_15_19"] || 0),
      age_20_plus: Number(row["20+ yosh"] || row["age_20_plus"] || 0),
      // ... va hokazo boshqa maydonlar
      occ_unorganized: Number(row["Uyushmagan"] || row["occ_unorganized"] || 0),
      occ_students: Number(row["O'quvchilar"] || row["occ_students"] || 0),
      // Simple fields mapping for demo
    };

    // Check existing
    let report = await this.hepatitisRepo.findOne({
      where: { reportDate: reportDate, organization: { id: organization.id } },
    });

    if (report) {
      Object.assign(report, entityData); // Update
    } else {
      report = this.hepatitisRepo.create(entityData); // Create
    }
    await this.hepatitisRepo.save(report);
  }

  private async upsertFlu(
    row: any,
    organization: Organization,
    reportDate: string,
  ) {
    const entityData = {
      reportDate: reportDate,
      organization: { id: organization.id },
      total_ari: Number(row["Jami O'RVI"] || row["total_ari"] || 0),
      pneumonia_total: Number(
        row["Pnevmoniya Jami"] || row["pneumonia_total"] || 0,
      ),
      flu_total: Number(row["Gripp Jami"] || row["flu_total"] || 0),
      // ... qolgan maydonlar
    };

    let report = await this.fluRepo.findOne({
      where: { reportDate: reportDate, organization: { id: organization.id } },
    });

    if (report) {
      Object.assign(report, entityData);
    } else {
      report = this.fluRepo.create(entityData);
    }
    await this.fluRepo.save(report);
  }

  private async upsertForm1(
    row: any,
    organization: Organization,
    reportDate: string,
  ) {
    // Form 1 is monthly. We set it to the first day of that month.
    const dateObj = new Date(reportDate);
    const reportingPeriod = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-01`;

    const template = await this.templateRepo.findOne({
      where: { code: "form_1" },
    });
    // Agar template bo'lmasa, uni yaratishga harakat qilmaymiz, chunki u oldindan bo'lishi kerak.
    // Lekin xatolik qaytarish ham yomon.
    if (!template) {
      throw new Error("Shakl 1 (form_1) shabloni topilmadi");
    }

    // Data JSON
    // Excel qatoridagi barcha ma'lumotlarni saqlaymiz, faqat xizmat ustunlaridan tashqari
    const record = { ...row };
    delete record["Tuman"];
    delete record["Hudud"];
    delete record["Sanasi"];
    delete record["reportDate"];

    let submission = await this.submissionRepo.findOne({
      where: {
        organization: { id: organization.id },
        template: { id: template.id },
        reportingPeriod: reportingPeriod,
      },
    });

    if (submission) {
      submission.data = [record]; // Save as array for consistency with frontend
      submission.status = SubmissionStatus.SUBMITTED;
    } else {
      submission = this.submissionRepo.create({
        organization: { id: organization.id },
        template: { id: template.id },
        reportingPeriod: reportingPeriod,
        data: [record], // Save as array
        status: SubmissionStatus.SUBMITTED,
      });
    }
    await this.submissionRepo.save(submission);
  }
}
