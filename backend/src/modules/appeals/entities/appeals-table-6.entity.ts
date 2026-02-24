import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Unique,
} from "typeorm";

@Entity("appeals_table_6")
@Unique(["organization_id", "period_month", "row_key"])
export class AppealsTable6 {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "uuid" })
    organization_id: string;

    @Column({ length: 7 })
    period_month: string;

    @Column()
    row_key: string; // 'total' or channel type if needed

    // People's Reception (Xalq qabulxonasi)
    @Column({ type: "int", default: 0 })
    people_total: number;

    @Column({ type: "int", default: 0 })
    people_satisfied: number;

    @Column({ type: "int", default: 0 })
    people_explained: number;

    @Column({ type: "int", default: 0 })
    people_routed: number;

    @Column({ type: "int", default: 0 })
    people_rejected: number;

    @Column({ type: "int", default: 0 })
    people_not_considered: number;

    @Column({ type: "int", default: 0 })
    people_being_considered: number;

    @Column({ type: "int", default: 0 })
    people_overdue: number;

    // Virtual Reception (Virtual qabulxona)
    @Column({ type: "int", default: 0 })
    virtual_total: number;

    @Column({ type: "int", default: 0 })
    virtual_satisfied: number;

    @Column({ type: "int", default: 0 })
    virtual_explained: number;

    @Column({ type: "int", default: 0 })
    virtual_routed: number;

    @Column({ type: "int", default: 0 })
    virtual_rejected: number;

    @Column({ type: "int", default: 0 })
    virtual_not_considered: number;

    @Column({ type: "int", default: 0 })
    virtual_being_considered: number;

    @Column({ type: "int", default: 0 })
    virtual_overdue: number;

    @CreateDateColumn({ type: "timestamp with time zone" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp with time zone" })
    updated_at: Date;
}
