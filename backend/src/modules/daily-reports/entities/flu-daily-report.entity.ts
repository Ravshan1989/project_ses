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

@Entity("flu_daily_reports")
@Unique(["reportDate", "organization", "isTest"])
export class FluDailyReport {
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
  institution_count: number; // Muassasa soni

  // O'tkir respirator infeksiyalar (O'RI / ARI)
  @Column({ default: 0 }) ari_total: number;
  @Column({ default: 0 }) ari_0_1: number;
  @Column({ default: 0 }) ari_1_2: number;
  @Column({ default: 0 }) ari_3_6: number;
  @Column({ default: 0 }) ari_7_14: number;
  @Column({ default: 0 }) ari_adult: number;
  @Column({ default: 0 }) ari_students: number;
  @Column({ default: 0 }) ari_nursery: number;

  // O'tkir zotiljam (O'P / Pneumonia)
  @Column({ default: 0 }) pneu_total: number;
  @Column({ default: 0 }) pneu_0_2: number;
  @Column({ default: 0 }) pneu_3_6: number;
  @Column({ default: 0 }) pneu_7_14: number;
  @Column({ default: 0 }) pneu_adult: number;
  @Column({ default: 0 }) pneu_students: number;
  @Column({ default: 0 }) pneu_nursery: number;

  // Grippga o'xshash kasalliklar (GK / Flu)
  @Column({ default: 0 }) flu_total: number;
  @Column({ default: 0 }) flu_0_1: number;
  @Column({ default: 0 }) flu_1_2: number;
  @Column({ default: 0 }) flu_3_6: number;
  @Column({ default: 0 }) flu_7_14: number;
  @Column({ default: 0 }) flu_adult: number;
  @Column({ default: 0 }) flu_students: number;
  @Column({ default: 0 }) flu_nursery: number;

  // Og'ir o'tkir respirator infeksiyalar (SARI)
  @Column({ default: 0 }) sari_total: number;
  @Column({ default: 0 }) sari_0_2: number;
  @Column({ default: 0 }) sari_3_6: number;
  @Column({ default: 0 }) sari_7_14: number;
  @Column({ default: 0 }) sari_adult: number;

  // Vafot etganlar (Deaths)
  @Column({ default: 0 }) death_total: number;
  @Column({ default: 0 }) death_pregnant: number;

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
