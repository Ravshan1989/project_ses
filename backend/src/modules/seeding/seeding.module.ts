import { Module } from '@nestjs/common';
import { SeedingService } from './seeding.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../roles/entities/role.entity';
import { RolePermission } from '../roles/entities/role-permission.entity';
import { User } from '../users/entities/user.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { Department } from '../departments/entities/department.entity';
import { UsersModule } from '../users/users.module';
import { Permission } from '../permissions/entities/permission.entity';
import { DepartmentPermission } from '../permissions/entities/department-permission.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Role,
            RolePermission,
            User,
            Organization,
            Department,
            Permission,
            DepartmentPermission,
        ]),
        UsersModule,
    ],
    providers: [SeedingService],
    exports: [SeedingService],
})
export class SeedingModule { }
