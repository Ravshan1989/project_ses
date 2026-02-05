import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { Department } from "../../departments/entities/department.entity";
import { Permission } from "./permission.entity";

@Entity("department_permissions")
export class DepartmentPermission {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => Department, (dept) => dept.permissions, { onDelete: "CASCADE" })
    @JoinColumn({ name: "department_id" })
    department: Department;

    @ManyToOne(() => Permission, (perm) => perm.departmentPermissions, { onDelete: "CASCADE" })
    @JoinColumn({ name: "permission_id" })
    permission: Permission;
}
