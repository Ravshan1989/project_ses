import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Permission } from "./entities/permission.entity";
import { DepartmentPermission } from "./entities/department-permission.entity";
import { UserPermission } from "./entities/user-permission.entity"; // UZ: Foydalanuvchi darajasidagi ruxsatlar

import { PermissionsController } from "./permissions.controller";

@Module({
    imports: [TypeOrmModule.forFeature([Permission, DepartmentPermission, UserPermission])],
    controllers: [PermissionsController],
    exports: [TypeOrmModule],
})
export class PermissionsModule { }
