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
import { RolesService } from "./roles.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { RequirePermission } from "../../common/decorators/permissions.decorator";
import { Role } from "./entities/role.entity";

@Controller("roles")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
    constructor(private readonly rolesService: RolesService) { }

    @Get()
    async findAll() {
        return this.rolesService.findAll();
    }

    @Get(":id")
    async findOne(@Param("id") id: string) {
        return this.rolesService.findById(id);
    }

    @Post()
    @RequirePermission("MANAGE_DEPARTMENTS") // UZ: Rollarni boshqarish uchun hozircha shu ruxsatdan foydalanamiz
    async create(@Body() data: Partial<Role>) {
        return this.rolesService.create(data);
    }

    @Patch(":id")
    @RequirePermission("MANAGE_DEPARTMENTS")
    async update(@Param("id") id: string, @Body() data: Partial<Role>) {
        return this.rolesService.update(id, data);
    }

    @Post(":id/permissions")
    @RequirePermission("MANAGE_DEPARTMENTS")
    async syncPermissions(
        @Param("id") id: string,
        @Body("permissions") permissions: any[],
    ) {
        return this.rolesService.syncPermissions(id, permissions);
    }
}
