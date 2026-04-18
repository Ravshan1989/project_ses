import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { AppealsService } from "./appeals.service";
import {
  AppealRecord,
  AppealStatus,
  AppealChannel,
  ApplicantType,
  AppealType,
  DisciplinaryMeasure,
} from "./entities/appeal-record.entity";
import { AppealsTable1 } from "./entities/appeals-table-1.entity";
import { AppealsTable2 } from "./entities/appeals-table-2.entity";
import { AppealsTable3 } from "./entities/appeals-table-3.entity";
import { AppealsTable4 } from "./entities/appeals-table-4.entity";
import { AppealsTable5 } from "./entities/appeals-table-5.entity";
import { AppealsTable6 } from "./entities/appeals-table-6.entity";
import { AppealsTable7 } from "./entities/appeals-table-7.entity";
import { Organization } from "../organizations/entities/organization.entity";
import dayjs from "dayjs";

describe("AppealsService (Guardrail Tests)", () => {
  let service: AppealsService;
  let recordRepo: any;
  let orgRepo: any;

  beforeEach(async () => {
    recordRepo = {
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest
        .fn()
        .mockImplementation((record) =>
          Promise.resolve({ id: "rec-123", ...record }),
        ),
      find: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      }),
    };

    orgRepo = {
      findOne: jest.fn(),
    };

    const mockTableRepo = { find: jest.fn().mockResolvedValue([]) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppealsService,
        { provide: getRepositoryToken(AppealRecord), useValue: recordRepo },
        { provide: getRepositoryToken(Organization), useValue: orgRepo },
        { provide: getRepositoryToken(AppealsTable1), useValue: mockTableRepo },
        { provide: getRepositoryToken(AppealsTable2), useValue: mockTableRepo },
        { provide: getRepositoryToken(AppealsTable3), useValue: mockTableRepo },
        { provide: getRepositoryToken(AppealsTable4), useValue: mockTableRepo },
        { provide: getRepositoryToken(AppealsTable5), useValue: mockTableRepo },
        { provide: getRepositoryToken(AppealsTable6), useValue: mockTableRepo },
        { provide: getRepositoryToken(AppealsTable7), useValue: mockTableRepo },
      ],
    }).compile();

    service = module.get<AppealsService>(AppealsService);
  });

  describe("Record Management", () => {
    it("should create an appeal record", async () => {
      const dto = {
        organization_id: "org-1",
        period_month: "2024-03",
        applicant_name: "John Doe",
        recipient: "head",
      };
      const result = await service.createRecord(dto as any, "user-1");
      expect(result.applicant_name).toBe("John Doe");
      expect(result.organization.id).toBe("org-1");
      expect(recordRepo.save).toHaveBeenCalled();
    });

    it("should close a record and mark as overdue if applicable", async () => {
      const existingRecord = {
        id: "rec-1",
        deadline_date: "2024-03-01",
        status: AppealStatus.BEING_CONSIDERED,
      };
      recordRepo.findOne.mockResolvedValue(existingRecord);

      const closureDate = "2024-03-05"; // After deadline
      const result = await service.closeRecord(
        "rec-1",
        AppealStatus.SATISFIED,
        closureDate,
      );

      expect(result.status).toBe(AppealStatus.SATISFIED);
      expect(result.is_overdue).toBe(true);
      expect(recordRepo.save).toHaveBeenCalled();
    });
  });

  describe("Report Generation Logic", () => {
    it("should aggregate data for Table 1 (Recipients)", async () => {
      const mockRecords = [
        {
          recipient: "head",
          channel: AppealChannel.ORAL,
          period_month: "2024-03",
        },
        {
          recipient: "head",
          channel: AppealChannel.ORAL,
          period_month: "2024-03",
        },
        {
          recipient: "deputy_epid",
          channel: AppealChannel.WRITTEN,
          period_month: "2024-03",
        },
      ];

      jest
        .spyOn(service, "getRecordsForReporting")
        .mockResolvedValue(mockRecords as any);
      orgRepo.findOne.mockResolvedValue({ id: "org-1" });

      const reports = await service.generateReportsFromRecords(
        "org-1",
        "2024-03",
      );

      expect(reports.table1.head.total_curr).toBe(2);
      expect(reports.table1.head.oral_curr).toBe(2);
      expect(reports.table1.deputy_epid.total_curr).toBe(1);
    });

    it("should aggregate data for Table 5 (Types)", async () => {
      const mockRecords = [
        {
          applicant_type: ApplicantType.PHYSICAL,
          appeal_type: AppealType.ARIZA,
          period_month: "2024-03",
        },
        {
          applicant_type: ApplicantType.LEGAL,
          appeal_type: AppealType.ARIZA,
          period_month: "2024-03",
        },
      ];

      jest
        .spyOn(service, "getRecordsForReporting")
        .mockResolvedValue(mockRecords as any);
      orgRepo.findOne.mockResolvedValue({ id: "org-1" });

      const reports = await service.generateReportsFromRecords(
        "org-1",
        "2024-03",
      );

      expect(reports.table5.phys_ariza_curr).toBe(1);
      expect(reports.table5.legal_ariza_curr).toBe(1);
    });
  });
});
