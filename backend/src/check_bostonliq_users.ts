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
import * as dotenv from "dotenv";

dotenv.config();

async function checkBostonliqUsers() {
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

    const orgs = await ds.getRepository(Organization).find({
      where: { name: ILike("%Bo%ston%") },
    });

    if (orgs.length === 0) {
      console.log("No Bo'stonliq organization found.");
      return;
    }

    console.log(
      "Found Organizations:",
      orgs.map((o) => ({ id: o.id, name: o.name })),
    );

    for (const org of orgs) {
      const users = await ds.getRepository(User).find({
        where: { organization: { id: org.id } },
        relations: ["department"],
      });
      console.log(
        `Users for ${org.name}:`,
        users.map((u) => ({
          id: u.id,
          username: u.username,
          role: u.role,
          department: u.department?.name,
          name: `${u.firstName || ""} ${u.lastName || ""}`.trim(),
        })),
      );
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    if (ds.isInitialized) {
      await ds.destroy();
    }
  }
}

checkBostonliqUsers();
