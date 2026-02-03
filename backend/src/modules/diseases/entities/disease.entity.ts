import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('diseases')
export class Disease {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    code: string;

    @Column()
    name: string;

    @Column('simple-array', { default: 'MONTHLY' })
    reportFrequency: string[]; // Store as comma-separated string or handle as array

    @Column({ default: true })
    isActive: boolean;
}
