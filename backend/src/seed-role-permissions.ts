import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Role } from "./modules/roles/entities/role.entity";
import { RolePermission } from "./modules/roles/entities/role-permission.entity";
import { UserRole } from "./common/enums/role.enum";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const roleRepo: Repository<Role> = app.get(getRepositoryToken(Role));
    const rolePermRepo: Repository<RolePermission> = app.get(getRepositoryToken(RolePermission));

    console.log("Seeding Role Permissions...");

    // 1. Ensure Roles Exist
    const rolesToSeed = [
        { name: UserRole.DISTRICT_SPECIALIST, level: 3, description: "Tuman Mutaxassisi (Vrach)" },
        { name: UserRole.DISTRICT_OPERATOR, level: 3, description: "Tuman Operatori (Yordamchi)" },
        { name: UserRole.DEPARTMENT_HEAD, level: 3, description: "Bo'lim Mudiri" },
        { name: UserRole.DISTRICT_HEAD, level: 3, description: "Tuman Rahbari" }
    ];

    for (const r of rolesToSeed) {
        let role = await roleRepo.findOneBy({ name: r.name });
        if (!role) {
            role = roleRepo.create(r);
            await roleRepo.save(role);
            console.log(`Created Role: ${r.name}`);
        }
    }

    // 2. Define Permissions per Role
    // Common permissions (depend on Dept, but Role sets CAPABILITIES)
    // We use "VIEW_FORM1_TABLE1" as a placeholder for "Can access Form 1"
    const commonPerms = ["VIEW_EPIDEMIOLOGY", "VIEW_HEPATITIS", "VIEW_FLU", "VIEW_FORM1_TABLE1"];

    const assignments = [
        {
            role: UserRole.DISTRICT_OPERATOR,
            perms: ["VIEW_EPIDEMIOLOGY", "VIEW_HEPATITIS", "VIEW_FLU", "VIEW_ARI", "VIEW_COVID", "VIEW_DIARRHEA"],
            canCreate: true,
            canEdit: false,
            canApprove: false,
            canDownload: true
        },
        {
            role: UserRole.DISTRICT_SPECIALIST,
            perms: ["VIEW_EPIDEMIOLOGY", "VIEW_HEPATITIS", "VIEW_FLU", "VIEW_ARI", "VIEW_COVID", "VIEW_DIARRHEA"],
            canCreate: true,
            canEdit: true,
            canApprove: false,
            canDownload: true
        },
        {
            role: UserRole.DEPARTMENT_HEAD,
            perms: ["VIEW_EPIDEMIOLOGY", "VIEW_HEPATITIS", "VIEW_FLU", "VIEW_ARI", "VIEW_COVID", "VIEW_DIARRHEA", "VERIFY_REPORT"],
            canCreate: false,
            canEdit: false,
            canApprove: true,
            canDownload: true
        },
        {
            role: UserRole.DISTRICT_HEAD,
            perms: ["VIEW_EPIDEMIOLOGY", "VIEW_HEPATITIS", "VIEW_FLU", "VIEW_ARI", "VIEW_COVID", "VIEW_DIARRHEA", "APPROVE_REPORT"],
            canCreate: false,
            canEdit: false,
            canApprove: true,
            canDownload: true
        }
    ];

    for (const assign of assignments) {
        const role = await roleRepo.findOneBy({ name: assign.role });
        if (!role) continue;

        // Clear existing permissions for this role to avoid duplicates/conflicts
        await rolePermRepo.delete({ role: { id: role.id } });

        for (const code of assign.perms) {
            const rp = rolePermRepo.create({
                role: role,
                permissionCode: code,
                canView: true,
                canCreate: assign.canCreate,
                canEdit: assign.canEdit,
                canApprove: assign.canApprove,
                canDownload: assign.canDownload
            });
            await rolePermRepo.save(rp);
        }
        console.log(`Assigned permissions to ${assign.role}`);
    }

    console.log("Role Permission Seeding Complete.");
    await app.close();
}

bootstrap();
