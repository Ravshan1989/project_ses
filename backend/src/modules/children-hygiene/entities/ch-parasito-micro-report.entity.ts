import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from "typeorm";

@Entity("ch_parasito_micro_reports")
@Unique(["organization_id", "period_month", "row_key"])
export class ChParasitoMicroReport {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  organization_id: string;

  @Column({ length: 7 })
  period_month: string; // Format: 'YYYY-MM'

  @Column()
  row_key: string;

  // === Parazitologiya (Parasitological) ===

  // 1. Sabzavot (Vegetables)
  @Column({ name: "para_veg_total", type: "int", default: 0 })
  paraVegTotal: number;
  @Column({ name: "para_veg_non_compliant", type: "int", default: 0 })
  paraVegNonCompliant: number;

  // 2. Suv (Water)
  @Column({ name: "para_water_total", type: "int", default: 0 })
  paraWaterTotal: number;
  @Column({ name: "para_water_non_compliant", type: "int", default: 0 })
  paraWaterNonCompliant: number;

  // 3. Tuproq (Soil)
  @Column({ name: "para_soil_total", type: "int", default: 0 })
  paraSoilTotal: number;
  @Column({ name: "para_soil_non_compliant", type: "int", default: 0 })
  paraSoilNonCompliant: number;

  // === Mikrobiologik (Microbiological) ===

  // 4. Surtma (Smear)
  @Column({ name: "micro_smear_total", type: "int", default: 0 })
  microSmearTotal: number;
  @Column({ name: "micro_smear_non_compliant", type: "int", default: 0 })
  microSmearNonCompliant: number;

  // 5. Tayyor oziq-ovqat mahsulotlari (Ready food products)
  @Column({ name: "micro_food_total", type: "int", default: 0 })
  microFoodTotal: number;
  @Column({ name: "micro_food_non_compliant", type: "int", default: 0 })
  microFoodNonCompliant: number;

  // 6. Suv (Water)
  @Column({ name: "micro_water_total", type: "int", default: 0 })
  microWaterTotal: number;
  @Column({ name: "micro_water_non_compliant", type: "int", default: 0 })
  microWaterNonCompliant: number;

  // 7. Tuproq (Soil)
  @Column({ name: "micro_soil_total", type: "int", default: 0 })
  microSoilTotal: number;
  @Column({ name: "micro_soil_non_compliant", type: "int", default: 0 })
  microSoilNonCompliant: number;

  @CreateDateColumn({ type: "timestamp with time zone" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updated_at: Date;
}
