import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from "typeorm";

@Entity("ch_school_sanitary_reports")
@Unique(["organization_id", "period_month", "row_key"])
export class ChSchoolSanitaryReport {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  organization_id: string; // District SES generating the report

  @Column({ length: 7 })
  period_month: string; // Format: 'YYYY-MM'

  @Column()
  row_key: string; // Fixed keys e.g., 'total', '1.1', '1.1.1' matching Table 1 rows

  @Column({ name: "institutions_count", type: "int", default: 0 })
  institutionsCount: number; // Муассасалар сони

  @Column({ name: "supervision_plan", type: "int", default: 0 })
  supervisionPlan: number; // Назорат ўтказиш режаси

  @Column({ name: "total_supervisions_conducted", type: "int", default: 0 })
  totalSupervisionsConducted: number; // Жами ўтказилган назоратлар

  @Column({ name: "planned_supervisions_conducted", type: "int", default: 0 })
  plannedSupervisionsConducted: number; // Ўтказилган режали назоратлар сони

  @Column({ name: "unplanned_supervisions_conducted", type: "int", default: 0 })
  unplannedSupervisionsConducted: number; // Режасиз ўтказилган назорат сони

  // Computed field (can be calculated on the fly on the frontend or backend, but often useful to store or easily derive: Total / Plan)
  // Назорат режасининг бажарилиши %

  @Column({ name: "lab_supervisions_count", type: "int", default: 0 })
  labSupervisionsCount: number; // Лаборатория ёрдамида назорат сони

  // Computed field (Lab / Total)
  // Лаборатория ёрдамида ўтказилган текширишлар фоизи

  @CreateDateColumn({ type: "timestamp with time zone" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updated_at: Date;
}
