import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { SosService } from "./sos.service";
import {
  SosAlert,
  SosStatus,
  SosReviewStatus,
} from "./entities/sos-alert.entity";
import { SosDisease } from "./entities/sos-disease.entity";
import { SosBotService } from "../telegram/sos-bot.service";
import { User } from "../users/entities/user.entity";
import { UserRole } from "../../common/enums/role.enum";
import { ForbiddenException } from "@nestjs/common";

describe("SosService (Guardrail Tests)", () => {
  let service: SosService;
  let alertRepo: any;
  let diseaseRepo: any;
  let botService: any;

  beforeEach(async () => {
    alertRepo = {
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest
        .fn()
        .mockImplementation((alert) =>
          Promise.resolve({ id: "alert-123", createdAt: new Date(), ...alert }),
        ),
      find: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    diseaseRepo = {
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest
        .fn()
        .mockImplementation((d) => Promise.resolve({ id: "d-1", ...d })),
      find: jest.fn(),
      delete: jest.fn(),
    };

    botService = {
      sendSosNotification: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SosService,
        { provide: getRepositoryToken(SosAlert), useValue: alertRepo },
        { provide: getRepositoryToken(SosDisease), useValue: diseaseRepo },
        { provide: SosBotService, useValue: botService },
      ],
    }).compile();

    service = module.get<SosService>(SosService);
  });

  describe("RBAC: Predefined Diseases", () => {
    it("should allow ADMIN to create predefined disease", async () => {
      const admin = { role: UserRole.ADMIN } as User;
      const dto = { name: "Cholera" };
      const result = await service.createPredefinedDisease(dto as any, admin);
      expect(result.name).toBe("Cholera");
      expect(diseaseRepo.save).toHaveBeenCalled();
    });

    it("should forbid non-ADMIN from creating predefined disease", async () => {
      const staff = { role: UserRole.STAFF } as User;
      const dto = { name: "Cholera" };
      await expect(
        service.createPredefinedDisease(dto as any, staff),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("SOS Alert Creation", () => {
    it("should create alert and notify bot", async () => {
      const user = {
        username: "worker1",
        organization: { id: "org-1", name: "District SES" },
      } as User;
      const dto = { diseaseName: "Anthrax", status: SosStatus.CONFIRMED };

      const result = await service.createAlert(dto as any, user);

      expect(result.diseaseName).toBe("Anthrax");
      expect(alertRepo.save).toHaveBeenCalled();
      expect(botService.sendSosNotification).toHaveBeenCalled();
    });

    it("should throw error if user has no organization", async () => {
      const user = { username: "homeless" } as User;
      const dto = { diseaseName: "Anthrax" };
      await expect(service.createAlert(dto as any, user)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe("RBAC: Viewing Alerts", () => {
    it("level 1 (ADMIN) should see all alerts (calls find)", async () => {
      const admin = { role: UserRole.ADMIN } as User;
      await service.getAlerts(admin);
      expect(alertRepo.find).toHaveBeenCalled();
    });

    it("level 3 (DISTRICT) should only see their own organization alerts", async () => {
      const districtUser = {
        role: UserRole.DISTRICT_HEAD,
        organization: { id: "dist-1" },
      } as User;
      await service.getAlerts(districtUser);
      expect(alertRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { organization: { id: "dist-1" } },
        }),
      );
    });
  });
});
