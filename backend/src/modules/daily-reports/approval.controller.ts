import {
  Controller,
  Patch,
  Param,
  UseGuards,
  Request,
  Get,
  Query,
  ForbiddenException,
} from "@nestjs/common";
import { DataSource } from "typeorm";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UserRole } from "../../common/enums/role.enum";
import { ReportStatus } from "../../common/enums/report-status.enum";
import { VerificationService } from "./verification.service";

@Controller("api/v1/daily-reports")
@UseGuards(JwtAuthGuard)
export class ApprovalController {
  constructor(
    private dataSource: DataSource,
    private verificationService: VerificationService,
  ) {}

  /**
   * UZ: Xodim tomonidan yuborish (SUBMITTED)
   */
  @Patch(":type/:id/submit")
  async submitReport(
    @Param("type") type: string,
    @Param("id") id: string,
    @Request() req,
  ) {
    const user = req.user;
    const tableName = this.getTableName(type);

    // UZ: Faqat muallif (executor) yoki Admin yubora oladi
    const [report] = await this.dataSource.query(
      `SELECT "executor_id" FROM "${tableName}" WHERE id = $1`,
      [id],
    );

    if (
      report &&
      report.executor_id !== user.id &&
      user.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException(
        "Siz ushbu hisobotni yubora olmaysiz (muallif emassiz)",
      );
    }

    await this.dataSource.query(
      `UPDATE "${tableName}" SET status = $1 WHERE id = $2`,
      [ReportStatus.SUBMITTED, id],
    );

    return { success: true, status: ReportStatus.SUBMITTED };
  }

  /**
   * UZ: Bo'lim mudiri tomonidan tasdiqlash (VERIFIED)
   */
  @Patch(":type/:id/verify")
  async verifyReport(
    @Param("type") type: string,
    @Param("id") id: string,
    @Request() req,
  ) {
    const user = req.user;
    // Check if user is Dept Head or Admin
    const allowedRoles = [
      UserRole.DEPARTMENT_HEAD,
      UserRole.ADMIN,
      UserRole.LAB_HEAD,
      UserRole.SANITARY_HEAD, // Adding the new roles too
    ];

    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenException("Ushbu amalni bajarish uchun ruxsat yo'q");
    }

    const tableName = this.getTableName(type);
    const token = this.verificationService.generateToken();

    // UZ: Faqat SUBMITTED bo'lsa o'tadi
    await this.dataSource.query(
      `UPDATE "${tableName}" SET status = $1, "verified_by_id" = $2, "verificationToken" = $3, "verifiedAt" = NOW() WHERE id = $4`,
      [ReportStatus.VERIFIED, user.id, token, id],
    );

    return { success: true, status: ReportStatus.VERIFIED, token };
  }

  /**
   * UZ: Bo'lim boshlig'i (Rahbar) tomonidan tasdiqlash (APPROVED)
   */
  @Patch(":type/:id/approve")
  async approveReport(
    @Param("type") type: string,
    @Param("id") id: string,
    @Request() req,
  ) {
    const user = req.user;
    const allowedRoles = [UserRole.DISTRICT_HEAD, UserRole.ADMIN];
    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenException("Ushbu amalni bajarish uchun ruxsat yo'q");
    }

    const tableName = this.getTableName(type);
    const token = this.verificationService.generateToken(); // 2-QR Code

    // UZ: Faqat VERIFIED bo'lsa o'tadi
    await this.dataSource.query(
      `UPDATE "${tableName}" SET status = $1, "approved_by_id" = $2, "approvalToken" = $3, "approvedAt" = NOW() WHERE id = $4`,
      [ReportStatus.APPROVED, user.id, token, id],
    );

    return { success: true, status: ReportStatus.APPROVED, token };
  }

  /**
   * UZ: Ochiq tekshiruv (QR kod skaner qilinganda)
   */
  @Get("public/verify")
  async publicVerify(@Query("token") token: string) {
    return await this.verificationService.verifyReport(token);
  }

  private getTableName(type: string): string {
    switch (type.toLowerCase()) {
      case "hepatitis":
        return "hepatitis_daily_reports";
      case "flu":
        return "flu_daily_reports";
      case "ari":
        return "ari_daily_reports";
      case "covid":
        return "covid_daily_reports";
      case "epidemiology":
        return "epidemiology_daily_reports";
      default:
        throw new Error("Yaroqsiz hisobot turi");
    }
  }
}
