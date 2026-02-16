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
import { Permission } from '../permissions/entities/permission.entity';
import { DepartmentPermission } from '../permissions/entities/department-permission.entity';

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
        @InjectRepository(Permission)
        private readonly permRepo: Repository<Permission>,
        @InjectRepository(DepartmentPermission)
        private readonly deptPermRepo: Repository<DepartmentPermission>,
        private readonly usersService: UsersService,
    ) { }

    async onModuleInit() {
        this.logger.log('Checking and seeding initial data...');
        await this.seedPermissions();
        await this.seedDepartmentPermissions();
        await this.seedTestTrio();
        this.logger.log('Seeding check complete.');
    }

    private async seedDepartmentPermissions() {
        // 1. Define Permissions
        const permissionsData = [
            { code: "VIEW_HEPATITIS", description: "View Hepatitis Reports" },
            { code: "VIEW_FLU", description: "View Flu/ARI Reports" },
            { code: "VIEW_EPIDEMIOLOGY", description: "View Epidemiology Reports" },
            { code: "VIEW_WEEKLY_SUMMARY", description: "View Weekly Summaries" },
            { code: "VIEW_COVID", description: "View Covid-19 Reports" },
            // Forma 1 Permissions
            { code: "VIEW_FORM1_TABLE1", description: "View/Edit Form 1 Table 1" },
            { code: "VIEW_FORM1_TABLE2", description: "View Form 1 Table 2" },
            { code: "VIEW_FORM1_TABLE3", description: "View Form 1 Table 3" },
            { code: "EDIT_FORM1_TABLE1", description: "Edit Form 1 Table 1" },
            { code: "MANAGE_DEPARTMENTS", description: "Create/Edit Departments and Permissions" },
        ];

        for (const p of permissionsData) {
            let perm = await this.permRepo.findOneBy({ code: p.code });
            if (!perm) {
                perm = this.permRepo.create(p);
                await this.permRepo.save(perm);
                this.logger.log(`Created Permission: ${p.code}`);
            }
        }

        // 2. Define Departments
        const departmentsData = [
            { name: "Epidemiologiya Bo'limi", description: "Faqat epidemiologiya va haftalik xulosani ko'radi", level: 1 },
            { name: "VGA Bo'limi", description: "Faqat gepatitni ko'radi", level: 1 },
            { name: "O'RI va Gripp Bo'limi", description: "Faqat grippni ko'radi", level: 1 },
            { name: "Boshqaruv (Admin)", description: "Hamma narsani ko'radi", level: 1 },
            // Tuman Darajasi
            { name: "Epidemiologiya va immunoprofilaktika", description: "Tuman darajasi: Faqat Forma 1-jadval va kunliklar", level: 3 },
        ];

        for (const d of departmentsData) {
            let dept = await this.deptRepo.findOneBy({ name: d.name });
            if (!dept) {
                dept = this.deptRepo.create(d);
                await this.deptRepo.save(dept);
                this.logger.log(`Created Department: ${d.name}`);
            }
        }

        // 3. Assign Permissions
        const assignments = [
            {
                dept: "Epidemiologiya Bo'limi",
                perms: ["VIEW_EPIDEMIOLOGY", "VIEW_WEEKLY_SUMMARY"],
            },
            { dept: "VGA Bo'limi", perms: ["VIEW_HEPATITIS"] },
            { dept: "O'RI va Gripp Bo'limi", perms: ["VIEW_FLU"] },
            {
                dept: "Boshqaruv (Admin)",
                perms: [
                    "VIEW_HEPATITIS",
                    "VIEW_FLU",
                    "VIEW_EPIDEMIOLOGY",
                    "VIEW_WEEKLY_SUMMARY",
                    "VIEW_COVID",
                    "VIEW_FORM1_TABLE1",
                    "VIEW_FORM1_TABLE2",
                    "VIEW_FORM1_TABLE3",
                    "EDIT_FORM1_TABLE1",
                    "MANAGE_DEPARTMENTS",
                ],
            },
            {
                dept: "Epidemiologiya va immunoprofilaktika",
                perms: [
                    "VIEW_FORM1_TABLE1",
                    "EDIT_FORM1_TABLE1",
                    "VIEW_HEPATITIS",
                    "VIEW_FLU",
                    "VIEW_EPIDEMIOLOGY",
                    "VIEW_WEEKLY_SUMMARY",
                    "VIEW_COVID",
                ],
            },
        ];

        for (const assign of assignments) {
            const dept = await this.deptRepo.findOneBy({ name: assign.dept });
            if (!dept) continue;

            for (const code of assign.perms) {
                const perm = await this.permRepo.findOneBy({ code });
                if (!perm) continue;

                const exists = await this.deptPermRepo.findOne({
                    where: { department: { id: dept.id }, permission: { id: perm.id } },
                    relations: ["department", "permission"],
                });

                if (!exists) {
                    const dp = this.deptPermRepo.create({ department: dept, permission: perm });
                    await this.deptPermRepo.save(dp);
                    this.logger.log(`Assigned ${code} to ${assign.dept}`);
                }
            }
        }
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

            const currentPerms = await this.rolePermRepo.count({ where: { role: { id: role.id } } });

            if (assign.role === UserRole.DEPARTMENT_HEAD) {
                const hasVerify = await this.rolePermRepo.findOne({ where: { role: { id: role.id }, permissionCode: 'VERIFY_REPORT' } });
                if (hasVerify) continue;
            } else {
                if (currentPerms > 0) continue;
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
