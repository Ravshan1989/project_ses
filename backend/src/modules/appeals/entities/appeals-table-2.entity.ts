import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from "typeorm";

@Entity("appeals_table_2")
@Unique(["organization_id", "period_month", "row_key"])
export class AppealsTable2 {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  organization_id: string;

  @Column({ length: 7 })
  period_month: string;

  @Column()
  row_key: string;

  @Column({ type: "int", default: 0 })
  total_prev: number;

  @Column({ type: "int", default: 0 })
  total_curr: number;

  @Column({ type: "int", default: 0 })
  written_prev: number;

  @Column({ type: "int", default: 0 })
  written_curr: number;

  @Column({ type: "int", default: 0 })
  electronic_prev: number;

  @Column({ type: "int", default: 0 })
  electronic_curr: number;

  @Column({ type: "int", default: 0 })
  oral_prev: number;

  @Column({ type: "int", default: 0 })
  oral_curr: number;

  @Column({ type: "int", default: 0 })
  under_control: number;

  @Column({ type: "int", default: 0 })
  measures_taken: number;

  @Column({ type: "int", default: 0 })
  explained: number;

  @Column({ type: "int", default: 0 })
  rejected: number;

  @Column({ default: 0 })
  being_considered: number;

  @Column({ type: "int", default: 0 })
  repeated: number;

  @Column({ type: "int", default: 0 })
  overdue: number;

  @CreateDateColumn({ type: "timestamp with time zone" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updated_at: Date;
}
