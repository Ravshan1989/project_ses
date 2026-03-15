import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from "typeorm";

@Entity("appeals_table_6")
@Unique(["organization_id", "period_month", "row_key"])
export class AppealsTable6 {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  organization_id: string;

  @Column({ length: 7 })
  period_month: string;

  @Column()
  row_key: string; // 'total' or channel type if needed

  // People's Reception (Xalq qabulxonasi)
  @Column({ type: "int", default: 0 })
  people_total_prev: number;

  @Column({ type: "int", default: 0 })
  people_total_curr: number;

  @Column({ type: "int", default: 0 })
  people_satisfied_prev: number;

  @Column({ type: "int", default: 0 })
  people_satisfied_curr: number;

  @Column({ type: "int", default: 0 })
  people_explained_prev: number;

  @Column({ type: "int", default: 0 })
  people_explained_curr: number;

  @Column({ type: "int", default: 0 })
  people_routed_prev: number;

  @Column({ type: "int", default: 0 })
  people_routed_curr: number;

  @Column({ type: "int", default: 0 })
  people_rejected_prev: number;

  @Column({ type: "int", default: 0 })
  people_rejected_curr: number;

  @Column({ type: "int", default: 0 })
  people_not_considered_prev: number;

  @Column({ type: "int", default: 0 })
  people_not_considered_curr: number;

  @Column({ type: "int", default: 0 })
  people_being_considered_prev: number;

  @Column({ type: "int", default: 0 })
  people_being_considered_curr: number;

  @Column({ type: "int", default: 0 })
  people_overdue_prev: number;

  @Column({ type: "int", default: 0 })
  people_overdue_curr: number;

  // Virtual Reception (Virtual qabulxona)
  @Column({ type: "int", default: 0 })
  virtual_total_prev: number;

  @Column({ type: "int", default: 0 })
  virtual_total_curr: number;

  @Column({ type: "int", default: 0 })
  virtual_satisfied_prev: number;

  @Column({ type: "int", default: 0 })
  virtual_satisfied_curr: number;

  @Column({ type: "int", default: 0 })
  virtual_explained_prev: number;

  @Column({ type: "int", default: 0 })
  virtual_explained_curr: number;

  @Column({ type: "int", default: 0 })
  virtual_routed_prev: number;

  @Column({ type: "int", default: 0 })
  virtual_routed_curr: number;

  @Column({ type: "int", default: 0 })
  virtual_rejected_prev: number;

  @Column({ type: "int", default: 0 })
  virtual_rejected_curr: number;

  @Column({ type: "int", default: 0 })
  virtual_not_considered_prev: number;

  @Column({ type: "int", default: 0 })
  virtual_not_considered_curr: number;

  @Column({ type: "int", default: 0 })
  virtual_being_considered_prev: number;

  @Column({ type: "int", default: 0 })
  virtual_being_considered_curr: number;

  @Column({ type: "int", default: 0 })
  virtual_overdue_prev: number;

  @Column({ type: "int", default: 0 })
  virtual_overdue_curr: number;

  @CreateDateColumn({ type: "timestamp with time zone" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updated_at: Date;
}
