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
  const orgRepo: Repository<Organization> = app.get(
    getRepositoryToken(Organization),
  );
  const deptRepo: Repository<Department> = app.get(
    getRepositoryToken(Department),
  );

  const salt = await bcrypt.genSalt();
  const passwordHash = await bcrypt.hash("ses12345", salt);

  // 1. Find Republic Root
  const republic = await orgRepo.findOne({
    where: {
      name: "Sanitariya-epidemiologik osoyishtalik va jamoat salomatligi xizmati",
    },
  });

  if (!republic) {
    console.error(
      "Republic organization not found! Run seed-republic.ts first.",
    );
    await app.close();
    return;
  }

  // 2. Find/Create Admin Department
  let dept = await deptRepo.findOne({ where: { name: "Boshqaruv (Admin)" } });
  if (!dept) {
    const allDepts = await deptRepo.find();
    if (allDepts.length > 0) dept = allDepts[0];
  }

  if (!dept) {
    console.error("No departments found.");
    await app.close();
    return;
  }

  const username = "republic_admin";
  const existing = await usersService.findOneByUsername(username);

  if (existing) {
    console.log(`Updating existing republic user: ${username}`);
    await usersService.update(existing.id, {
      role: UserRole.REPUBLIC_HEAD,
      organizationId: republic.id,
      departmentId: dept.id,
      passwordHash,
      firstName: "Respublika",
      lastName: "Rahbari",
    });
  } else {
    console.log(`Creating new republic user: ${username}`);
    await usersService.create({
      username,
      passwordHash,
      role: UserRole.REPUBLIC_HEAD,
      organizationId: republic.id,
      departmentId: dept.id,
      firstName: "Respublika",
      lastName: "Rahbari",
    });
  }

  console.log("------------------------------------------------");
  console.log("Republic Admin Created:");
  console.log(`Login: ${username} | Pass: ses12345`);
  console.log("------------------------------------------------");

  await app.close();
}

bootstrap();
