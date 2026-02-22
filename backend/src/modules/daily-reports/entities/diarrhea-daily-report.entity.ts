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

@Entity("diarrhea_daily_reports")
@Unique(["reportDate", "organization", "isTest"])
export class DiarrheaDailyReport {
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

  // Jami ro'yxatga olingan bemorlar
  @Column({ default: 0 }) total_2025: number;
  @Column({ default: 0 }) total_2026: number;

  @Column({ default: 0 }) actively_found: number; // shundan faol topilganlar
  @Column({ default: 0 }) hospitalized: number; // Shifoxonaga yotqizilganlar
  @Column({ default: 0 }) illness_days_1_2: number; // shundan kasallikni 1-2 kunlari

  // Bemorlarni yoshlari bo'yicha
  @Column({ default: 0 }) age_under_1: number;
  @Column({ default: 0 }) age_1_3: number;
  @Column({ default: 0 }) age_4_6: number;
  @Column({ default: 0 }) age_7_14: number;
  @Column({ default: 0 }) age_15_19: number;
  @Column({ default: 0 }) age_20_plus: number;

  // Bemorlarni kasblari bo'yicha
  @Column({ default: 0 }) nursery_org: number; // Uyushgan yasli
  @Column({ default: 0 }) nursery_unorg: number; // Uyushmagan yasli
  @Column({ default: 0 }) kindergarten_org: number; // Uyushgan bog'cha
  @Column({ default: 0 }) kindergarten_unorg: number; // Uyushmagan bog'cha
  @Column({ default: 0 }) students: number; // O'quvchilar
  @Column({ default: 0 }) higher_students: number; // Talabalar
  @Column({ default: 0 }) adults: number; // Kattalar

  // Suv namunalari
  @Column({ default: 0 }) open_water_samples: number; // Ochiq suvdan olingan namunalar soni
  @Column({ default: 0 }) open_water_isolated: number; // Ochiq suvdan ajratilgan namunalar soni
  @Column({ default: 0 }) tap_water_samples: number; // Vodoprovod suvidan olingan namunalar soni
  @Column({ default: 0 }) tap_water_isolated: number; // Vodoprovod suvidan ajratilgan namunalar soni

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    type: "enum",
    enum: ReportStatus,
    default: ReportStatus.DRAFT,
  })
  status: ReportStatus;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "verified_by_id" })
  verifiedBy: User;

  @Column({ nullable: true })
  verifiedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "approved_by_id" })
  approvedBy: User;

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
