import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";

@Entity("user_permissions")
export class UserPermission {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user: User;

    @Column()
    permissionCode: string; // UZ: Ruxsat kodi (masalan: VIEW_HEPATITIS)

    @Column({ default: false })
    canView: boolean;

    @Column({ default: false })
    canEdit: boolean;

    @Column({ default: false })
    canDownload: boolean; // UZ: Excelga yuklab olish huquqi
}
