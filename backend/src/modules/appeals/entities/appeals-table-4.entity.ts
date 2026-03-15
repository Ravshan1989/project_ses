import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from "typeorm";

@Entity("appeals_table_4")
@Unique(["organization_id", "period_month", "row_key"])
export class AppealsTable4 {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  organization_id: string;

  @Column({ length: 7 })
  period_month: string;

  @Column()
  row_key: string;

  @Column({ type: "int", default: 0 })
  count_prev: number;

  @Column({ type: "int", default: 0 })
  count_curr: number;

  @CreateDateColumn({ type: "timestamp with time zone" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updated_at: Date;
}
