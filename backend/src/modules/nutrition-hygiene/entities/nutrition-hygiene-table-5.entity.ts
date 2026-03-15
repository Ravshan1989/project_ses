import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("nutrition_hygiene_table_5")
export class NutritionHygieneTable5 {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  organization_id: string;

  @Column()
  period_month: string;

  @Column()
  row_key: string;

  // Enterprises
  @Column({ type: "int", default: 0 })
  ent_total: number;

  @Column({ type: "int", default: 0 })
  ent_period: number;

  @Column({ type: "int", default: 0 })
  ent_covered_lab: number;

  // Dispensers
  @Column({ type: "int", default: 0 })
  dispensers_total: number;

  @Column({ type: "int", default: 0 })
  dispensers_period: number;

  @Column({ type: "decimal", precision: 12, scale: 3, default: 0 })
  premix_amount_kg: number;

  // Samples (Lab)
  @Column({ type: "int", default: 0 })
  samples_prod_total: number;

  @Column({ type: "int", default: 0 })
  samples_prod_not_meet: number;

  @Column({ type: "int", default: 0 })
  samples_trade_total: number;

  @Column({ type: "int", default: 0 })
  samples_trade_not_meet: number;

  @Column({ type: "int", default: 0 })
  samples_others_total: number;

  @Column({ type: "int", default: 0 })
  samples_others_not_meet: number;

  // Measures
  @Column({ type: "decimal", precision: 12, scale: 3, default: 0 })
  sales_suspended_amount_tn: number;

  @Column({ type: "int", default: 0 })
  operation_stopped: number;

  @Column({ type: "int", default: 0 })
  protocols_count: number;

  @Column({ type: "int", default: 0 })
  sent_to_prosecutor: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
