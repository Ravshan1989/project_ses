import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from "typeorm";

@Entity("ch_lab_tests_reports")
@Unique(["organization_id", "period_month", "row_key"])
export class ChLabTestsReport {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  organization_id: string;

  @Column({ length: 7 })
  period_month: string; // Format: 'YYYY-MM'

  @Column()
  row_key: string;

  // 1. Air (Yopiq bino havosi)
  @Column({ name: "air_inspected_count", type: "int", default: 0 })
  airInspectedCount: number;

  @Column({ name: "air_samples_total", type: "int", default: 0 })
  airSamplesTotal: number;

  @Column({ name: "air_samples_12k", type: "int", default: 0 })
  airSamples12k: number;

  @Column({ name: "air_rem_exceeded_total", type: "int", default: 0 })
  airRemExceededTotal: number;

  @Column({ name: "air_rem_exceeded_12k", type: "int", default: 0 })
  airRemExceeded12k: number;

  // 2. Microclimate (Mikroklimat)
  @Column({ name: "micro_inspected_count", type: "int", default: 0 })
  microInspectedCount: number;

  @Column({ name: "micro_samples_total", type: "int", default: 0 })
  microSamplesTotal: number;

  @Column({ name: "micro_samples_non_compliant", type: "int", default: 0 })
  microSamplesNonCompliant: number;

  // 3. Vibration (Tebranish)
  @Column({ name: "vib_inspected_count", type: "int", default: 0 })
  vibInspectedCount: number;

  @Column({ name: "vib_samples_total", type: "int", default: 0 })
  vibSamplesTotal: number;

  @Column({ name: "vib_samples_non_compliant", type: "int", default: 0 })
  vibSamplesNonCompliant: number;

  // 4. EMF (EMM)
  @Column({ name: "emf_inspected_count", type: "int", default: 0 })
  emfInspectedCount: number;

  @Column({ name: "emf_samples_total", type: "int", default: 0 })
  emfSamplesTotal: number;

  @Column({ name: "emf_samples_non_compliant", type: "int", default: 0 })
  emfSamplesNonCompliant: number;

  // 5. Illumination (Yoritilganlik)
  @Column({ name: "light_inspected_count", type: "int", default: 0 })
  lightInspectedCount: number;

  @Column({ name: "light_samples_total", type: "int", default: 0 })
  lightSamplesTotal: number;

  @Column({ name: "light_samples_non_compliant", type: "int", default: 0 })
  lightSamplesNonCompliant: number;

  // 6. Noise (Shovqin)
  @Column({ name: "noise_inspected_count", type: "int", default: 0 })
  noiseInspectedCount: number;

  @Column({ name: "noise_samples_total", type: "int", default: 0 })
  noiseSamplesTotal: number;

  @Column({ name: "noise_samples_non_compliant", type: "int", default: 0 })
  noiseSamplesNonCompliant: number;

  @CreateDateColumn({ type: "timestamp with time zone" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updated_at: Date;
}
