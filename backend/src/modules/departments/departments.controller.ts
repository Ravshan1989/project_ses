import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Department } from "./entities/department.entity";
import { CreateDepartmentDto } from "./dto/create-department.dto";
import { UpdateDepartmentDto } from "./dto/update-department.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { RequirePermission } from "../../common/decorators/permissions.decorator";
import { Permission } from "../permissions/entities/permission.entity";
import { DepartmentPermission } from "../permissions/entities/department-permission.entity";
import { Public } from "../../common/decorators/public.decorator";

@Controller("departments")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DepartmentsController {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
    @InjectRepository(DepartmentPermission)
    private readonly deptPermRepo: Repository<DepartmentPermission>,
  ) { }

  @Public()
  @Get()
  async findAll() {
    // UZ: Barcha bo'limlarni ruxsatlari bilan birga qaytarish
    return this.departmentRepo.find({
      relations: ["permissions", "permissions.permission"],
      order: { name: "ASC" },
    });
  }

  @Post()
  @RequirePermission("MANAGE_DEPARTMENTS") // UZ: Faqat ruxsati borlar uchun
  async create(@Body() data: CreateDepartmentDto) {
    // UZ: Yangi bo'lim yaratish
    const dept = this.departmentRepo.create(data);
    return this.departmentRepo.save(dept);
  }

  @Patch(":id")
  @RequirePermission("MANAGE_DEPARTMENTS")
  async update(@Param("id") id: string, @Body() data: UpdateDepartmentDto) {
    // UZ: Bo'limni tahrirlash
    await this.departmentRepo.update(id, data);
    return this.departmentRepo.findOneBy({ id });
  }

  @Delete(":id")
  @RequirePermission("MANAGE_DEPARTMENTS")
  async remove(@Param("id") id: string) {
    // UZ: Bo'limni o'chirish
    return this.departmentRepo.delete(id);
  }

  @Post(":id/permissions")
  @RequirePermission("MANAGE_DEPARTMENTS")
  async syncPermissions(
    @Param("id") id: string,
    @Body("permissions") permissionCodes: string[],
  ) {
    // UZ: Bo'lim ruxsatlarini sinxronizatsiya qilish
    const department = await this.departmentRepo.findOneBy({ id });
    if (!department) throw new Error("Department not found");

    // Oldingilarini o'chirish
    await this.deptPermRepo.delete({ department: { id } });

    // Yangilarini qo'shish
    if (permissionCodes && permissionCodes.length > 0) {
      for (const code of permissionCodes) {
        const perm = await this.permissionRepo.findOneBy({ code });
        if (perm) {
          const dp = this.deptPermRepo.create({
            department,
            permission: perm,
          });
          await this.deptPermRepo.save(dp);
        }
      }
    }

    return { success: true };
  }
}
