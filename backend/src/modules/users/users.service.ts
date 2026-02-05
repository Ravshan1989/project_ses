import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async findOneByUsername(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne({
      where: { username },
      relations: [
        "organization",
        "organization.parent",
        "department",
        "department.permissions",
        "department.permissions.permission",
      ], // UZ: Tashkilot va Bo'lim ma'lumotlarini olish
      // Explicitly select passwordHash because it's marked as { select: false } in entity
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
    const sanitaryRoles = ['SANITARY_DOCTOR', 'SANITARY_ASSISTANT'];
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

  async findOne(id: string): Promise<User> {
    return this.usersRepository.findOne({
      where: { id },
      relations: [
        "organization",
        "organization.parent",
        "department",
        "department.permissions",
        "department.permissions.permission",
        "dynamicRole",
        "dynamicRole.rolePermissions",
      ],
    });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ["organization", "department", "dynamicRole"], // UZ: Barcha kerakli bog'liqliklar yuklanadi
    });
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

  // UZ: Yangi kod (append) - barcha bog'liqliklarni (Bo'lim, Rol) inobatga oladi
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

    // UZ: update() funksiyasi relationlarni to'g'ridan-to'g'ri yangilamaydi (TypeORM cheklovi)
    // Shuning uchun save() ishlatamiz
    const user = await this.findOne(id);
    if (!user) return null;

    Object.assign(user, userData);
    await this.usersRepository.save(user);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
