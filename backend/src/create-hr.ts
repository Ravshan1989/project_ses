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
  const password = "ses12345";
  const passwordHash = await bcrypt.hash(password, salt);

  // Find Chirchiq sh
  const org = await orgRepo.findOne({ where: { name: "Chirchiq sh" } });

  if (!org) {
    console.error("Organization 'Chirchiq sh' not found!");
    await app.close();
    return;
  }

  let dept = await deptRepo.findOne({ where: { name: "Boshqaruv (Admin)" } });
  if (!dept) {
    dept = await deptRepo.save(
      deptRepo.create({
        name: "Boshqaruv (Admin)",
        level: 1,
        isActive: true,
      }),
    );
  }

  const userData = {
    username: "kadr_chirchiq",
    role: UserRole.HR,
    firstName: "Chirchiq",
    lastName: "Kadri",
    organizationId: org.id,
    departmentId: dept.id,
    passwordHash,
    isActive: true,
  };

  const existing = await usersService.findOneByUsername(userData.username);
  if (existing) {
    await usersService.update(existing.id, userData);
    console.log(`Updated user: ${userData.username}`);
  } else {
    await usersService.create(userData);
    console.log(`Created user: ${userData.username}`);
  }

  console.log("------------------------------------------------");
  console.log(`Role: HR | Org: ${org.name}`);
  console.log(`Login: ${userData.username}`);
  console.log(`Password: ${password}`);
  console.log("------------------------------------------------");

  await app.close();
}

bootstrap();
