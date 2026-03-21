import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { AnalysisService } from "./analysis.service";
import { Organization } from "../organizations/entities/organization.entity";
import { HepatitisDailyReport } from "../daily-reports/entities/hepatitis-daily-report.entity";
import { FluDailyReport } from "../daily-reports/entities/flu-daily-report.entity";
import { AriDailyReport } from "../daily-reports/entities/ari-daily-report.entity";
import { CovidDailyReport } from "../daily-reports/entities/covid-daily-report.entity";
import { Submission } from "../submissions/entities/submission.entity";
import { Disease } from "../diseases/entities/disease.entity";
import { SosAlert } from "../sos/entities/sos-alert.entity";
import { ForecastingService } from "./forecasting.service";
import { User } from "../users/entities/user.entity";
import { UserRole } from "../../common/enums/role.enum";

describe("AnalysisService (Guardrail Tests)", () => {
  let service: AnalysisService;
  let orgRepo: any;
  let hepRepo: any;
  let diseaseRepo: any;

  beforeEach(async () => {
    const mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
      getRawMany: jest.fn().mockResolvedValue([]),
      leftJoin: jest.fn().mockReturnThis(),
    };

    orgRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      findOne: jest.fn(),
      find: jest.fn(),
    };

    hepRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    diseaseRepo = {
      find: jest
        .fn()
        .mockResolvedValue([{ id: "d-1", name: "Gepatit", isActive: true }]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalysisService,
        { provide: getRepositoryToken(Organization), useValue: orgRepo },
        {
          provide: getRepositoryToken(HepatitisDailyReport),
          useValue: hepRepo,
        },
        {
          provide: getRepositoryToken(FluDailyReport),
          useValue: { createQueryBuilder: () => mockQueryBuilder },
        },
        {
          provide: getRepositoryToken(AriDailyReport),
          useValue: { createQueryBuilder: () => mockQueryBuilder },
        },
        {
          provide: getRepositoryToken(CovidDailyReport),
          useValue: { createQueryBuilder: () => mockQueryBuilder },
        },
        {
          provide: getRepositoryToken(Submission),
          useValue: { createQueryBuilder: () => mockQueryBuilder },
        },
        { provide: getRepositoryToken(Disease), useValue: diseaseRepo },
        {
          provide: getRepositoryToken(SosAlert),
          useValue: { find: jest.fn() },
        },
        {
          provide: ForecastingService,
          useValue: { predictNext: jest.fn().mockReturnValue(10) },
        },
      ],
    }).compile();

    service = module.get<AnalysisService>(AnalysisService);
  });

  describe("Global Summary & RBAC", () => {
    it("should calculate incidence rate correctly for a district", async () => {
      const user = { role: UserRole.ADMIN } as User;
      const mockOrgs = [
        { id: "org-1", name: "District A", population: 100000 },
      ];
      orgRepo.createQueryBuilder().getMany.mockResolvedValue(mockOrgs);

      // Mock 50 cases for Gepatit
      hepRepo
        .createQueryBuilder()
        .getRawMany.mockResolvedValue([
          { organization_id: "org-1", total: "50" },
        ]);

      const result = await service.getGlobalSummary(
        "2024-03-01",
        "2024-03-31",
        user,
      );

      expect(result[0].organizationName).toBe("District A");
      // Rate = (50 / 100,000) * 100,000 = 50
      expect(result[0].diseases[0].rate).toBe(50);
    });

    it("should filter organizations by region for REGION_HEAD", async () => {
      const regionHead = {
        role: UserRole.REGION_HEAD,
        organization: { id: "reg-1" },
      } as User;

      await service.getGlobalSummary("2024-03-01", "2024-03-31", regionHead);

      expect(orgRepo.createQueryBuilder().where).toHaveBeenCalledWith(
        expect.stringContaining("org.parent.id = :parentId"),
        expect.objectContaining({ parentId: "reg-1" }),
      );
    });
  });

  describe("Incidence Rates", () => {
    it("should return empty array for unknown disease type", async () => {
      const user = { role: UserRole.ADMIN } as User;
      const result = await service.getIncidenceRates(
        { diseaseType: "unknown" } as any,
        user,
      );
      expect(result).toEqual([]);
    });

    it("should aggregate data for specific disease (covid)", async () => {
      const user = { role: UserRole.ADMIN } as User;
      const mockOrgs = [{ id: "org-1", name: "Dist A", population: 1000 }];
      orgRepo.createQueryBuilder().getMany.mockResolvedValue(mockOrgs);

      const result = await service.getIncidenceRates(
        {
          diseaseType: "covid",
          startDate: "2024-01-01",
          endDate: "2024-01-31",
        } as any,
        user,
      );

      expect(orgRepo.createQueryBuilder).toHaveBeenCalled();
      expect(result.length).toBe(1);
    });
  });
});
