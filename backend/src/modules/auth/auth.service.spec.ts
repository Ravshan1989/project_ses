import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { TelegramService } from "../telegram/telegram.service";
import { RegisterDto } from "./dto/register.dto";
import { ConflictException } from "@nestjs/common";

describe("AuthService (Security Guard)", () => {
  let service: AuthService;
  let usersService: Partial<UsersService>;

  beforeEach(async () => {
    usersService = {
      create: jest
        .fn()
        .mockImplementation((dto) => Promise.resolve({ id: "1", ...dto })),
      findOne: jest.fn().mockResolvedValue({ id: "1", username: "test" }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: {} },
        { provide: TelegramService, useValue: {} },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("register", () => {
    it('should ignore "role" in RegisterDto and use default/null', async () => {
      // simulating a malicious payload that includes role
      const maliciousDto: any = {
        phoneNumber: "998901234567",
        firstName: "Hacker",
        lastName: "One",
        role: "ADMIN",
      };

      await service.register(maliciousDto);

      // Verify that usersService.create was NOT called with the ADMIN role
      const lastCall = (usersService.create as jest.Mock).mock.calls[0][0];
      expect(lastCall.role).toBeUndefined();
      expect(lastCall).not.toHaveProperty("role");
    });
  });
});
