import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "./modules/users/entities/user.entity";
import { Department } from "./modules/departments/entities/department.entity";
import { Permission } from "./modules/permissions/entities/permission.entity";
import { DepartmentPermission } from "./modules/permissions/entities/department-permission.entity";
import { Repository } from "typeorm";

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const userRepo = app.get<Repository<User>>(getRepositoryToken(User));
    const deptRepo = app.get<Repository<Department>>(getRepositoryToken(Department));
    const permRepo = app.get<Repository<Permission>>(getRepositoryToken(Permission));
    const dpRepo = app.get<Repository<DepartmentPermission>>(getRepositoryToken(DepartmentPermission));

    // 1. Ensure Boshqaruv (Admin) department exists
    let dept = await deptRepo.findOne({ where: { name: 'Boshqaruv (Admin)' } });
    if (!dept) {
        console.log("Creating 'Boshqaruv (Admin)' department...");
        dept = deptRepo.create({ name: 'Boshqaruv (Admin)', level: 1 });
        await deptRepo.save(dept);
    }

    // 2. Get all available permissions
    const allPerms = await permRepo.find();
    console.log(`Found ${allPerms.length} permissions.`);

    // 3. Assign all permissions to Boshqaruv (Admin)
    for (const perm of allPerms) {
        const exists = await dpRepo.findOne({
            where: { department: { id: dept.id }, permission: { id: perm.id } }
        });

        if (!exists) {
            console.log(`Assigning ${perm.code} to Boshqaruv (Admin)...`);
            const dp = dpRepo.create({ department: dept, permission: perm });
            await dpRepo.save(dp);
        }
    }

    // 4. Ensure all bostonliq_ users are in this department
    const bostonliqUsers = await userRepo.find({ where: { username: require('typeorm').Like('bostonliq_%') } });
    for (const u of bostonliqUsers) {
        if (!u.department || u.department.id !== dept.id) {
            u.department = dept;
            await userRepo.save(u);
            console.log(`User ${u.username} updated to Boshqaruv (Admin) department.`);
        }
    }

    console.log("Permissions and Departments sync complete for Bo'stonliq!");
    await app.close();
}

bootstrap();
