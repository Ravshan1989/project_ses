import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("nutrition_hygiene_table_2")
export class NutritionHygieneTable2 {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    organization_id: string;

    @Column()
    period_month: string;

    @Column()
    row_key: string;

    // Food production objects
    @Column({ type: "int", default: 0 })
    production_total: number;

    @Column({ type: "int", default: 0 })
    production_required: number;

    @Column({ type: "int", default: 0 })
    production_passed: number; // passed checkup

    // Catering objects
    @Column({ type: "int", default: 0 })
    catering_total: number;

    @Column({ type: "int", default: 0 })
    catering_required: number;

    @Column({ type: "int", default: 0 })
    catering_passed: number;

    // Trade objects
    @Column({ type: "int", default: 0 })
    trade_total: number;

    @Column({ type: "int", default: 0 })
    trade_required: number;

    @Column({ type: "int", default: 0 })
    trade_passed: number;

    // Measures
    @Column({ type: "int", default: 0 })
    dismissal_proposals: number;

    @Column({ type: "int", default: 0 })
    dismissed_employees: number;

    @Column({ type: "int", default: 0 })
    health_protocols: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
