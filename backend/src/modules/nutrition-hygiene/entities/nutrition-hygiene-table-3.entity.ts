import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("nutrition_hygiene_table_3")
export class NutritionHygieneTable3 {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  organization_id: string;

  @Column()
  period_month: string;

  @Column()
  row_key: string;

  // Product categories (TN - Ton?)
  @Column({ type: "decimal", precision: 12, scale: 3, default: 0 })
  meat_products: number;

  @Column({ type: "decimal", precision: 12, scale: 3, default: 0 })
  milk_products: number;

  @Column({ type: "decimal", precision: 12, scale: 3, default: 0 })
  fish_products: number;

  @Column({ type: "decimal", precision: 12, scale: 3, default: 0 })
  bread_products: number;

  @Column({ type: "decimal", precision: 12, scale: 3, default: 0 })
  sugar_products: number;

  @Column({ type: "decimal", precision: 12, scale: 3, default: 0 })
  fruit_veg: number;

  @Column({ type: "decimal", precision: 12, scale: 3, default: 0 })
  fat_oil: number;

  @Column({ type: "decimal", precision: 12, scale: 3, default: 0 })
  alcohol_soft: number;

  @Column({ type: "decimal", precision: 12, scale: 3, default: 0 })
  baby_food: number;

  @Column({ type: "decimal", precision: 12, scale: 3, default: 0 })
  canned_food: number;

  @Column({ type: "decimal", precision: 12, scale: 3, default: 0 })
  salt: number;

  @Column({ type: "decimal", precision: 12, scale: 3, default: 0 })
  other: number;

  @Column({ type: "decimal", precision: 12, scale: 3, default: 0 })
  total_amount: number;

  @Column({ type: "int", default: 0 })
  total_samples: number;

  // In trade network
  @Column({ type: "int", default: 0 })
  trade_lab_samples: number;

  @Column({ type: "decimal", precision: 12, scale: 3, default: 0 })
  trade_lab_amount: number;

  @Column({ type: "decimal", precision: 12, scale: 3, default: 0 })
  trade_expired_amount: number;

  // In trade network Foreign
  @Column({ type: "int", default: 0 })
  trade_foreign_lab_samples: number;

  @Column({ type: "decimal", precision: 12, scale: 3, default: 0 })
  trade_foreign_lab_amount: number;

  @Column({ type: "decimal", precision: 12, scale: 3, default: 0 })
  trade_foreign_expired_amount: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
