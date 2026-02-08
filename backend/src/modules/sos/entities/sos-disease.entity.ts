import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

export enum SosDiseaseType {
  CONFIRMED = "CONFIRMED",
  SUSPECTED = "SUSPECTED",
}

@Entity("sos_diseases")
export class SosDisease {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({
    type: "simple-enum",
    enum: SosDiseaseType,
  })
  type: SosDiseaseType;

  @CreateDateColumn()
  createdAt: Date;
}
