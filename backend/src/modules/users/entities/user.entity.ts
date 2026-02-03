import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Organization } from "../../organizations/entities/organization.entity";
import { UserRole } from "../../../common/enums/role.enum";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ select: false }) // Password hash should not be returned by default
  passwordHash: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.STAFF,
  })
  role: UserRole;

  @ManyToOne(() => Organization, (org) => org.users)
  @JoinColumn({ name: "organization_id" })
  organization: Organization;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
