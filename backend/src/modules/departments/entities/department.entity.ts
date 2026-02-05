import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { DepartmentPermission } from "../../permissions/entities/department-permission.entity";

@Entity("departments")
export class Department {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true })
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: "int", default: 3 }) // 1: Respublika, 2: Viloyat, 3: Tuman
    level: number;

    @OneToMany(() => User, (user) => user.department)
    users: User[];

    @OneToMany(() => DepartmentPermission, (dp) => dp.department)
    permissions: DepartmentPermission[];
}
