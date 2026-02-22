import { DataSource, ILike } from "typeorm";
import { Organization } from "./modules/organizations/entities/organization.entity";
import { User } from "./modules/users/entities/user.entity";
import { Department } from "./modules/departments/entities/department.entity";
import { Role } from "./modules/roles/entities/role.entity";
import { UserPermission } from "./modules/permissions/entities/user-permission.entity";
import { DepartmentPermission } from "./modules/permissions/entities/department-permission.entity";
import { RolePermission } from "./modules/roles/entities/role-permission.entity";
import { Permission } from "./modules/permissions/entities/permission.entity";
import { Submission } from "./modules/submissions/entities/submission.entity";
import { SosAlert } from "./modules/sos/entities/sos-alert.entity";
import { SosDisease } from "./modules/sos/entities/sos-disease.entity";
import { Template } from "./modules/forms/entities/template.entity";
import { Disease } from "./modules/diseases/entities/disease.entity";
import { AriDailyReport } from "./modules/daily-reports/entities/ari-daily-report.entity";
import { CovidDailyReport } from "./modules/daily-reports/entities/covid-daily-report.entity";
import { DiarrheaDailyReport } from "./modules/daily-reports/entities/diarrhea-daily-report.entity";
import { EpidemiologyDailyReport } from "./modules/daily-reports/entities/epidemiology-daily-report.entity";
import { FluDailyReport } from "./modules/daily-reports/entities/flu-daily-report.entity";
import { HepatitisDailyReport } from "./modules/daily-reports/entities/hepatitis-daily-report.entity";
import { UserRole } from "./common/enums/role.enum";
import * as bcrypt from "bcrypt";
import * as dotenv from "dotenv";

dotenv.config();

async function seedBostonliqUsers() {
  const ds = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    entities: [
      Organization,
      User,
      Department,
      Role,
      UserPermission,
      DepartmentPermission,
      RolePermission,
      Permission,
      Submission,
      SosAlert,
      SosDisease,
      Template,
      Disease,
      AriDailyReport,
      CovidDailyReport,
      DiarrheaDailyReport,
      EpidemiologyDailyReport,
      FluDailyReport,
      HepatitisDailyReport,
    ],
    synchronize: false,
  });

  try {
    await ds.initialize();
    console.log("Database connected.");

    const org = await ds.getRepository(Organization).findOne({
      where: { name: ILike("%Bo%ston%") },
    });

    if (!org) {
      console.error("Bo'stonliq organization not found.");
      return;
    }

    const passwordHash = await bcrypt.hash("Ses2026!@#", 10);

    const usersToCreate = [
      {
        username: "bostonliq_boshliq",
        firstName: "Bo'lim",
        lastName: "Boshlig'i",
        role: UserRole.DEPARTMENT_HEAD,
      },
      {
        username: "bostonliq_mudir",
        firstName: "Bo'lim",
        lastName: "Mudiri",
        role: UserRole.DEPARTMENT_HEAD,
      },
      {
        username: "bostonliq_hod1",
        firstName: "Hodim",
        lastName: "1",
        role: UserRole.STAFF,
      },
      {
        username: "bostonliq_hod2",
        firstName: "Hodim",
        lastName: "2",
        role: UserRole.STAFF,
      },
      {
        username: "bostonliq_hod3",
        firstName: "Hodim",
        lastName: "3",
        role: UserRole.STAFF,
      },
    ];

    for (const u of usersToCreate) {
      const existing = await ds
        .getRepository(User)
        .findOne({ where: { username: u.username } });
      if (existing) {
        console.log(`User ${u.username} already exists.`);
        continue;
      }

      const newUser = ds.getRepository(User).create({
        ...u,
        passwordHash,
        organization: org,
      });

      await ds.getRepository(User).save(newUser);
      console.log(`User ${u.username} created.`);
    }

    console.log("All users processed successfully.");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    if (ds.isInitialized) {
      await ds.destroy();
    }
  }
}

seedBostonliqUsers();
