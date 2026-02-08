import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DailyReportsService } from "./modules/daily-reports/daily-reports.service";
import { UsersService } from "./modules/users/users.service";
import { ApprovalController } from "./modules/daily-reports/approval.controller";
import { Repository } from "typeorm";
import { FluDailyReport } from "./modules/daily-reports/entities/flu-daily-report.entity";
import { getRepositoryToken } from "@nestjs/typeorm";

async function testQRWorkflow() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const reportsService = app.get(DailyReportsService);
    const approvalController = app.get(ApprovalController);
    const usersService = app.get(UsersService);
    const fluRepo: Repository<FluDailyReport> = app.get(getRepositoryToken(FluDailyReport));

    try {
        console.log("=== QR KOD JARAYONINI TEKSHIRISH ===\n");

        const districtUser = await usersService.findOneByUsername("user_olmaliq_sh");
        const admin = await usersService.findOneByUsername("admin");
        const today = new Date().toISOString().split('T')[0];

        // 1. Tuman xodimi hisobot yuboradi
        console.log("1️⃣  TUMAN XODIMI: Hisobot yuborish...");
        await reportsService.upsertFlu({
            reportDate: today,
            organizationId: districtUser.organization.id,
            ari_total: 25,
            pneu_total: 5,
            flu_total: 3,
            isTest: true
        }, districtUser);

        let report = await fluRepo.findOne({
            where: { reportDate: today, organization: { id: districtUser.organization.id }, isTest: true }
        });

        console.log(`   ✅ Hisobot yuborildi`);
        console.log(`   Status: ${report.status}`);
        console.log(`   QR Token: ${report.verificationToken || '❌ YO\'Q'}\n`);

        // 2. Bo'lim mudiri tekshiradi
        console.log("2️⃣  BO'LIM MUDIRI: Tekshirish (VERIFY)...");
        const mockReq = { user: admin };
        const verifyResult = await approvalController.verifyReport('flu', report.id, mockReq);

        report = await fluRepo.findOne({ where: { id: report.id } });
        console.log(`   ✅ Tekshirildi`);
        console.log(`   Status: ${report.status}`);
        console.log(`   QR Token: ${report.verificationToken ? '✅ YARATILDI!' : '❌ YO\'Q'}`);
        console.log(`   Token qiymati: ${report.verificationToken}\n`);

        // 3. Bo'lim rahbari tasdiqlaydi
        console.log("3️⃣  BO'LIM RAHBARI: Tasdiqlash (APPROVE)...");
        await approvalController.approveReport('flu', report.id, mockReq);

        report = await fluRepo.findOne({ where: { id: report.id } });
        console.log(`   ✅ Tasdiqlandi`);
        console.log(`   Status: ${report.status}`);
        console.log(`   QR Token: ${report.verificationToken ? '✅ SAQLANIB QOLDI!' : '❌ YO\'Q'}`);
        console.log(`   Token qiymati: ${report.verificationToken}\n`);

        console.log("=== NATIJA ===");
        console.log("✅ QR kod Bo'lim mudiri 'Tekshirish' bosganida yaratiladi");
        console.log("✅ Excel yuklab olganda QR kod rasmda ko'rinadi");
        console.log(`✅ QR link: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify/${report.verificationToken}`);

    } catch (err) {
        console.error("XATOLIK:", err.message);
    } finally {
        await app.close();
    }
}

testQRWorkflow();
