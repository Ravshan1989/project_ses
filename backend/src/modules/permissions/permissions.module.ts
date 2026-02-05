import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Permission } from "./entities/permission.entity";
import { DepartmentPermission } from "./entities/department-permission.entity";

import { PermissionsController } from "./permissions.controller";

@Module({
    imports: [TypeOrmModule.forFeature([Permission, DepartmentPermission])],
    controllers: [PermissionsController],
    exports: [TypeOrmModule],
})
export class PermissionsModule { }
