import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Department } from "./modules/departments/entities/department.entity";
import { Permission } from "./modules/permissions/entities/permission.entity";
import { DepartmentPermission } from "./modules/permissions/entities/department-permission.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const deptRepo: Repository<Department> = app.get(
    getRepositoryToken(Department),
  );
  const permRepo: Repository<Permission> = app.get(
    getRepositoryToken(Permission),
  );
  const deptPermRepo: Repository<DepartmentPermission> = app.get(
    getRepositoryToken(DepartmentPermission),
  );

  // 1. Define Permissions
  const permissionsData = [
    { code: "VIEW_HEPATITIS", description: "View Hepatitis Reports" },
    { code: "VIEW_FLU", description: "View Flu/ARI Reports" },
    { code: "VIEW_EPIDEMIOLOGY", description: "View Epidemiology Reports" },
    { code: "VIEW_WEEKLY_SUMMARY", description: "View Weekly Summaries" },
    { code: "VIEW_COVID", description: "View Covid-19 Reports" },

    // Forma 1 Permissions
    { code: "VIEW_FORM1_TABLE1", description: "View/Edit Form 1 Table 1" },
    { code: "VIEW_FORM1_TABLE2", description: "View Form 1 Table 2" },
    { code: "VIEW_FORM1_TABLE3", description: "View Form 1 Table 3" },
    { code: "EDIT_FORM1_TABLE1", description: "Edit Form 1 Table 1" },
    {
      code: "MANAGE_DEPARTMENTS",
      description: "Create/Edit Departments and Permissions",
    },
  ];

  console.log("Seeding Permissions...");
  for (const p of permissionsData) {
    let perm = await permRepo.findOneBy({ code: p.code });
    if (!perm) {
      perm = permRepo.create(p);
      await permRepo.save(perm);
      console.log(`Created Permission: ${p.code}`);
    }
  }

  // 2. Define Departments
  const departmentsData = [
    {
      name: "Epidemiologiya Bo'limi",
      description: "Faqat epidemiologiya va haftalik xulosani ko'radi",
      level: 1,
    },
    { name: "VGA Bo'limi", description: "Faqat gepatitni ko'radi", level: 1 },
    {
      name: "O'RI va Gripp Bo'limi",
      description: "Faqat grippni ko'radi",
      level: 1,
    },
    {
      name: "Boshqaruv (Admin)",
      description: "Hamma narsani ko'radi",
      level: 1,
    },

    // Tuman Darajasi
    {
      name: "Epidemiologiya va immunoprofilaktika",
      description: "Tuman darajasi: Faqat Forma 1-jadval va kunliklar",
      level: 3,
    },
  ];

  console.log("Seeding Departments...");
  for (const d of departmentsData) {
    let dept = await deptRepo.findOneBy({ name: d.name });
    if (!dept) {
      dept = deptRepo.create(d);
      await deptRepo.save(dept);
      console.log(`Created Department: ${d.name}`);
    }
  }

  // 3. Assign Permissions
  const assignments = [
    {
      dept: "Epidemiologiya Bo'limi",
      perms: ["VIEW_EPIDEMIOLOGY", "VIEW_WEEKLY_SUMMARY"],
    },
    { dept: "VGA Bo'limi", perms: ["VIEW_HEPATITIS"] },
    { dept: "O'RI va Gripp Bo'limi", perms: ["VIEW_FLU"] },
    {
      dept: "Boshqaruv (Admin)",
      perms: [
        "VIEW_HEPATITIS",
        "VIEW_FLU",
        "VIEW_EPIDEMIOLOGY",
        "VIEW_WEEKLY_SUMMARY",
        "VIEW_COVID",
        "VIEW_FORM1_TABLE1",
        "VIEW_FORM1_TABLE2",
        "VIEW_FORM1_TABLE3",
        "EDIT_FORM1_TABLE1",
        "MANAGE_DEPARTMENTS",
      ],
    },

    // Tuman Assignment: ONLY Table 1 (Table 2 & 3 HIDDEN). Plus Daily Reports.
    {
      dept: "Epidemiologiya va immunoprofilaktika",
      perms: [
        "VIEW_FORM1_TABLE1",
        "EDIT_FORM1_TABLE1",
        "VIEW_HEPATITIS",
        "VIEW_FLU",
        "VIEW_EPIDEMIOLOGY",
        "VIEW_WEEKLY_SUMMARY",
        "VIEW_COVID",
      ],
    },
  ];

  console.log("Assigning Permissions to Departments...");
  for (const assign of assignments) {
    const dept = await deptRepo.findOneBy({ name: assign.dept });
    if (!dept) continue;

    for (const code of assign.perms) {
      const perm = await permRepo.findOneBy({ code });
      if (!perm) continue;

      const exists = await deptPermRepo.findOne({
        where: { department: { id: dept.id }, permission: { id: perm.id } },
        relations: ["department", "permission"], // Explicit relations
      });

      if (!exists) {
        const dp = deptPermRepo.create({ department: dept, permission: perm });
        await deptPermRepo.save(dp);
        console.log(`Assigned ${code} to ${assign.dept}`);
      }
    }
  }

  console.log("Seeding Complete.");
  await app.close();
}

bootstrap();
