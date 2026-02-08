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
  const passwordHash = await bcrypt.hash("test1234", salt);

  // 1. Get Organizations
  const olmaliq = await orgRepo.findOne({ where: { name: "Olmaliq sh" } });
  const viloyat = await orgRepo.findOne({
    where: { name: "Toshkent viloyati" },
  });

  // 2. Get Department
  const dept = await deptRepo.findOne({ where: { name: "Boshqaruv (Admin)" } });

  if (!dept || !olmaliq || !viloyat) {
    console.error("Missing required data (Dept or Org). Run main seeds first.");
    await app.close();
    return;
  }

  // 3. Create District User
  const districtUser = await usersService.findOneByUsername("olmaliq_test");
  if (!districtUser) {
    await usersService.create({
      username: "olmaliq_test",
      passwordHash,
      role: UserRole.DISTRICT_HEAD,
      organizationId: olmaliq.id,
      departmentId: dept.id,
    });
    console.log("Created Olmaliq District User: olmaliq_test / test1234");
  }

  // 4. Create Region User
  const regionUser = await usersService.findOneByUsername("viloyat_test");
  if (!regionUser) {
    await usersService.create({
      username: "viloyat_test",
      passwordHash,
      role: UserRole.REGION_HEAD,
      organizationId: viloyat.id,
      departmentId: dept.id,
    });
    console.log("Created Viloyat Region User: viloyat_test / test1234");
  }

  console.log("Seeding test users complete.");
  await app.close();
}

bootstrap();
