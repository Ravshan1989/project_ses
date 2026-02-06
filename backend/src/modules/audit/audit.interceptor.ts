import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { AuditService } from "./audit.service";

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    constructor(private auditService: AuditService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url, body, user, ip } = request;
        const userAgent = request.headers["user-agent"];

        // UZ: Faqat ma'lumotni o'zgartiruvchi metodlarni kuzatamiz
        const skipMethods = ["GET", "HEAD", "OPTIONS"];
        if (skipMethods.includes(method)) {
            return next.handle();
        }

        return next.handle().pipe(
            tap(async (data) => {
                try {
                    // UZ: Audit yozuvini yaratish
                    await this.auditService.createLog({
                        user: user, // UZ: AuthGuard'dan kelgan user
                        action: method,
                        module: this.extractModule(url),
                        newData: this.sanitize(body), // UZ: Maxfiy ma'lumotlarni tozalash
                        ipAddress: ip,
                        userAgent: userAgent,
                    });
                } catch (e) {
                    console.error("Audit log saqlashda xatolik:", e);
                }
            })
        );
    }

    // UZ: Maxfiy ma'lumotlarni auditdan o'chirish
    private sanitize(data: any): any {
        if (!data || typeof data !== "object") return data;
        const sanitized = { ...data };
        const sensitiveKeys = ["password", "token", "secret", "newPassword"];

        for (const key of sensitiveKeys) {
            if (sanitized[key]) {
                sanitized[key] = "********";
            }
        }
        return sanitized;
    }

    // UZ: URL'dan modul nomini ajratib olish
    private extractModule(url: string): string {
        const parts = url.split("/");
        return parts[2] || "unknown";
    }
}
