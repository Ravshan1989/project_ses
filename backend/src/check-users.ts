import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { User } from "./modules/users/entities/user.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";

async function checkUsers() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepo: Repository<User> = app.get(getRepositoryToken(User));

  const all = await userRepo.find({ relations: ['organization', 'organization.parent'] });
  console.log("--- USERS START ---");
  all.forEach(u => {
    console.log(`User: ${u.username}, Role: ${u.role}, OrgName: ${u.organization?.name}, OrgID: ${u.organization?.id}, ParentOrg: ${u.organization?.parent?.name}`);
  });
  console.log("--- USERS END ---");

  await app.close();
}

checkUsers().catch(console.error);
