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

@Entity("sanitary_daily_reports")
@Unique(["reportDate", "organization", "isTest"])
export class SanitaryDailyReport {
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

  // Tekshirilgan ob'ektlar (Inspected objects)
  @Column({ default: 0 })
  inspected_total: number;
  @Column({ default: 0 })
  inspected_mtm: number;
  @Column({ default: 0 })
  inspected_school: number;
  @Column({ default: 0 })
  inspected_dpm: number;
  @Column({ default: 0 })
  inspected_other: number;

  // Aniqlangan kamchiliklar (Deficiencies identified)
  @Column({ default: 0 })
  defects_total: number;
  @Column({ default: 0 })
  defects_mtm: number;
  @Column({ default: 0 })
  defects_school: number;
  @Column({ default: 0 })
  defects_dpm: number;
  @Column({ default: 0 })
  defects_other: number;

  // Solingan jarimalar (Fines imposed)
  @Column({ default: 0 })
  fines_total: number;
  @Column({ default: 0 })
  fines_mtm: number;
  @Column({ default: 0 })
  fines_school: number;
  @Column({ default: 0 })
  fines_dpm: number;
  @Column({ default: 0 })
  fines_other: number;

  // Ish faoliyati to'xtatilganlar (Work activities suspended)
  @Column({ default: 0 })
  suspended_total: number;
  @Column({ default: 0 })
  suspended_mtm: number;
  @Column({ default: 0 })
  suspended_school: number;
  @Column({ default: 0 })
  suspended_dpm: number;
  @Column({ default: 0 })
  suspended_other: number;

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
  verifiedBy: User; // Bo'lim mudiri (Sanitary Head)

  @Column({ nullable: true })
  verifiedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "approved_by_id" })
  approvedBy: User; // Bo'lim boshlig'i (Rahbar)

  @Column({ nullable: true })
  approvedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "executor_id" })
  executor: User; // Kirituvchi (Sanitary Specialist/Operator)

  @Column({ nullable: true, unique: true })
  verificationToken: string; // QR kod uchun unikal tokèn (Mudir)

  @Column({ nullable: true, unique: true })
  approvalToken: string; // QR kod uchun unikal tokèn (Rahbar)
}
