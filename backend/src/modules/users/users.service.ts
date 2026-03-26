import { Injectable, Inject, forwardRef, Logger, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThan } from "typeorm";
import { User } from "./entities/user.entity";
import * as bcrypt from "bcrypt";
import { TelegramService } from "../telegram/telegram.service";
import { Cron } from "@nestjs/schedule";
import { getRoleLevel } from "../../common/utils/role.util";
import { UserRole } from "../../common/enums/role.enum";
import { ChangePasswordDto } from "./dto/change-password.dto";

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @Inject(forwardRef(() => TelegramService))
    private telegramService: TelegramService,
  ) {}

  private async checkExistingUser(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  // UZ: Eski kod - foydalanuvchiga eski parolni jo'natardi.
  // Endi doim yangi parol generatsiya qilib bcrypt yordamida shifrlab saqlash.

  // --- Cron Job: Har 5 daqiqada ishlaydi ---
  @Cron("*/5 * * * *")
  async cleanupStuckRegistrations() {
    this.logger.log(
      "Hali botga ulanmagan va tasdiqlanmagan foydalanuvchilarni tozalash jarayoni boshlandi...",
    );
    try {
      // 15 daqiqadan oldingi vaqtni hisoblash
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

      // Faol emas (isActive: false) va TelegramChatId yo'q (null) va 15 daqiqa oldin yaratilganlarni topish
      const stuckUsers = await this.usersRepository.find({
        where: {
          isActive: false,
          telegramChatId: null,
          createdAt: LessThan(fifteenMinutesAgo),
        },
      });

      if (stuckUsers.length > 0) {
        this.logger.log(
          `${stuckUsers.length} ta eskirgan (15 daqiqadan o'tgan) arizalar topildi va o'chirilmoqda.`,
        );

        for (const user of stuckUsers) {
          // Xavfsizlik uchun yana bir bor tekshiramiz: reg_ bilan boshlanmasa o'chirmaymiz (ehtimol eski data)
          if (user.username && user.username.startsWith("reg_")) {
            await this.usersRepository.remove(user);
            this.logger.debug(
              `O'chirildi (Kutish muddati o'tgan): ${user.phoneNumber} - ${user.firstName} ${user.lastName}`,
            );
          }
        }

        this.logger.log("Tozalash jarayoni muvaffaqiyatli yakunlandi.");
      } else {
        this.logger.verbose(
          "O'chirilishi kerak bo'lgan eskirgan arizalar topilmadi.",
        );
      }
    } catch (error) {
      this.logger.error(
        "Hali tasdiqlanmagan foydalanuvchilarni tozalashda xatolik yuz berdi:",
        error,
      );
    }
  }

  async findOneByUsername(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne({
      where: { username },
      relations: [
        "organization",
        "organization.parent",
        "organization.children",
        "department",
        "department.permissions",
        "department.permissions.permission",
        "dynamicRole",
        "dynamicRole.rolePermissions",
        "userPermissions",
      ],
      select: [
        "id",
        "username",
        "passwordHash",
        "role",
        "createdAt",
        "updatedAt",
      ],
    });
  }

  // UZ: Eski kod - organizationId ni to'g'ri saqlamasligi mumkin (xatolik sababi)
  /*
  async create(userData: Partial<User>): Promise<User> {
    const newUser = this.usersRepository.create(userData);
    return this.usersRepository.save(newUser);
  }
  */

  private validateUserMapping(userData: any) {
    // Sanitary roles (Level 3) should ideally not have access to Epidemiology or Vaccination departments
    // But per checklist #6: "noto'g'ri kombinatsiya bloklanishi"
    // Sanitary roles (Level 3) should ideally not have access to Epidemiology or Vaccination departments
    // But per checklist #6: "noto'g'ri kombinatsiya bloklanishi"
    const sanitaryRoles = ["DISTRICT_SPECIALIST", "DISTRICT_OPERATOR"];
    if (sanitaryRoles.includes(userData.role)) {
      // Logic to check if department is sanitary-related could be added if departments have codes
    }
  }

  // UZ: Yangi kod - organizationId, departmentId va dynamicRoleId ni obyektga o'giradi
  async create(userData: any): Promise<User> {
    this.validateUserMapping(userData);
    if (userData.organizationId) {
      userData.organization = { id: userData.organizationId };
      delete userData.organizationId;
    }
    // UZ: Bo'lim va Rol bog'liqliklarini to'g'rilash
    if (userData.departmentId) {
      userData.department = { id: userData.departmentId };
      delete userData.departmentId;
    }
    if (userData.dynamicRoleId) {
      userData.dynamicRole = { id: userData.dynamicRoleId };
      delete userData.dynamicRoleId;
    }

    const newUser = this.usersRepository.create(userData as Partial<User>);
    return this.usersRepository.save(newUser);
  }

  async updatePushToken(id: string, token: string) {
    // await this.userRepository.update(id, { pushToken: token }); // OLD_TYPO
    await this.usersRepository.update(id, { pushToken: token });
    return { success: true };
  }

  async findOne(id: string): Promise<User> {
    return this.usersRepository.findOne({
      where: { id },
      relations: [
        "organization",
        "organization.parent",
        "organization.children",
        "department",
        "department.permissions",
        "department.permissions.permission",
        "dynamicRole",
        "dynamicRole.rolePermissions",
        "userPermissions", // UZ: Shaxsiy ruxsatlarni yuklash
      ],
    });
  }

  // async findAll(): Promise<User[]> { // ESKI
  async findAll(currentUser?: User): Promise<User[]> {
    if (!currentUser) return [];

    const level = getRoleLevel(currentUser.role, currentUser);
    if (level === 1) {
      return this.usersRepository.find({
        select: [
          "id",
          "username",
          "firstName",
          "lastName",
          "middleName",
          "role",
          "isActive",
          "createdAt",
        ],
        relations: ["organization", "department", "dynamicRole"],
        order: { isActive: "ASC", createdAt: "DESC" },
      });
    }

    const query = this.usersRepository
      .createQueryBuilder("user")
      .select([
        "user.id",
        "user.username",
        "user.firstName",
        "user.lastName",
        "user.middleName",
        "user.role",
        "user.isActive",
        "user.createdAt",
      ])
      .leftJoinAndSelect("user.organization", "organization")
      .leftJoinAndSelect("user.department", "department")
      .leftJoinAndSelect("user.dynamicRole", "dynamicRole")
      .orderBy("user.isActive", "ASC")
      .addOrderBy("user.createdAt", "DESC");

    if (level === 2) {
      query.where(
        "organization.parent_id = :orgId OR organization.id = :orgId",
        {
          orgId: currentUser.organization.id,
        },
      );
    } else if (level === 3) {
      query.where("organization.id = :orgId", {
        orgId: currentUser.organization.id,
      });
    }

    return query.getMany();
  }

  // UZ: Eski kod - faqat organizationId ni o'zgartirardi
  /*
  async update(id: string, userData: any): Promise<User> {
    if (userData.organizationId) {
      userData.organization = { id: userData.organizationId };
      delete userData.organizationId;
    }
    await this.usersRepository.update(id, userData);
    return this.findOne(id);
  }
  */

  async update(id: string, userData: any): Promise<User> {
    this.validateUserMapping(userData);
    if (userData.organizationId) {
      userData.organization = { id: userData.organizationId };
      delete userData.organizationId;
    }
    if (userData.departmentId) {
      userData.department = { id: userData.departmentId };
      delete userData.departmentId;
    }
    if (userData.dynamicRoleId) {
      userData.dynamicRole = { id: userData.dynamicRoleId };
      delete userData.dynamicRoleId;
    }

    await this.usersRepository.update(id, userData);
    return this.findOne(id);
  }

  async approveUser(id: string): Promise<{ user: User; password: string }> {
    const user = await this.findOne(id);
    if (!user) return null;

    // UZ: Agar foydalanuvchi allaqachon faol bo'lsa va login reg_ bilan boshlanmasa - qaytaramiz
    if (user.isActive && user.username && !user.username.startsWith("reg_")) {
      return { user, password: null };
    }

    // UZ: Agar login reg_ bilan boshlansa yoki bo'sh bo'lsa - yangi login generatsiya qilamiz
    const needsNewUsername = !user.username || user.username.startsWith("reg_");
    const username = needsNewUsername
      ? await this.generateUniqueUsername(user)
      : user.username;

    const password = this.generatePassword();
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    user.username = username;
    user.passwordHash = passwordHash;
    user.isActive = true;
    user.approvedAt = new Date();

    await this.usersRepository.save(user);

    // Send to Telegram
    try {
      await this.telegramService.sendActivationNotification(user, password);
    } catch (e) {
      console.error("Failed to send telegram notification:", e);
    }

    return { user, password };
  }

  private async generateUniqueUsername(user: User): Promise<string> {
    const firstName =
      user.firstName?.toLowerCase().replace(/[^a-z0-9]/g, "") || "user";
    const lastName =
      user.lastName?.toLowerCase().replace(/[^a-z0-9]/g, "") || "";

    let baseUsername = `${firstName}.${lastName}`;
    if (!lastName) baseUsername = firstName;

    // Check if the current user ALREADY has this baseUsername (e.g. they typed it during reg)
    // Or if someone ELSE has it.
    const existing = await this.usersRepository.findOne({
      where: { username: baseUsername },
    });

    // If nobody has it, or ONLY the current user has it (it was their temp or set username)
    if (!existing || existing.id === user.id) return baseUsername;

    let isUnique = false;
    let newUsername = baseUsername;
    while (!isUnique) {
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      newUsername = `${baseUsername}${randomSuffix}`;
      const check = await this.usersRepository.findOne({
        where: { username: newUsername },
      });
      // Unique if nobody has it OR only the current user has it
      if (!check || check.id === user.id) isUnique = true;
    }
    return newUsername;
  }

  async resetPassword(id: string): Promise<{ password: string }> {
    const user = await this.findOne(id);
    if (!user) return null;

    // UZ: Faqat qisqa 6-tali vaqtinchalik parol berish
    const password = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits simple password
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    await this.usersRepository.update(id, { passwordHash });

    return { password };
  }

  async changePassword(userId: string, data: ChangePasswordDto): Promise<boolean> {
    const user = await this.findOne(userId);
    if (!user) {
      throw new BadRequestException("Foydalanuvchi topilmadi");
    }

    const isMatch = await bcrypt.compare(data.oldPassword, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestException("Joriy parol xato!");
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(data.newPassword, salt);

    await this.usersRepository.update(userId, { passwordHash });
    return true;
  }

  private generatePassword(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    let password = "";
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }

  // Admin panel methods
  // async findPending(): Promise<User[]> { // ESKI
  async findPending(currentUser?: User): Promise<User[]> {
    if (!currentUser) return [];

    const level = getRoleLevel(currentUser.role, currentUser);
    if (level === 1) {
      return this.usersRepository.find({
        where: { isActive: false },
        relations: ["organization", "department"],
        order: { createdAt: "DESC" },
      });
    }

    const query = this.usersRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.organization", "organization")
      .leftJoinAndSelect("user.department", "department")
      .where("user.isActive = :isActive", { isActive: false })
      .orderBy("user.createdAt", "DESC");

    if (level === 2) {
      query.andWhere(
        "(organization.parent_id = :orgId OR organization.id = :orgId)",
        { orgId: currentUser.organization.id },
      );
    } else if (level === 3) {
      query.andWhere("organization.id = :orgId", {
        orgId: currentUser.organization.id,
      });
    }

    return query.getMany();
  }

  async findByOrganization(organizationId: string): Promise<User[]> {
    return this.usersRepository.find({
      where: { organization: { id: organizationId } },
      relations: ["organization", "department"],
      order: { isActive: "ASC", createdAt: "DESC" },
    });
  }

  async findPendingByOrganization(organizationId: string): Promise<User[]> {
    return this.usersRepository.find({
      where: {
        organization: { id: organizationId },
        isActive: false,
      },
      relations: ["organization", "department"],
      order: { createdAt: "DESC" },
    });
  }
}

/**
 * [ORIGINAL_REDACTED_CODE_PRESERVATION]
 *
 * async findOneByUsername(username: string): Promise<User | undefined> {
 *   return this.usersRepository.findOne({
 *     where: { username },
 *     relations: [
 *       "organization",
 *       "organization.parent",
 *       "department",
 *       "department.permissions",
 *       "department.permissions.permission",
 *       "userPermissions",
 *     ],
 *     select: [
 *       "id",
 *       "username",
 *       "passwordHash",
 *       "role",
 *       "createdAt",
 *       "updatedAt",
 *     ],
 *   });
 * }
 *
 * async findAll(): Promise<User[]> {
 *   return this.usersRepository.find({
 *     relations: ["organization", "department"],
 *     order: { isActive: "ASC", createdAt: "DESC" },
 *   });
 * }
 *
 * async findPending(): Promise<User[]> {
 *   return this.usersRepository.find({
 *     where: { isActive: false },
 *     relations: ["organization", "department"],
 *     order: { createdAt: "DESC" },
 *   });
 * }
 */
