import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { ReportStatus } from '../../common/enums/report-status.enum';

@Injectable()
export class VerificationService {
    private readonly logger = new Logger(VerificationService.name);

    constructor(private dataSource: DataSource) { }

    /**
     * UZ: Hisobot uchun unikal verification token generatsiya qilish
     */
    generateToken(): string {
        return uuidv4();
    }

    /**
     * UZ: Token bo'yicha QR kodni (Base64) generatsiya qilish
     */
    async generateQRCode(token: string): Promise<string> {
        try {
            const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify/${token}`;
            return await QRCode.toDataURL(verificationUrl);
        } catch (err) {
            this.logger.error('QR kod yaratishda xatolik:', err);
            throw new Error('QR kod yaratib bo\'lmadi');
        }
    }

    /**
     * UZ: Token bo'yicha QR kod (Buffer) generatsiya qilish (Excel/PDF uchun)
     */
    async generateQRCodeBuffer(token: string): Promise<Buffer> {
        try {
            const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify/${token}`;
            return await QRCode.toBuffer(verificationUrl);
        } catch (err) {
            this.logger.error('QR kod buffer yaratishda xatolik:', err);
            throw new Error('QR kod buffer yaratib bo\'lmadi');
        }
    }

    /**
     * UZ: Token orqali hisobotni va uning statusini tekshirish
     */
    async verifyReport(token: string) {
        const tables = [
            'hepatitis_daily_reports',
            'ari_daily_reports',
            'flu_daily_reports',
            'covid_daily_reports',
            'epidemiology_daily_reports',
        ];

        for (const table of tables) {
            const report = await this.dataSource.query(
                `SELECT r.*, o.name as organization_name, u.username as verifier_name 
         FROM "${table}" r 
         LEFT JOIN organizations o ON o.id = r.organization_id
         LEFT JOIN users u ON u.id = r.verified_by_id
         WHERE r."verificationToken" = $1`,
                [token],
            );

            if (report && report.length > 0) {
                return {
                    found: true,
                    table,
                    data: report[0],
                };
            }
        }

        throw new NotFoundException('Hisobot topilmadi yoki token noto\'g\'ri');
    }
}
