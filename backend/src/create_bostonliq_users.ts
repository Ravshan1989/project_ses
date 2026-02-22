import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { OrganizationsService } from "./modules/organizations/organizations.service";
import { UserRole } from "./common/enums/role.enum";
import * as bcrypt from "bcrypt";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "./modules/users/entities/user.entity";
import { Repository } from "typeorm";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const orgService = app.get(OrganizationsService);
  const userRepo = app.get<Repository<User>>(getRepositoryToken(User));

  const orgs = await orgService.findAll();
  const bostonliq = orgs.find((o) => o.name === "Bo'stonliq t");

  if (!bostonliq) {
    console.error("Bo'stonliq t tashkiloti topilmadi!");
    await app.close();
    return;
  }

  const passwordHash = await bcrypt.hash("Ses12345!", 10);

  const usersToCreate = [
    {
      username: "bostonliq_head",
      role: UserRole.DISTRICT_HEAD,
      firstName: "Bo'stonliq",
      lastName: "Boshlig'i",
    },
    {
      username: "bostonliq_chief",
      role: UserRole.DEPARTMENT_HEAD,
      firstName: "Bo'stonliq",
      lastName: "Mudiri",
    },
    {
      username: "bostonliq_staff1",
      role: UserRole.STAFF,
      firstName: "Xodim",
      lastName: "1",
    },
    {
      username: "bostonliq_staff2",
      role: UserRole.STAFF,
      firstName: "Xodim",
      lastName: "2",
    },
    {
      username: "bostonliq_staff3",
      role: UserRole.STAFF,
      firstName: "Xodim",
      lastName: "3",
    },
  ];

  for (const u of usersToCreate) {
    const existing = await userRepo.findOne({
      where: { username: u.username },
    });
    if (existing) {
      console.log(`Foydalanuvchi ${u.username} allaqachon mavjud.`);
      continue;
    }

    const newUser = userRepo.create({
      username: u.username,
      passwordHash: passwordHash,
      role: u.role,
      organization: bostonliq,
      firstName: u.firstName,
      lastName: u.lastName,
    });

    await userRepo.save(newUser);
    console.log(`Foydalanuvchi ${u.username} yaratildi.`);
  }

  console.log("Bo'stonliq xodimlari muvaffaqiyatli yaratildi!");
  await app.close();
}

bootstrap();
