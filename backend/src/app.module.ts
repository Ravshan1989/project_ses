import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "./database/database.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { SubmissionsModule } from "./modules/submissions/submissions.module";
import { UsersModule } from "./modules/users/users.module";
import { OrganizationsModule } from "./modules/organizations/organizations.module";
import { FormsModule } from "./modules/forms/forms.module";
import { DiseasesModule } from "./modules/diseases/diseases.module";
import { ExportsModule } from "./modules/exports/exports.module";
import { ImportsModule } from "./modules/imports/imports.module";
import { DailyReportsModule } from "./modules/daily-reports/daily-reports.module";
import { AnalysisModule } from "./modules/analysis/analysis.module";
import { TelegramModule } from "./modules/telegram/telegram.module";
import { SosModule } from "./modules/sos/sos.module";
import { UpdatesModule } from "./modules/updates/updates.module";
import { SeedingModule } from "./modules/seeding/seeding.module";
import { KommunalHygieneModule } from "./modules/kommunal-hygiene/kommunal-hygiene.module";
import { ChildrenHygieneModule } from "./modules/children-hygiene/children-hygiene.module";
import { AppealsModule } from "./modules/appeals/appeals.module";
import { NutritionHygieneModule } from "./modules/nutrition-hygiene/nutrition-hygiene.module";
import { InspectionsModule } from "./modules/inspections/inspections.module";

import { AuthModule } from "./modules/auth/auth.module";
import { DepartmentsModule } from "./modules/departments/departments.module";
import { PermissionsModule } from "./modules/permissions/permissions.module";
import { RolesModule } from "./modules/roles/roles.module";
import { AuditModule } from "./modules/audit/audit.module"; // UZ: Audit loglari uchun moduli
// import { AuditInterceptor } from "./modules/audit/audit.interceptor"; // UZ: Audit interceptori
import { ValidationModule } from "./modules/validation/validation.module"; // UZ: Validatsiya moduli
import { NotificationsModule } from "./modules/notifications/notifications.module"; // UZ: Real-vaqt bildirishnomalari
// import { NotificationInterceptor } from "./modules/notifications/notifications.interceptor"; // UZ: Bildirishnomalar interceptori
import { EventEmitterModule } from "@nestjs/event-emitter"; // UZ: Ichki eventlar uchun

import { ScheduleModule } from "@nestjs/schedule";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core"; // UZ: Global interceptor va guardlar uchun

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(), // UZ: Taymerlar uchun modul
    DatabaseModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]), // UZ: Rate limiting - 1 daqiqada 100 ta so'rov
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
    TelegramModule,
    SosModule,
    AuditModule, // UZ: Audit moduli qo'shildi
    ValidationModule, // UZ: Mantiqiy validatsiya moduli qo'shildi
    NotificationsModule, // UZ: Bildirishnomalar moduli qo'shildi
    EventEmitterModule.forRoot(), // UZ: Eventlar tizimini yoqish
    UpdatesModule, // UZ: Yangilanishlar moduli
    SeedingModule, // UZ: Avtomatik ma'lumotlarni to'ldirish (Auto-fix)
    KommunalHygieneModule, // UZ: Kommunal gigiyena oylik hisobotlari
    ChildrenHygieneModule, // UZ: Bolalar va o'smirlar gigiyenasi
    AppealsModule, // UZ: Ijro intizomi va murojaatlar bilan ishlash
    NutritionHygieneModule, // UZ: Ovqatlanish gigiyenasi oylik hisobotlari
    InspectionsModule, // UZ: Nazoratlarni muvofiqlashtirish

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "public"),
      serveRoot: "/public",
    }),
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard }, // UZ: Global rate limiting
    // { provide: APP_INTERCEPTOR, useClass: AuditInterceptor }, // UZ: Global audit loglarini yozish uchun
    // { provide: APP_INTERCEPTOR, useClass: NotificationInterceptor }, // UZ: Bildirishnomalar uchun interceptor
  ],
})
export class AppModule {}
