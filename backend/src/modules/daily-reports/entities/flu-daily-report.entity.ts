import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';

@Entity('flu_daily_reports')
@Unique(['reportDate', 'organization'])
export class FluDailyReport {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'date' })
    reportDate: string;

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'organization_id' })
    organization: Organization;

    @Column({ default: 0 })
    institution_count: number; // Muassasa soni

    // O'tkir respirator infeksiyalar (O'RI / ARI)
    @Column({ default: 0 }) ari_total: number;
    @Column({ default: 0 }) ari_0_1: number;
    @Column({ default: 0 }) ari_1_2: number;
    @Column({ default: 0 }) ari_3_6: number;
    @Column({ default: 0 }) ari_7_14: number;
    @Column({ default: 0 }) ari_adult: number;
    @Column({ default: 0 }) ari_students: number;
    @Column({ default: 0 }) ari_nursery: number;

    // O'tkir zotiljam (O'P / Pneumonia)
    @Column({ default: 0 }) pneu_total: number;
    @Column({ default: 0 }) pneu_0_2: number;
    @Column({ default: 0 }) pneu_3_6: number;
    @Column({ default: 0 }) pneu_7_14: number;
    @Column({ default: 0 }) pneu_adult: number;
    @Column({ default: 0 }) pneu_students: number;
    @Column({ default: 0 }) pneu_nursery: number;

    // Grippga o'xshash kasalliklar (GK / Flu)
    @Column({ default: 0 }) flu_total: number;
    @Column({ default: 0 }) flu_0_1: number;
    @Column({ default: 0 }) flu_1_2: number;
    @Column({ default: 0 }) flu_3_6: number;
    @Column({ default: 0 }) flu_7_14: number;
    @Column({ default: 0 }) flu_adult: number;
    @Column({ default: 0 }) flu_students: number;
    @Column({ default: 0 }) flu_nursery: number;

    // Og'ir o'tkir respirator infeksiyalar (SARI)
    @Column({ default: 0 }) sari_total: number;
    @Column({ default: 0 }) sari_0_2: number;
    @Column({ default: 0 }) sari_3_6: number;
    @Column({ default: 0 }) sari_7_14: number;
    @Column({ default: 0 }) sari_adult: number;

    // Vafot etganlar (Deaths)
    @Column({ default: 0 }) death_total: number;
    @Column({ default: 0 }) death_pregnant: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
