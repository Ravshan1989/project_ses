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
        { name: UserRole.DISTRICT_OPERATOR, level: 3, description: "Tuman Operatori (Yordamchi)" }
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
            perms: commonPerms,
            canCreate: true,
            canEdit: false,
            canApprove: false,
            canDownload: true
        },
        {
            role: UserRole.DISTRICT_SPECIALIST,
            perms: commonPerms,
            canCreate: true,
            canEdit: true,
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
