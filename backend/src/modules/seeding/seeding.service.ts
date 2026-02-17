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
        await this.seedDistricts();
        await this.seedPermissions();
        await this.seedDepartmentPermissions();
        await this.seedTestTrio();
        this.logger.log('Seeding check complete.');
    }

    private async seedDistricts() {
        // 1. Ensure Region exists as Parent
        let region = await this.orgRepo.findOne({
            where: { name: "Toshkent viloyati" },
        });

        if (!region) {
            this.logger.log("Region not found, creating 'Toshkent viloyati'...");
            region = this.orgRepo.create({
                name: "Toshkent viloyati",
                population: 3000000,
            });
            region = await this.orgRepo.save(region);
        }

        const DISTRICTS = [
            { name: "Nurafshon sh", population: 54100 },
            { name: "Angren sh", population: 191300 },
            { name: "Bekobod sh", population: 102000 },
            { name: "Chirchiq sh", population: 168000 },
            { name: "Olmaliq sh", population: 138500 },
            { name: "Ohangaron sh", population: 42000 },
            { name: "Yangiyo'l sh", population: 63000 },
            { name: "Oqqo'rg'on t", population: 112400 },
            { name: "Ohangaron t", population: 108300 },
            { name: "Bekobod t", population: 163400 },
            { name: "Bo'stonliq t", population: 175600 },
            { name: "Bo'ka t", population: 132400 },
            { name: "Quyi chirchiq t", population: 115800 },
            { name: "Zangiota t", population: 204300 },
            { name: "Yuqori Chirchiq t", population: 142100 },
            { name: "Qibray t", population: 206800 },
            { name: "Parkent t", population: 153000 },
            { name: "Piskent t", population: 102400 },
            { name: "O'rta Chirchiq t", population: 153500 },
            { name: "Chinoz t", population: 147800 },
            { name: "Yangiyo'l t", population: 278300 },
            { name: "Toshkent t", population: 194500 },
        ];

        for (const data of DISTRICTS) {
            let district = await this.orgRepo.findOne({ where: { name: data.name } });
            if (!district) {
                district = this.orgRepo.create({
                    name: data.name,
                    population: data.population,
                    child_population: Math.round(data.population * 0.3),
                    parent: region,
                });
                await this.orgRepo.save(district);
                this.logger.log(`Created district: ${data.name}`);
            }
        }
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
        // A. Level 1 Departments (Fixed Names)
        const level1Assignments = [
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
        ];

        for (const assign of level1Assignments) {
            const dept = await this.deptRepo.findOneBy({ name: assign.dept });
            if (!dept) continue;

            for (const code of assign.perms) {
                await this.assignPermissionToDept(dept, code);
            }
        }

        // B. Level 3 Departments (ALL Districts)
        // Instead of hardcoding "Epidemiologiya va immunoprofilaktika", we find ALL level 3 departments
        {
            const level3Depts = await this.deptRepo.findBy({ level: 3 });
            const level3Perms = [
                "VIEW_FORM1_TABLE1",
                "EDIT_FORM1_TABLE1",
                "VIEW_HEPATITIS",
                "VIEW_FLU",
                "VIEW_EPIDEMIOLOGY",
                "VIEW_WEEKLY_SUMMARY",
                "VIEW_COVID",
            ];

            this.logger.log(`Found ${level3Depts.length} Level 3 departments. Assigning permissions...`);

            for (const dept of level3Depts) {
                for (const code of level3Perms) {
                    await this.assignPermissionToDept(dept, code);
                }
            }
        }
    }

    private async assignPermissionToDept(dept: Department, code: string) {
        const perm = await this.permRepo.findOneBy({ code });
        if (!perm) return;

        const exists = await this.deptPermRepo.findOne({
            where: { department: { id: dept.id }, permission: { id: perm.id } },
            relations: ["department", "permission"],
        });

        if (!exists) {
            const dp = this.deptPermRepo.create({ department: dept, permission: perm });
            await this.deptPermRepo.save(dp);
            this.logger.log(`Assigned ${code} to ${dept.name}`);
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
