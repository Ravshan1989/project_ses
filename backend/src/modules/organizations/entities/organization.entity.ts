import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Submission } from "../../submissions/entities/submission.entity";
import { FluDailyReport } from "../../daily-reports/entities/flu-daily-report.entity";
import { AriDailyReport } from "../../daily-reports/entities/ari-daily-report.entity";
import { HepatitisDailyReport } from "../../daily-reports/entities/hepatitis-daily-report.entity";
import { EpidemiologyDailyReport } from "../../daily-reports/entities/epidemiology-daily-report.entity";
import { CovidDailyReport } from "../../daily-reports/entities/covid-daily-report.entity";

@Entity("organizations")
export class Organization {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ type: "int", default: 0 })
  population: number;

  // HIERARCHY: Region -> District
  // If parent is null, it is top level (i.e., Viloyat)
  @ManyToOne(() => Organization, (org) => org.children, { nullable: true })
  @JoinColumn({ name: "parent_id" })
  parent: Organization;

  @OneToMany(() => Organization, (org) => org.parent)
  children: Organization[];

  @OneToMany(() => User, (user) => user.organization)
  users: User[];

  @OneToMany(() => Submission, (sub) => sub.organization)
  submissions: Submission[];

  @OneToMany(() => FluDailyReport, (report) => report.organization)
  flu_reports: FluDailyReport[];

  @OneToMany(() => AriDailyReport, (report) => report.organization)
  ari_reports: AriDailyReport[];

  @OneToMany(() => HepatitisDailyReport, (report) => report.organization)
  hepatitis_reports: HepatitisDailyReport[];

  @OneToMany(() => EpidemiologyDailyReport, (report) => report.organization)
  epi_reports: EpidemiologyDailyReport[];

  @OneToMany(() => CovidDailyReport, (report) => report.organization)
  covid_reports: CovidDailyReport[];
}
