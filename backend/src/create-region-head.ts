import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { UsersService } from "./modules/users/users.service";
import { User } from "./modules/users/entities/user.entity";
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
  const password = "boshliq12345";
  const passwordHash = await bcrypt.hash(password, salt);

  // Find a Regional Organization (e.g. Toshkent viloyati)
  let org = await orgRepo.findOne({ where: { name: "Toshkent viloyati" } });
  if (!org) {
    // Fallback: search for any that has 'viloyati'
    const orgs = await orgRepo
      .createQueryBuilder("org")
      .where("org.name ILIKE :name", { name: "%viloyati%" })
      .getMany();
    if (orgs.length > 0) org = orgs[0];
  }

  if (!org) {
    console.error("Organization 'Toshkent viloyati' not found!");
    await app.close();
    return;
  }

  let dept = await deptRepo.findOne({ where: { name: "Boshqaruv (Admin)" } });
  if (!dept) {
    const allDepts = await deptRepo.find();
    if (allDepts.length > 0) dept = allDepts[0];
  }

  const userData = {
    username: "boshliq_viloyat",
    role: UserRole.REGION_HEAD,
    firstName: "Viloyat",
    lastName: "Boshlig'i",
    organizationId: org.id,
    departmentId: dept?.id,
    passwordHash,
  };

  const userRepo: Repository<User> = app.get(getRepositoryToken(User));

  const existing = await usersService.findOneByUsername(userData.username);
  if (existing) {
    await usersService.update(existing.id, userData);
    console.log(`Updated user: ${userData.username}`);
  } else {
    const newUser = userRepo.create({
      ...userData,
      isActive: true,
    });
    await userRepo.save(newUser);
    console.log(`Created user: ${userData.username}`);
  }

  console.log("------------------------------------------------");
  console.log(`Role: REGION_HEAD | Org: ${org.name}`);
  console.log(`Login: ${userData.username}`);
  console.log(`Password: ${password}`);
  console.log("------------------------------------------------");

  await app.close();
}

bootstrap();
