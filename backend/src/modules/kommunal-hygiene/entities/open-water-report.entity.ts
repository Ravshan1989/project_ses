import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";
import { Organization } from "../../organizations/entities/organization.entity";
import { ReportStatus } from "../../../common/enums/report-status.enum";

/**
 * Kommunal gigiyena: Ochiq suv muhofazasi nazorati (Table 2)
 */
@Entity("kg_open_water_reports")
export class KgOpenWaterReport {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index()
  @Column({ type: "date" })
  reportMonth: string;

  @Index()
  @ManyToOne(() => Organization)
  @JoinColumn({ name: "organization_id" })
  organization: Organization;

  @Column()
  water_body_name: string; // Suv havzasi nomi

  @Column()
  object_name: string; // Tashlovchi ob'ekt nomi

  @Column({ nullable: true })
  treatment_system: string; // Tozalash sistemasi

  @Column({ nullable: true })
  disinfection: string; // Zararsizlantirish

  // ─── KIMYOVIY KO'RSATKICHLARI ──────────────────────────────────────────
  @Column({ default: 0 }) chem_before_total: number;
  @Column({ default: 0 }) chem_before_bad: number;

  @Column({ default: 0 }) chem_after_total: number;
  @Column({ default: 0 }) chem_after_bad: number;

  @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
  chem_efficiency: number;

  // ─── BAKTERIOLOGIK KO'RSATKICHLARI ─────────────────────────────────────
  @Column({ default: 0 }) bact_before_total: number;
  @Column({ default: 0 }) bact_before_bad: number;

  @Column({ default: 0 }) bact_after_total: number;
  @Column({ default: 0 }) bact_after_bad: number;

  @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
  bact_efficiency: number;

  @Column({
    type: "enum",
    enum: ReportStatus,
    default: ReportStatus.DRAFT,
  })
  status: ReportStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
