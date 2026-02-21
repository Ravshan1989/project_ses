import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index
} from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { ReportStatus } from '../../../common/enums/report-status.enum';

/**
 * Kommunal gigiyena: Suvdan foydalanish ob'ektlari holati bo'yicha laboratoriya nazorati (Table 3)
 */
@Entity('kg_water_usage_reports')
export class KgWaterUsageReport {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column({ type: 'date' })
    reportMonth: string;

    @Index()
    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'organization_id' })
    organization: Organization;

    @Column()
    water_body_name: string; // Ochiq suv havzasi nomi

    @Column({ nullable: true })
    category: string;        // Toifasi

    @Column({ default: 0 })
    samples_taken: number;   // Olingan suv namunasi

    @Column({ default: 0 })
    samples_bad: number;     // Shundan sanitariya normalariga javob bermaydi

    // ─── Jumladan qo'zg'atuvchilar aniqlanish bo'yicha ──────────────────────
    @Column({ default: 0 })
    pathogen_inf_disease: number; // Infektsion kasalliklar

    @Column({ default: 0 })
    pathogen_cholera: number;     // Vabo qo'zg'atuvchisi

    @Column({ default: 0 })
    pathogen_parasite: number;    // Parazitar kasalliklar

    // ─── San-kimyoviy ko'rsatkichlar ────────────────────────────────────────
    @Column({ default: 0 })
    chem_samples_total: number;   // Jami namuna

    @Column({ default: 0 })
    chem_pesticide_presence: number; // Pesticidlar mavjudligi

    @Column({ default: 0 })
    chem_bad_total: number;       // Shundan sanitariya normalariga javob bermaydi

    @Column({ default: 0 })
    chem_bad_pesticide: number;   // Shu jumladan pesticid bo'yicha

    @Column({
        type: 'enum',
        enum: ReportStatus,
        default: ReportStatus.DRAFT,
    })
    status: ReportStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
