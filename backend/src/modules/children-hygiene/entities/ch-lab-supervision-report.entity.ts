import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from "typeorm";

@Entity("ch_lab_supervision_reports")
@Unique(["organization_id", "period_month", "row_key"])
export class ChLabSupervisionReport {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  organization_id: string;

  @Column({ length: 7 })
  period_month: string; // Format: 'YYYY-MM'

  @Column()
  row_key: string;

  // Chemical Laboratory (Kimyoviy laboratoriya)
  @Column({ name: "chem_total", type: "int", default: 0 })
  chemTotal: number;

  @Column({ name: "chem_non_compliant", type: "int", default: 0 })
  chemNonCompliant: number;

  // Bacteriology Laboratory (Bakteriologiya laboratoriya)
  @Column({ name: "bact_total", type: "int", default: 0 })
  bactTotal: number;

  @Column({ name: "bact_non_compliant", type: "int", default: 0 })
  bactNonCompliant: number;

  // Parasitology Laboratory (Parazitologiya laboratoriya)
  @Column({ name: "para_total", type: "int", default: 0 })
  paraTotal: number;

  @Column({ name: "para_non_compliant", type: "int", default: 0 })
  paraNonCompliant: number;

  @CreateDateColumn({ type: "timestamp with time zone" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updated_at: Date;
}
