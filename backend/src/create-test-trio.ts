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

  // 1. Find Chirchiq sh
  const chirchiq = await orgRepo.findOne({ where: { name: "Chirchiq sh" } });
  if (!chirchiq) {
    console.error("Chirchiq sh organization not found!");
    await app.close();
    return;
  }

  // 2. Find Default Department (or any)
  // We need a department. If not found, we might fail or create one.
  let dept = await deptRepo.findOne({ where: { name: "Boshqaruv (Admin)" } });
  if (!dept) {
    // Fallback: get any department or create dummy
    const allDepts = await deptRepo.find();
    if (allDepts.length > 0) dept = allDepts[0];
  }

  if (!dept) {
    console.error("No departments found. Please seed departments first.");
    await app.close();
    return;
  }

  const users = [
    {
      username: "operator_chirchiq",
      role: UserRole.DISTRICT_OPERATOR,
      name: "Operator Chirchiq",
    },
    {
      username: "mudir_chirchiq",
      role: UserRole.DEPARTMENT_HEAD,
      name: "Mudir Chirchiq",
    },
    {
      username: "rahbar_chirchiq",
      role: UserRole.DISTRICT_HEAD,
      name: "Rahbar Chirchiq",
    },
  ];

  console.log(`Creating test users for ${chirchiq.name}...`);

  for (const u of users) {
    const existing = await usersService.findOneByUsername(u.username);
    if (existing) {
      console.log(`Updating existing user: ${u.username}`);
      await usersService.update(existing.id, {
        role: u.role,
        organizationId: chirchiq.id,
        departmentId: dept.id,
        passwordHash, // Reset password just in case
        firstName: u.name,
        lastName: "Test",
      });
    } else {
      console.log(`Creating new user: ${u.username}`);
      await usersService.create({
        username: u.username,
        passwordHash,
        role: u.role,
        organizationId: chirchiq.id,
        departmentId: dept.id,
        firstName: u.name,
        lastName: "Test",
      });
    }
  }

  console.log("------------------------------------------------");
  console.log("Test Credentials Created for Chirchiq sh:");
  users.forEach((u) => {
    console.log(`${u.role}: Login: ${u.username} | Pass: ses12345`);
  });
  console.log("------------------------------------------------");

  await app.close();
}

bootstrap();
