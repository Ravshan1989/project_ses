import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../roles/entities/role.entity';
import { RolePermission } from '../roles/entities/role-permission.entity';
import { UserRole } from '../../common/enums/role.enum';
import { User } from '../users/entities/user.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { Department } from '../departments/entities/department.entity';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class SeedingService implements OnModuleInit {
    private readonly logger = new Logger(SeedingService.name);

    constructor(
        @InjectRepository(Role)
        private readonly roleRepo: Repository<Role>,
        @InjectRepository(RolePermission)
        private readonly rolePermRepo: Repository<RolePermission>,
        @InjectRepository(Organization)
        private readonly orgRepo: Repository<Organization>,
        @InjectRepository(Department)
        private readonly deptRepo: Repository<Department>,
        private readonly usersService: UsersService,
    ) { }

    async onModuleInit() {
        this.logger.log('Checking and seeding initial data...');
        await this.seedPermissions();
        await this.seedTestTrio();
        this.logger.log('Seeding check complete.');
    }

    private async seedPermissions() {
        // 1. Ensure Roles Exist
        const rolesToSeed = [
            { name: UserRole.DISTRICT_SPECIALIST, level: 3, description: 'Tuman Mutaxassisi (Vrach)' },
            { name: UserRole.DISTRICT_OPERATOR, level: 3, description: 'Tuman Operatori (Yordamchi)' },
            { name: UserRole.DEPARTMENT_HEAD, level: 3, description: "Bo'lim Mudiri" },
            { name: UserRole.DISTRICT_HEAD, level: 3, description: 'Tuman Rahbari' },
        ];

        for (const r of rolesToSeed) {
            const exists = await this.roleRepo.findOneBy({ name: r.name });
            if (!exists) {
                await this.roleRepo.save(this.roleRepo.create(r));
                this.logger.log(`Created Role: ${r.name}`);
            }
        }

        // 2. Define Permissions
        const assignments = [
            {
                role: UserRole.DISTRICT_OPERATOR,
                perms: ['VIEW_EPIDEMIOLOGY', 'VIEW_HEPATITIS', 'VIEW_FLU', 'VIEW_ARI', 'VIEW_COVID', 'VIEW_DIARRHEA'],
                canCreate: true,
                canEdit: false,
                canApprove: false,
                canDownload: true,
            },
            {
                role: UserRole.DISTRICT_SPECIALIST,
                perms: ['VIEW_EPIDEMIOLOGY', 'VIEW_HEPATITIS', 'VIEW_FLU', 'VIEW_ARI', 'VIEW_COVID', 'VIEW_DIARRHEA'],
                canCreate: true,
                canEdit: true,
                canApprove: false,
                canDownload: true,
            },
            {
                role: UserRole.DEPARTMENT_HEAD,
                perms: ['VIEW_EPIDEMIOLOGY', 'VIEW_HEPATITIS', 'VIEW_FLU', 'VIEW_ARI', 'VIEW_COVID', 'VIEW_DIARRHEA', 'VERIFY_REPORT'],
                canCreate: false,
                canEdit: false,
                canApprove: true,
                canDownload: true,
            },
            {
                role: UserRole.DISTRICT_HEAD,
                perms: ['VIEW_EPIDEMIOLOGY', 'VIEW_HEPATITIS', 'VIEW_FLU', 'VIEW_ARI', 'VIEW_COVID', 'VIEW_DIARRHEA', 'APPROVE_REPORT'],
                canCreate: false,
                canEdit: false,
                canApprove: true,
                canDownload: true,
            },
        ];

        for (const assign of assignments) {
            const role = await this.roleRepo.findOneBy({ name: assign.role });
            if (!role) continue;

            // Check if permissions already match roughly (optimization)
            // For now, we will perform a safe update: delete old and re-insert to ensure compliance
            // To avoid massive deletes on every restart, check count first
            const currentPerms = await this.rolePermRepo.count({ where: { role: { id: role.id } } });

            // Basic check: if count differs or force update needed. 
            // For this critical fix, we'll force update if verification is missing for Head
            if (assign.role === UserRole.DEPARTMENT_HEAD) {
                const hasVerify = await this.rolePermRepo.findOne({ where: { role: { id: role.id }, permissionCode: 'VERIFY_REPORT' } });
                if (hasVerify) continue; // Skip if already has critical permission
            } else {
                if (currentPerms > 0) continue; // Skip others if populated
            }

            this.logger.log(`Updating permissions for ${assign.role}...`);
            await this.rolePermRepo.delete({ role: { id: role.id } });

            for (const code of assign.perms) {
                const rp = this.rolePermRepo.create({
                    role: role,
                    permissionCode: code,
                    canView: true,
                    canCreate: assign.canCreate,
                    canEdit: assign.canEdit,
                    canApprove: assign.canApprove,
                    canDownload: assign.canDownload,
                });
                await this.rolePermRepo.save(rp);
            }
        }
    }

    private async seedTestTrio() {
        const chirchiq = await this.orgRepo.findOne({ where: { name: 'Chirchiq sh' } });
        if (!chirchiq) return;

        let dept = await this.deptRepo.findOne({ where: { name: 'Boshqaruv (Admin)' } });
        if (!dept) {
            const all = await this.deptRepo.find();
            if (all.length > 0) dept = all[0];
            else return;
        }

        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash('ses12345', salt);

        const users = [
            { username: 'operator_chirchiq', role: UserRole.DISTRICT_OPERATOR, name: 'Operator Chirchiq' },
            { username: 'mudir_chirchiq', role: UserRole.DEPARTMENT_HEAD, name: 'Mudir Chirchiq' },
            { username: 'rahbar_chirchiq', role: UserRole.DISTRICT_HEAD, name: 'Rahbar Chirchiq' },
        ];

        for (const u of users) {
            const exists = await this.usersService.findOneByUsername(u.username);
            if (!exists) {
                this.logger.log(`Creating test user: ${u.username}`);
                await this.usersService.create({
                    username: u.username,
                    passwordHash: hash,
                    role: u.role,
                    organizationId: chirchiq.id,
                    departmentId: dept.id,
                    firstName: u.name,
                    lastName: 'Test',
                });
            }
        }
    }
}
