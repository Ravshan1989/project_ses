import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Role } from "./modules/roles/entities/role.entity";
import { RolePermission } from "./modules/roles/entities/role-permission.entity";
import { UserRole } from "./common/enums/role.enum";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const roleRepo: Repository<Role> = app.get(getRepositoryToken(Role));
  const permRepo: Repository<RolePermission> = app.get(
    getRepositoryToken(RolePermission),
  );

  console.log("Checking permissions for DEPARTMENT_HEAD...");

  const role = await roleRepo.findOne({
    where: { name: UserRole.DEPARTMENT_HEAD },
  });
  if (!role) {
    console.error("CRITICAL: DEPARTMENT_HEAD role not found in DB!");
    await app.close();
    return;
  }

  const perms = await permRepo.find({ where: { role: { id: role.id } } });
  const hasVerify = perms.some((p) => p.permissionCode === "VERIFY_REPORT");
  const hasApprove = perms.some((p) => p.canApprove === true);

  console.log(`Role ID: ${role.id}`);
  console.log(`Total Permissions: ${perms.length}`);
  console.log(`Has VERIFY_REPORT code: ${hasVerify}`);
  console.log(`Has canApprove flag: ${hasApprove}`);

  if (hasVerify && hasApprove) {
    console.log("SUCCESS: Permissions are correctly assigned.");
  } else {
    console.error("FAILURE: Missing permissions.");
    console.log(
      "Permissions list:",
      perms.map((p) => p.permissionCode),
    );
  }

  await app.close();
}

bootstrap();
