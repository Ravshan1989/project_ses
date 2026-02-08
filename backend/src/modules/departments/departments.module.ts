import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Department } from "./entities/department.entity";

import { DepartmentsController } from "./departments.controller";
import { PermissionsModule } from "../permissions/permissions.module";
import { Permission } from "../permissions/entities/permission.entity";
import { DepartmentPermission } from "../permissions/entities/department-permission.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Department, Permission, DepartmentPermission]),
    PermissionsModule,
  ],
  controllers: [DepartmentsController],
  exports: [TypeOrmModule],
})
export class DepartmentsModule {}
