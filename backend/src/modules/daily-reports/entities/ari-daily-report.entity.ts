import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from "typeorm";
import { Organization } from "../../organizations/entities/organization.entity";

@Entity("ari_daily_reports")
@Unique(["reportDate", "organization", "isTest"])
export class AriDailyReport {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "date" })
  reportDate: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: "organization_id" })
  organization: Organization;

  @Column({ default: false })
  isTest: boolean;

  @Column({ default: 0 })
  gk: number; // Grippsimon kasalliklar

  @Column({ default: 0 })
  ari: number; // O'tkir respirator infeksiyalar (O'RI)

  @Column({ default: 0 })
  pneumonia: number; // O'tkir Zotiljam (O'P)

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
