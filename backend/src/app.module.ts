import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "./database/database.module";
import { SubmissionsModule } from "./modules/submissions/submissions.module";
import { UsersModule } from "./modules/users/users.module";
import { OrganizationsModule } from "./modules/organizations/organizations.module";
import { FormsModule } from "./modules/forms/forms.module";
import { DiseasesModule } from "./modules/diseases/diseases.module";
import { ExportsModule } from "./modules/exports/exports.module";
import { ImportsModule } from "./modules/imports/imports.module";
import { DailyReportsModule } from "./modules/daily-reports/daily-reports.module";
import { AnalysisModule } from "./modules/analysis/analysis.module";

import { AuthModule } from "./modules/auth/auth.module";
import { DepartmentsModule } from "./modules/departments/departments.module";
import { PermissionsModule } from "./modules/permissions/permissions.module";
import { RolesModule } from "./modules/roles/roles.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule, // Added AuthModule
    SubmissionsModule,
    UsersModule,
    OrganizationsModule,
    FormsModule,
    DiseasesModule,
    ExportsModule,
    ImportsModule,
    DailyReportsModule,
    AnalysisModule,
    DepartmentsModule,
    PermissionsModule,
    RolesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
