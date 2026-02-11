import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { UsersService } from "./modules/users/users.service";
import { UserRole } from "./common/enums/role.enum";
import { Organization } from "./modules/organizations/entities/organization.entity";
import { Department } from "./modules/departments/entities/department.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  const orgRepo: Repository<Organization> = app.get(getRepositoryToken(Organization));
  const deptRepo: Repository<Department> = app.get(getRepositoryToken(Department));

  // 1. Get/Create Department
  let dept = await deptRepo.findOne({ where: { name: "Boshqaruv (Admin)" } });
  if (!dept) {
    dept = deptRepo.create({
      name: "Boshqaruv (Admin)",
      description: "Sistem Administrator",
      level: 1,
      isActive: true
    });
    dept = await deptRepo.save(dept);
  }

  // 2. Get/Create Viloyat Organization
  let viloyat = await orgRepo.findOne({ where: { name: "Toshkent viloyati" } });
  if (!viloyat) {
    viloyat = orgRepo.create({
      name: "Toshkent viloyati",
      population: 3000000
    });
    viloyat = await orgRepo.save(viloyat);
  }

  // 3. Create Admin User
  const adminUsername = "admin";
  const existingAdmin = await usersService.findOneByUsername(adminUsername);

  if (!existingAdmin) {
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash("admin1234", salt);

    await usersService.create({
      username: adminUsername,
      passwordHash,
      role: UserRole.ADMIN,
      organizationId: viloyat.id,
      departmentId: dept.id,
    });
    console.log(`Admin user created: ${adminUsername} / admin1234`);
  } else {
    console.log("Admin user already exists.");
  }

  await app.close();
}

bootstrap();
