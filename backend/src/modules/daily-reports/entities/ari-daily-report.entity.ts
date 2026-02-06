import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from "typeorm";
import { Organization } from "../../organizations/entities/organization.entity";
import { User } from "../../users/entities/user.entity";
import { ReportStatus } from "../../../common/enums/report-status.enum";

@Entity("ari_daily_reports")
@Unique(["reportDate", "organization", "isTest"])
export class AriDailyReport {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "date" })
  reportDate: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: "organization_id" })
  organization: Organization;

  @Column({ default: false })
  isTest: boolean;

  @Column({ default: 0 })
  gk: number; // Grippsimon kasalliklar

  @Column({ default: 0 })
  ari: number; // O'tkir respirator infeksiyalar (O'RI)

  @Column({ default: 0 })
  pneumonia: number; // O'tkir Zotiljam (O'P)

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

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "approved_by_id" })
  approvedBy: User; // Bo'lim boshlig'i (Rahbar)

  @Column({ nullable: true, unique: true })
  verificationToken: string; // QR kod uchun unikal tokèn
}
