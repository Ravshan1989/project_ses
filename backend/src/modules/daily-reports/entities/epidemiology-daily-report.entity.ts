import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  Index,
} from "typeorm";
import { Organization } from "../../organizations/entities/organization.entity";
import { User } from "../../users/entities/user.entity";
import { ReportStatus } from "../../../common/enums/report-status.enum";

@Entity("epidemiology_daily_reports")
@Unique(["reportDate", "organization", "isTest"])
export class EpidemiologyDailyReport {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index()
  @Column({ type: "date" })
  reportDate: string;

  @Index()
  @ManyToOne(() => Organization)
  @JoinColumn({ name: "organization_id" })
  organization: Organization;

  @Column({ default: false })
  isTest: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // UZ: Tasdiqlash tizimi (Append-Only)
  @Column({
    type: "enum",
    enum: ReportStatus,
    default: ReportStatus.DRAFT,
  })
  status: ReportStatus;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "verified_by_id" })
  verifiedBy: User; // Bo'lim mudiri

  @Column({ nullable: true })
  verifiedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "approved_by_id" })
  approvedBy: User; // Bo'lim boshlig'i (Rahbar)

  @Column({ nullable: true })
  approvedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "executor_id" })
  executor: User; // Kirituvchi (Vrach/Operator)

  @Column({ nullable: true, unique: true })
  verificationToken: string; // QR kod uchun unikal tokèn (Mudir)

  @Column({ nullable: true, unique: true })
  approvalToken: string; // QR kod uchun unikal tokèn (Rahbar)
}

/**
 * [ORIGINAL_REDACTED_CODE_PRESERVATION]
 * 
 * Original fields removed from EpidemiologyDailyReport:
 * - inspected_total, inspected_mtm, inspected_school, inspected_dpm, inspected_other
 * - defects_total, defects_mtm, defects_school, defects_dpm, defects_other
 * - fines_total, fines_mtm, fines_school, fines_dpm, fines_other
 * - suspended_total, suspended_mtm, suspended_school, suspended_dpm, suspended_other
 */
