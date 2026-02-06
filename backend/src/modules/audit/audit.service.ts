import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuditLog } from "./entities/audit.entity";

@Injectable()
export class AuditService {
    constructor(
        @InjectRepository(AuditLog)
        private auditLogRepository: Repository<AuditLog>
    ) { }

    // UZ: Yangi audit yozuvini saqlash
    async createLog(data: Partial<AuditLog>): Promise<AuditLog> {
        const log = this.auditLogRepository.create(data);
        return await this.auditLogRepository.save(log);
    }

    // UZ: Tizimdagi barcha amallarni olish (Admin uchun)
    async findAll(): Promise<AuditLog[]> {
        return await this.auditLogRepository.find({
            relations: ["user"],
            order: { createdAt: "DESC" },
        });
    }
}
