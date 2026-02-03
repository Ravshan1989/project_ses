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

@Entity("hepatitis_daily_reports")
@Unique(["reportDate", "organization"])
export class HepatitisDailyReport {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "date" })
  reportDate: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: "organization_id" })
  organization: Organization;

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
}
