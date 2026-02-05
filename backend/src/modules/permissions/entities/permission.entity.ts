import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { DepartmentPermission } from "./department-permission.entity";

@Entity("permissions")
export class Permission {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true })
    code: string; // e.g., VIEW_HEPATITIS

    @Column({ nullable: true })
    description: string;

    @OneToMany(() => DepartmentPermission, (dp) => dp.permission)
    departmentPermissions: DepartmentPermission[];
}
