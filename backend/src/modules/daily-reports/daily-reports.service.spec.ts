import { Test, TestingModule } from "@nestjs/testing";
import { DailyReportsService } from "./daily-reports.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { HepatitisDailyReport } from "./entities/hepatitis-daily-report.entity";
import { FluDailyReport } from "./entities/flu-daily-report.entity";
import { AriDailyReport } from "./entities/ari-daily-report.entity";
import { EpidemiologyDailyReport } from "./entities/epidemiology-daily-report.entity";
import { CovidDailyReport } from "./entities/covid-daily-report.entity";
import { DiarrheaDailyReport } from "./entities/diarrhea-daily-report.entity";
import { SanitaryDailyReport } from "./entities/sanitary-daily-report.entity";
import { User } from "../users/entities/user.entity";
import { Organization } from "../organizations/entities/organization.entity";
import { UserRole } from "../../common/enums/role.enum";
import { ReportStatus } from "../../common/enums/report-status.enum";

import { TelegramService } from "../telegram/telegram.service";
import { SubmissionsService } from "../submissions/submissions.service";
import { ExportsService } from "../exports/exports.service";

describe("DailyReportsService (Isolation Guard)", () => {
  let service: DailyReportsService;
  let reportRepo: any;

  beforeEach(async () => {
    reportRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DailyReportsService,
        {
          provide: getRepositoryToken(HepatitisDailyReport),
          useValue: reportRepo,
        },
        { provide: getRepositoryToken(FluDailyReport), useValue: {} },
        { provide: getRepositoryToken(AriDailyReport), useValue: {} },
        { provide: getRepositoryToken(EpidemiologyDailyReport), useValue: {} },
        { provide: getRepositoryToken(CovidDailyReport), useValue: {} },
        { provide: getRepositoryToken(DiarrheaDailyReport), useValue: {} },
        { provide: getRepositoryToken(SanitaryDailyReport), useValue: {} },
        { provide: getRepositoryToken(Organization), useValue: {} },
        {
          provide: TelegramService,
          useValue: { sendReportNotification: jest.fn() },
        },
        { provide: SubmissionsService, useValue: {} },
        { provide: ExportsService, useValue: {} },
      ],
    }).compile();

    service = module.get<DailyReportsService>(DailyReportsService);
  });

  describe("validateIsolation (Private Method Check via Public Methods)", () => {
    it("should throw error if a District user try to submit report of another organization", async () => {
      const districtUser = {
        id: "user1",
        role: UserRole.DISTRICT_SPECIALIST,
        organization: { id: "org-A" },
      } as User;

      const reportFromOrgB = {
        id: "report1",
        status: ReportStatus.DRAFT,
        organization: { id: "org-B" },
      };

      reportRepo.findOne.mockResolvedValue(reportFromOrgB);

      await expect(
        service.submit("hepatitis", "report1", districtUser),
      ).rejects.toThrow(
        "Siz faqat o'z tashkilotingiz uchun ma'lumot kiritishingiz mumkin.",
      );
    });

    it("should allow if the organization matches", async () => {
      const districtUser = {
        id: "user1",
        role: UserRole.DISTRICT_SPECIALIST,
        organization: { id: "org-A" },
      } as User;

      const reportFromOrgA = {
        id: "report1",
        status: ReportStatus.DRAFT,
        organization: { id: "org-A" },
      };

      reportRepo.findOne.mockResolvedValue(reportFromOrgA);
      reportRepo.save.mockResolvedValue({
        ...reportFromOrgA,
        status: ReportStatus.SUBMITTED,
      });

      const result = await service.submit("hepatitis", "report1", districtUser);
      expect(result.status).toBe(ReportStatus.SUBMITTED);
    });
  });
});
