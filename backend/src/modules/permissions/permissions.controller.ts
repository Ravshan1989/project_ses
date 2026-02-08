import { Controller, Get, UseGuards } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Permission } from "./entities/permission.entity";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";

@Controller("permissions")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PermissionsController {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
  ) {}

  @Get()
  async findAll() {
    // UZ: Barcha mavjud ruxsatlarni qaytarish
    return this.permissionRepo.find({ order: { code: "ASC" } });
  }
}
