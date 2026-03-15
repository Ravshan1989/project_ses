import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("nutrition_hygiene_table_6")
export class NutritionHygieneTable6 {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  organization_id: string;

  @Column()
  period_month: string;

  @Column()
  row_key: string;

  @Column({ type: "int", default: 0 })
  operating_markets: number;

  @Column({ type: "int", default: 0 })
  no_water: number;

  @Column({ type: "int", default: 0 })
  no_sewage: number;

  @Column({ type: "int", default: 0 })
  no_meat_pavilion: number;

  @Column({ type: "int", default: 0 })
  no_milk_pavilion: number;

  @Column({ type: "int", default: 0 })
  no_vse_lab: number;

  @Column({ type: "int", default: 0 })
  no_toilet: number;

  @Column({ type: "int", default: 0 })
  no_waste_area: number;

  @Column({ type: "int", default: 0 })
  no_disinfection_contract: number;

  @Column({ type: "int", default: 0 })
  inspections_total: number;

  @Column({ type: "int", default: 0 })
  violations_found: number;

  @Column({ type: "int", default: 0 })
  court_cases: number;

  // Measures
  @Column({ type: "int", default: 0 })
  fine_individual_count: number;

  @Column({ type: "decimal", precision: 15, scale: 2, default: 0 })
  fine_individual_sum: number;

  @Column({ type: "int", default: 0 })
  suspension_count: number;

  @Column({ type: "int", default: 0 })
  dismissal_proposals: number;

  @Column({ type: "int", default: 0 })
  dismissed_employees: number;

  @Column({ type: "decimal", precision: 12, scale: 3, default: 0 })
  brake_food_kg: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
