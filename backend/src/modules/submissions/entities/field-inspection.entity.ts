import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Organization } from "../../organizations/entities/organization.entity";
import { User } from "../../users/entities/user.entity";

export enum FieldInspectionType {
  SCHOOL = "SCHOOL",
  KINDERGARTEN = "KINDERGARTEN",
  PROBLEM = "PROBLEM",
}

export enum InspectionResult {
  GOOD = "良好 (Yaxshi)",
  SATISFACTORY = "満足 (Qoniqarli)",
  UNSATISFACTORY = "不満足 (Qoniqarsiz)",
}

@Entity("field_inspections")
export class FieldInspection {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "enum",
    enum: FieldInspectionType,
  })
  type: FieldInspectionType;

  @Column()
  objectName: string;

  @Column({ type: "decimal", precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: "decimal", precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ nullable: true })
  photoUrl: string;

  @Column({
    type: "enum",
    enum: InspectionResult,
    nullable: true,
  })
  result: InspectionResult;

  @Column({ default: false })
  hasAdministrativeMeasures: boolean;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: "organization_id" })
  organization: Organization;

  @ManyToOne(() => User)
  @JoinColumn({ name: "inspector_id" })
  inspector: User;

  @Column({ nullable: true })
  inspectorName: string;

  @Column({ nullable: true })
  districtName: string;

  @CreateDateColumn()
  createdAt: Date;
}
