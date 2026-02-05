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
import { Department } from "../../departments/entities/department.entity";
import { Role } from "../../roles/entities/role.entity";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

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

  @ManyToOne(() => Department, (dept) => dept.users, { nullable: true })
  @JoinColumn({ name: "department_id" })
  department: Department;

  @ManyToOne(() => Role, (role) => role.users, { nullable: true })
  @JoinColumn({ name: "role_id" })
  dynamicRole: Role; // UZ: Dinamik rol biriktirish (Yangi tizim)

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
