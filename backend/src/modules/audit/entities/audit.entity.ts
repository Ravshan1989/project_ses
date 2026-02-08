import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";

@Entity("audit_logs")
export class AuditLog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ nullable: true })
  action: string; // UZ: Amal turi (masalan: 'CREATE', 'UPDATE', 'DELETE')

  @Column({ nullable: true })
  module: string; // UZ: Modul nomi

  @Column({ type: "jsonb", nullable: true })
  oldData: any; // UZ: Avvalgi ma'lumotlar

  @Column({ type: "jsonb", nullable: true })
  newData: any; // UZ: Yangi ma'lumotlar

  @Column({ nullable: true })
  ipAddress: string; // UZ: IP manzili

  @Column({ nullable: true })
  userAgent: string; // UZ: Brauzer haqida ma'lumot

  @CreateDateColumn()
  createdAt: Date;
}
