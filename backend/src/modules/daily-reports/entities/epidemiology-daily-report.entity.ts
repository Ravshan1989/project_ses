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

@Entity("epidemiology_daily_reports")
@Unique(["reportDate", "organization", "isTest"])
export class EpidemiologyDailyReport {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "date" })
  reportDate: string;

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
}
