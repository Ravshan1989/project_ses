import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Unique,
} from "typeorm";

@Entity("appeals_table_7")
@Unique(["organization_id", "period_month", "row_key"])
export class AppealsTable7 {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "uuid" })
    organization_id: string;

    @Column({ length: 7 })
    period_month: string;

    @Column()
    row_key: string;

    @Column({ type: "int", default: 0 })
    fine_prev: number;

    @Column({ type: "int", default: 0 })
    fine_curr: number;

    @Column({ type: "int", default: 0 })
    reprimand_prev: number;

    @Column({ type: "int", default: 0 })
    reprimand_curr: number;

    @Column({ type: "int", default: 0 })
    dismissal_prev: number;

    @Column({ type: "int", default: 0 })
    dismissal_curr: number;

    @Column({ type: "int", default: 0 })
    disciplinary_total_prev: number;

    @Column({ type: "int", default: 0 })
    disciplinary_total_curr: number;

    @Column({ type: "int", default: 0 })
    administrative_prev: number;

    @Column({ type: "int", default: 0 })
    administrative_curr: number;

    @Column({ type: "int", default: 0 })
    criminal_prev: number;

    @Column({ type: "int", default: 0 })
    criminal_curr: number;

    @Column({ type: "int", default: 0 })
    grand_total_prev: number;

    @Column({ type: "int", default: 0 })
    grand_total_curr: number;

    @CreateDateColumn({ type: "timestamp with time zone" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp with time zone" })
    updated_at: Date;
}
