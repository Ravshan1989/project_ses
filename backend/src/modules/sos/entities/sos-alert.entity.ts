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

export enum SosStatus {
  CONFIRMED = "CONFIRMED",
  SUSPECTED = "SUSPECTED",
}

export enum SosReviewStatus {
  PENDING = "PENDING",
  REVIEWED = "REVIEWED",
}

@Entity("sos_alerts")
export class SosAlert {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  diseaseName: string;

  @Column({
    type: "simple-enum",
    enum: SosStatus,
  })
  status: SosStatus;

  @Column({ type: "text", nullable: true })
  comment: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: "organization_id" })
  organization: Organization;

  @ManyToOne(() => User)
  @JoinColumn({ name: "sender_id" })
  sender: User;

  @Column({
    type: "simple-enum",
    enum: SosReviewStatus,
    default: SosReviewStatus.PENDING,
  })
  reviewStatus: SosReviewStatus;

  @CreateDateColumn()
  createdAt: Date;
}
