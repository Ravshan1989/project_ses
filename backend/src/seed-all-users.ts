import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { UsersService } from "./modules/users/users.service";
import { UserRole } from "./common/enums/role.enum";
import { Organization } from "./modules/organizations/entities/organization.entity";
import { Department } from "./modules/departments/entities/department.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository, Not, IsNull } from "typeorm";
import * as bcrypt from "bcrypt";
import * as fs from "fs";

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

  // 1. Get All District/City Organizations
  const districts = await orgRepo.find({ where: { parent: Not(IsNull()) } });

  // 2. Get Default Department
  const dept = await deptRepo.findOne({ where: { name: "Boshqaruv (Admin)" } });

  if (!dept) {
    console.error("Default department not found!");
    await app.close();
    return;
  }

  console.log(`Found ${districts.length} organizations to process...`);
  const accounts: any[] = [];

  for (const org of districts) {
    // Generate valid username: lowercase, no spaces, no special chars
    const cleanName = org.name
      .toLowerCase()
      .replace(/['`]/g, "")
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");

    const username = `user_${cleanName}`;

    const user = await usersService.findOneByUsername(username);
    if (!user) {
      await usersService.create({
        username: username,
        passwordHash,
        role: UserRole.DISTRICT_HEAD,
        organizationId: org.id,
        departmentId: dept.id,
      });
      console.log(`Created: ${username} for ${org.name}`);
    } else {
      console.log(`Exists: ${username}`);
    }

    accounts.push({
      Organization: org.name,
      Username: username,
      Password: "ses12345",
    });
  }

  // Save the list to a file for the user
  const tableHeader = "| Tashkilot | Login | Parol |\n| :--- | :--- | :--- |\n";
  const tableBody = accounts
    .map((a) => `| ${a.Organization} | \`${a.Username}\` | \`${a.Password}\` |`)
    .join("\n");
  fs.writeFileSync("all_users_credentials.md", tableHeader + tableBody);

  console.log(
    "Seeding all users complete. Credentials saved to all_users_credentials.md",
  );
  await app.close();
}

bootstrap();
