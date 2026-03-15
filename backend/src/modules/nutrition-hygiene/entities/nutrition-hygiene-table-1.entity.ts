import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("nutrition_hygiene_table_1")
export class NutritionHygieneTable1 {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  organization_id: string;

  @Column()
  period_month: string; // YYYY-MM

  @Column()
  row_key: string;

  // Coordination & Notification
  @Column({ type: "int", default: 0 })
  production_notif: number;

  @Column({ type: "int", default: 0 })
  catering_notif: number;

  @Column({ type: "int", default: 0 })
  trade_notif: number;

  @Column({ type: "int", default: 0 })
  order_permission: number;

  @Column({ type: "int", default: 0 })
  total_permission: number;

  @Column({ type: "int", default: 0 })
  sent_to_court: number;

  @Column({ type: "int", default: 0 })
  sent_to_prosecutor: number;

  // Fines applied by Court
  @Column({ type: "int", default: 0 })
  court_fine_count: number;

  @Column({ type: "decimal", precision: 15, scale: 2, default: 0 })
  court_fine_sum: number;

  // Recovered fines
  @Column({ type: "int", default: 0 })
  recovered_fine_count: number;

  @Column({ type: "decimal", precision: 15, scale: 2, default: 0 })
  recovered_fine_sum: number;

  // Sanitary department fines
  @Column({ type: "int", default: 0 })
  sanitary_fine_count: number;

  @Column({ type: "decimal", precision: 15, scale: 2, default: 0 })
  sanitary_fine_sum: number;

  // Recovered sanitary fines
  @Column({ type: "int", default: 0 })
  sanitary_recovered_count: number;

  @Column({ type: "decimal", precision: 15, scale: 2, default: 0 })
  sanitary_recovered_sum: number;

  @Column({ type: "int", default: 0 })
  suspension_count: number;

  @Column({ type: "int", default: 0 })
  dismissal_proposals: number;

  @Column({ type: "int", default: 0 })
  dismissed_employees: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
