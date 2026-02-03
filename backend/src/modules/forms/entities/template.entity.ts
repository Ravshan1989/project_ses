import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('templates')
export class Template {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    code: string;

    @Column({ nullable: true })
    description: string;

    @Column({ default: 'MONTHLY' })
    frequency: string; // DAILY, MONTHLY

    // JSON Schema Definition for the form
    // Example: 
    // [
    //   { key: 'total_patients', label: 'Jami Bemorlar', type: 'number', required: true },
    //   { key: 'recovered', label: 'Sog\'ayganlar', type: 'number' }
    // ]
    @Column({ type: 'jsonb' })
    schemaDefinition: any;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;
}
