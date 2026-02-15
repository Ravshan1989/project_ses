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

@Entity("hepatitis_daily_reports")
@Unique(["reportDate", "organization", "isTest"])
export class HepatitisDailyReport {
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

  // Jami
  @Column({ default: 0 })
  total_cases: number;

  // Yoshlari bo'yicha
  @Column({ default: 0 })
  age_under_1: number;
  @Column({ default: 0 })
  age_1_3: number;
  @Column({ default: 0 })
  age_4_6: number;
  @Column({ default: 0 })
  age_7_14: number;
  @Column({ default: 0 })
  age_15_19: number;
  @Column({ default: 0 })
  age_20_plus: number;

  // Kasbi bo'yicha
  @Column({ default: 0 })
  occ_unorganized: number; // Uyushmagan (u-1)
  @Column({ default: 0 })
  occ_unorganized_1_6: number; // Uyushmagan bog'cha yosh (1-6)
  @Column({ default: 0 })
  occ_organized_1_6: number; // Uyushgan bog'cha (1-6)
  @Column({ default: 0 })
  occ_unorganized_school_age: number; // Uyushmagan maktab yosh
  @Column({ default: 0 })
  occ_students: number; // O'quvchilar
  @Column({ default: 0 })
  occ_college_students: number; // Talabalar
  @Column({ default: 0 })
  occ_workers: number; // Kattalar (ishchi/xizmatchi)

  // Yuqish omili
  @Column({ default: 0 })
  factor_water: number;
  @Column({ default: 0 })
  factor_food: number;
  @Column({ default: 0 })
  factor_contact: number;

  // Lab
  @Column({ default: 0 })
  lab_samples: number;
  @Column({ default: 0 })
  lab_positive: number;

  // Dezinfeksiya
  @Column({ default: 0 })
  disinfection_done: number;

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
