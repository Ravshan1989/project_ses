import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from "typeorm";

@Entity("ch_fines_reports")
@Unique(["organization_id", "period_month", "row_key"])
export class ChFinesReport {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  organization_id: string;

  @Column({ length: 7 })
  period_month: string; // Format: 'YYYY-MM'

  @Column()
  row_key: string;

  // Jarimalar soni (Number of fines)
  @Column({ name: "fine_count_imposed", type: "int", default: 0 })
  fineCountImposed: number;

  @Column({ name: "fine_count_collected", type: "int", default: 0 })
  fineCountCollected: number;

  // Jarima miqdori (Amount of fines, in currency)
  @Column({
    name: "fine_amount_imposed",
    type: "decimal",
    precision: 15,
    scale: 2,
    default: 0,
  })
  fineAmountImposed: number;

  @Column({
    name: "fine_amount_collected",
    type: "decimal",
    precision: 15,
    scale: 2,
    default: 0,
  })
  fineAmountCollected: number;

  // Iш faoliyati to'хtatildi (Business activity suspended)
  @Column({ name: "activity_suspended", type: "int", default: 0 })
  activitySuspended: number;

  // Qo'shimcha jazolar
  @Column({ name: "employees_suspended", type: "int", default: 0 })
  employeesSuspended: number;

  // Tergov organlariga berilgan (Referred to investigation organs)
  @Column({ name: "referred_to_investigation", type: "int", default: 0 })
  referredToInvestigation: number;

  // Brakera / Boshqa (Other enforcement)
  @Column({ name: "brakera", type: "int", default: 0 })
  brakera: number;

  @CreateDateColumn({ type: "timestamp with time zone" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updated_at: Date;
}
