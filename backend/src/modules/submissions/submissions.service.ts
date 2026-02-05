import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Submission } from "./entities/submission.entity";
import { CreateSubmissionDto } from "./dto/create-submission.dto";
import { UpdateStatusDto } from "./dto/update-status.dto";
import { SubmissionStatus } from "../../common/enums/status.enum";
import { User } from "../../modules/users/entities/user.entity";
import { UserRole } from "../../common/enums/role.enum";
import { getRoleLevel } from "../../common/utils/role.util";

@Injectable()
export class SubmissionsService {
  constructor(
    @InjectRepository(Submission)
    private submissionRepository: Repository<Submission>,
  ) { }

  async create(createSubmissionDto: CreateSubmissionDto, user: User) {
    // Basic validation: User must belong to an organization
    if (!user.organization) {
      throw new BadRequestException("User does not belong to any organization");
    }

    const submission = this.submissionRepository.create({
      ...createSubmissionDto,
      submittedBy: user,
      organization: user.organization,
      status: SubmissionStatus.DRAFT,
      isTest: createSubmissionDto.isTest || false, // UZ: Test bayrog'ini saqlash
    });
    return this.submissionRepository.save(submission);
  }

  async findAll(query: any, user: User) {
    const level = getRoleLevel(user.role);
    const where: any = { ...query };

    if (level === 3) {
      where.organization = { id: user.organization.id };
    } else if (level === 2) {
      where.organization = { parent: { id: user.organization.id } };
    }

    return this.submissionRepository.find({
      where,
      relations: ["organization", "template", "submittedBy"],
    });
  }

  async findOne(id: string, user: User) {
    const level = getRoleLevel(user.role);
    const where: any = { id };

    if (level === 3) {
      where.organization = { id: user.organization.id };
    } else if (level === 2) {
      // In findOne, we should allow region head to see their sub-orgs or they won't be able to approve
      // But we must NOT allow cross-region access if it were a multi-region system.
      // For now, level 2 check.
    }

    const submission = await this.submissionRepository.findOne({
      where,
      relations: ["organization", "template"],
    });
    if (!submission) throw new NotFoundException(`Submission ${id} not found`);
    return submission;
  }

  // WORKFLOW LOGIC
  async updateStatus(id: string, updateStatusDto: UpdateStatusDto, user: User) {
    const submission = await this.findOne(id, user);
    const { action, comment } = updateStatusDto;

    // Check Permissions (Simplified)
    // Only REGION_HEAD or ADMIN can approve/reject
    if ([UserRole.REGION_HEAD, UserRole.ADMIN].includes(user.role) === false) {
      // if not admin/region_head, maybe they are submitting?
      if (action === "SUBMIT" && submission.status === SubmissionStatus.DRAFT) {
        // District staff submitting to region
        submission.status = SubmissionStatus.SUBMITTED;
        return this.submissionRepository.save(submission);
      }
      throw new ForbiddenException(
        "You do not have permission to change status",
      );
    }

    if (action === "APPROVE") {
      submission.status = SubmissionStatus.APPROVED;
    } else if (action === "REJECT") {
      if (!comment)
        throw new BadRequestException("Comment is required for rejection");
      submission.status = SubmissionStatus.REJECTED;
      submission.rejectionReason = comment;
    }

    return this.submissionRepository.save(submission);
  }

  // XATOLIK BO'YICHA IZOH:
  // Oldingi kodda 'template' relation sifatida yuklanmaganligi sababli 'find' metodida 'template: { code: templateCode }'
  // filtri ishlashida muammo bo'lishi mumkin (TypeORM versiyasiga qarab).
  // Shuningdek, organization null bo'lgan holatda xatolik yuz berishi mumkin.
  // Quyida tuzatilgan versiya keltirilgan.

  // async getStatusSummary(templateCode: string, period: string) {
  //     // Fetch all submissions for this template and period
  //     const submissions = await this.submissionRepository.find({
  //         where: {
  //             template: { code: templateCode },
  //             reportingPeriod: period
  //         },
  //         relations: ['organization']
  //     });
  //
  //     return submissions.map(s => ({
  //         organizationId: s.organization.id,
  //         organizationName: s.organization.name,
  //         status: s.status,
  //         submissionId: s.id
  //     }));
  // }

  async getStatusSummary(templateCode: string, period: string, includeTest = false, user: User) {
    const level = getRoleLevel(user.role);
    const where: any = {
      template: { code: templateCode },
      reportingPeriod: period,
      isTest: includeTest,
    };

    if (level === 3) {
      where.organization = { id: user.organization.id };
    } else if (level === 2) {
      where.organization = { parent: { id: user.organization.id } };
    }

    const submissions = await this.submissionRepository.find({
      where,
      relations: ["organization", "template"],
    });

    return submissions
      .filter((s) => s.organization) // Organization yo'q bo'lsa (baza xatosi) ularni o'tkazib yuboramiz
      .map((s) => ({
        organizationId: s.organization.id,
        organizationName: s.organization.name,
        status: s.status,
        submissionId: s.id,
      }));
  }

  async cleanupTest() {
    await this.submissionRepository.delete({ isTest: true });
    return { success: true, message: "Test hisobotlari muvaffaqiyatli o'chirildi" };
  }
}
