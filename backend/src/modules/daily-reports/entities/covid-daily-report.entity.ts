import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';

@Entity('covid_daily_reports')
@Unique(['reportDate', 'organization'])
export class CovidDailyReport {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'date' })
    reportDate: string;

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'organization_id' })
    organization: Organization;

    @Column({ default: 0 }) total_cases: number; // Жami kasallanganlar
    @Column({ default: 0 }) reinfected: number; // Shundan qayta kasallanganlar
    @Column({ default: 0 }) vaccinated_infected: number; // Emlangandan so'ng kasallanganlar

    // Yosh guruhlari (Age groups)
    @Column({ default: 0 }) age_0_1: number;
    @Column({ default: 0 }) age_1_3: number;
    @Column({ default: 0 }) age_4_6: number;
    @Column({ default: 0 }) age_7_14: number;
    @Column({ default: 0 }) age_15_19: number;
    @Column({ default: 0 }) age_20_29: number;
    @Column({ default: 0 }) age_30_39: number;
    @Column({ default: 0 }) age_40_49: number;
    @Column({ default: 0 }) age_50_59: number;
    @Column({ default: 0 }) age_60_plus: number;

    // Maktabgacha (Pre-school)
    @Column({ default: 0 }) pre_school_organized: number; // Uyushmagan (asli bog'cha yoshidagi)
    @Column({ default: 0 }) pre_school_unorganized: number; // Uyushgan (bog'chaga boruvchi)

    // Kategoriyalar (Categories)
    @Column({ default: 0 }) students: number; // O'quvchilar
    @Column({ default: 0 }) medical_workers: number; // Tibbiyot xodimlari
    @Column({ default: 0 }) teachers: number; // O'qituvchilar
    @Column({ default: 0 }) others: number; // Boshqalar

    @Column({ default: 0 }) hospitalized_count: number; // Shifoxonaga yotkizilgan bemorlar soni

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
