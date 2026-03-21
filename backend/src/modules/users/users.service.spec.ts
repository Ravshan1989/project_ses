import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { UsersService } from "./users.service";
import { User } from "./entities/user.entity";
import { TelegramService } from "../telegram/telegram.service";
import { UserRole } from "../../common/enums/role.enum";
import * as bcrypt from "bcrypt";

describe("UsersService (Guardrail Tests)", () => {
  let service: UsersService;
  let repo: any;
  let telegramService: any;

  beforeEach(async () => {
    repo = {
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest
        .fn()
        .mockImplementation((u) => Promise.resolve({ id: "u-123", ...u })),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    telegramService = {
      sendActivationNotification: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repo },
        { provide: TelegramService, useValue: telegramService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe("User Lifecycle & Security", () => {
    it("should approve user, generate unique username and hash password", async () => {
      const pendingUser = {
        id: "u-1",
        username: "reg_123",
        firstName: "Ali",
        lastName: "Valiyev",
        isActive: false,
      };
      repo.findOne.mockResolvedValue(pendingUser);

      const result = await service.approveUser("u-1");

      expect(result.user.isActive).toBe(true);
      expect(result.user.username).toBe("ali.valiyev");
      expect(result.password).toBeDefined();

      // Verify hashing
      const isMatch = await bcrypt.compare(
        result.password,
        result.user.passwordHash,
      );
      expect(isMatch).toBe(true);

      expect(repo.save).toHaveBeenCalled();
      expect(telegramService.sendActivationNotification).toHaveBeenCalled();
    });

    it("should ignore non-reg username if already set", async () => {
      const user = { id: "u-2", username: "custom_login", isActive: false };
      repo.findOne.mockResolvedValue(user);
      const result = await service.approveUser("u-2");
      expect(result.user.username).toBe("custom_login");
    });
  });

  describe("Isolation & RBAC", () => {
    it("Level 1 (ADMIN) should see all users", async () => {
      const admin = { role: UserRole.ADMIN } as User;
      await service.findAll(admin);
      expect(repo.find).toHaveBeenCalled();
    });

    it("Level 3 (DISTRICT) should be isolated to their organization", async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      repo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const distHead = {
        role: UserRole.DISTRICT_HEAD,
        organization: { id: "dist-1" },
      } as User;

      await service.findAll(distHead);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        "organization.id = :orgId",
        { orgId: "dist-1" },
      );
    });
  });

  describe("Cleanup Cron", () => {
    it("should remove stuck reg_ users older than 15 mins", async () => {
      const stuckUser = { username: "reg_temp", phoneNumber: "123" };
      repo.find.mockResolvedValue([stuckUser]);

      await service.cleanupStuckRegistrations();

      expect(repo.remove).toHaveBeenCalledWith(stuckUser);
    });
  });
});
