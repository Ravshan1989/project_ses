import { Injectable, Logger, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SosDisease, SosDiseaseType } from "./entities/sos-disease.entity";
import {
  SosAlert,
  SosStatus,
  SosReviewStatus,
} from "./entities/sos-alert.entity";
import { CreateSosDiseaseDto } from "./dto/create-sos-disease.dto";
import { CreateSosAlertDto } from "./dto/create-sos-alert.dto";
import { User } from "../users/entities/user.entity";
import { SosBotService } from "../telegram/sos-bot.service";
import { getRoleLevel } from "../../common/utils/role.util";
import { UserRole } from "../../common/enums/role.enum";

@Injectable()
export class SosService {
  private readonly logger = new Logger(SosService.name);

  constructor(
    @InjectRepository(SosDisease)
    private diseaseRepo: Repository<SosDisease>,
    @InjectRepository(SosAlert)
    private alertRepo: Repository<SosAlert>,
    private sosBotService: SosBotService,
  ) {}

  // ADMIN logic for predefined diseases
  async createPredefinedDisease(dto: CreateSosDiseaseDto, user: User) {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        "Faqat Admin kasalliklar ro'yxatini boshqara oladi.",
      );
    }
    const disease = this.diseaseRepo.create(dto);
    return this.diseaseRepo.save(disease);
  }

  async getPredefinedDiseases() {
    return this.diseaseRepo.find({ order: { name: "ASC" } });
  }

  async deletePredefinedDisease(id: string, user: User) {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException("Faqat Admin ruxsatga ega.");
    }
    await this.diseaseRepo.delete(id);
    return { success: true };
  }

  // SOS Alert logic
  async createAlert(dto: CreateSosAlertDto, user: User) {
    if (!user.organization) {
      throw new ForbiddenException(
        "Foydalanuvchi tashkilotga biriktirilmagan.",
      );
    }

    const alert = this.alertRepo.create({
      ...dto,
      organization: user.organization,
      sender: user,
      reviewStatus: SosReviewStatus.PENDING,
    });

    const saved = await this.alertRepo.save(alert);

    // Notify via Dedicated SOS Bot
    await this.sosBotService.sendSosNotification({
      id: saved.id,
      organizationName: user.organization.name,
      senderName:
        `${user.lastName || ""} ${user.firstName || ""}`.trim() ||
        user.username,
      diseaseName: saved.diseaseName,
      status:
        saved.status === SosStatus.CONFIRMED
          ? "Aniqlangan"
          : "Gumon qilinmoqda",
      date: new Date(saved.createdAt).toLocaleString("uz-UZ"),
      comment: saved.comment,
      latitude: saved.latitude,
      longitude: saved.longitude,
    });

    this.logger.log(`SOS Alert created: ${saved.id} by ${user.username}`);
    return saved;
  }

  async getAlerts(user: User) {
    const level = getRoleLevel(user.role, user);

    // Admin or Republic Head sees all
    if (level === 1) {
      return this.alertRepo.find({
        relations: ["organization", "sender"],
        order: { createdAt: "DESC" },
      });
    }

    // Region Head sees alerts from their region's districts
    if (level === 2 && user.organization) {
      return this.alertRepo
        .createQueryBuilder("alert")
        .leftJoinAndSelect("alert.organization", "organization")
        .leftJoinAndSelect("alert.sender", "sender")
        .where("organization.parent_id = :orgId OR organization.id = :orgId", {
          orgId: user.organization.id,
        })
        .orderBy("alert.createdAt", "DESC")
        .getMany();
    }

    // District Head sees only their own
    if (level === 3 && user.organization) {
      return this.alertRepo.find({
        where: { organization: { id: user.organization.id } },
        relations: ["organization", "sender"],
        order: { createdAt: "DESC" },
      });
    }

    return [];
  }

  async markAsReviewed(id: string, user: User) {
    const level = getRoleLevel(user.role, user);
    if (level > 2) {
      throw new ForbiddenException(
        "Faqat Viloyat yoki Respublika darajasidagi xodimlar tasdiqlashi mumkin.",
      );
    }

    const alert = await this.alertRepo.findOne({ where: { id } });
    if (!alert) throw new Error("SOS hodisa topilmadi.");

    alert.reviewStatus = SosReviewStatus.REVIEWED;
    return this.alertRepo.save(alert);
  }
}
