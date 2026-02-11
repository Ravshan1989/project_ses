import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "./modules/users/entities/user.entity";
import { Department } from "./modules/departments/entities/department.entity";
import { Repository, Like } from "typeorm";

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const userRepo = app.get<Repository<User>>(getRepositoryToken(User));
    const deptRepo = app.get<Repository<Department>>(getRepositoryToken(Department));

    // 1. Find the department
    const dept = await deptRepo.findOne({ where: { name: 'Boshqaruv (Admin)' } });

    if (!dept) {
        console.error("'Boshqaruv (Admin)' bo'limi topilmadi!");
        await app.close();
        return;
    }

    // 2. Find Bo'stonliq users
    const users = await userRepo.find({
        where: { username: Like('bostonliq_%') },
        relations: ['organization']
    });

    if (users.length === 0) {
        console.error("Foydalanuvchilar topilmadi!");
        await app.close();
        return;
    }

    for (const u of users) {
        u.department = dept;
        await userRepo.save(u);
        console.log(`Foydalanuvchi ${u.username} 'Boshqaruv (Admin)' bo'limiga biriktirildi.`);
    }

    console.log("Bo'stonliq xodimlari bo'limlari muvaffaqiyatli yangilandi!");
    await app.close();
}

bootstrap();
