import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from "typeorm";

@Entity("ch_chem_tests_reports")
@Unique(["organization_id", "period_month", "row_key"])
export class ChChemTestsReport {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  organization_id: string;

  @Column({ length: 7 })
  period_month: string; // Format: 'YYYY-MM'

  @Column()
  row_key: string;

  // 1. Daily ration (Kunlik ratsion)
  @Column({ name: "ration_total", type: "int", default: 0 })
  rationTotal: number;
  @Column({ name: "ration_non_compliant", type: "int", default: 0 })
  rationNonCompliant: number;

  // 2. Salt (Osh tuzi)
  @Column({ name: "salt_total", type: "int", default: 0 })
  saltTotal: number;
  @Column({ name: "salt_non_compliant", type: "int", default: 0 })
  saltNonCompliant: number;

  // 3. Nitrates (Sabzavotlar nitrati)
  @Column({ name: "nitrate_total", type: "int", default: 0 })
  nitrateTotal: number;
  @Column({ name: "nitrate_non_compliant", type: "int", default: 0 })
  nitrateNonCompliant: number;

  // 4. Toxic elements (Toksik elementlar)
  @Column({ name: "toxic_total", type: "int", default: 0 })
  toxicTotal: number;
  @Column({ name: "toxic_non_compliant", type: "int", default: 0 })
  toxicNonCompliant: number;

  // 5. Thermal (Termik ishlov)
  @Column({ name: "thermal_total", type: "int", default: 0 })
  thermalTotal: number;
  @Column({ name: "thermal_non_compliant", type: "int", default: 0 })
  thermalNonCompliant: number;

  // 6. Minerals (Undagi minerallar)
  @Column({ name: "mineral_total", type: "int", default: 0 })
  mineralTotal: number;
  @Column({ name: "mineral_non_compliant", type: "int", default: 0 })
  mineralNonCompliant: number;

  // 7. Soil (Tuproq)
  @Column({ name: "soil_total", type: "int", default: 0 })
  soilTotal: number;
  @Column({ name: "soil_non_compliant", type: "int", default: 0 })
  soilNonCompliant: number;

  // 8. Water (Suv)
  @Column({ name: "water_total", type: "int", default: 0 })
  waterTotal: number;
  @Column({ name: "water_non_compliant", type: "int", default: 0 })
  waterNonCompliant: number;

  // 9. Pesticides (Pestitsidlar)
  @Column({ name: "pesticide_total", type: "int", default: 0 })
  pesticideTotal: number;
  @Column({ name: "pesticide_non_compliant", type: "int", default: 0 })
  pesticideNonCompliant: number;

  // 10. Nutrition (Ovqat tuyimliligi)
  @Column({ name: "nutrition_total", type: "int", default: 0 })
  nutritionTotal: number;
  @Column({ name: "nutrition_non_compliant", type: "int", default: 0 })
  nutritionNonCompliant: number;

  @CreateDateColumn({ type: "timestamp with time zone" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updated_at: Date;
}
