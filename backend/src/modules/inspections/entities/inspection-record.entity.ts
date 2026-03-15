import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

/**
 * Prokurattura organlariga yuborilgan tekshirish hujjatlari
 * (Nazoratlarni muvofiqlashtirish - Jadval 1)
 */
@Entity("inspection_records")
export class InspectionRecord {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  organization_id: string;

  @Column({ length: 7 })
  period_month: string;

  /** Hudud va prokuratura organiga iши o'tkazilgan ob'ekt (shaxslarning nomlari) */
  @Column({ type: "text" })
  object_name: string;

  /** Prokuratura organiga o'tkazilgan sana */
  @Column({ type: "date", nullable: true })
  transfer_date: string;

  /** Prokuratura organiga o'tkazilishiga sabab bo'lgan holat mazmuni */
  @Column({ type: "text", nullable: true })
  reason: string;

  /** Prokuratura organlari tomonidan qo'llanilgan ta'sir choralari */
  @Column({ type: "text", nullable: true })
  measures_taken: string;

  @Column({ type: "int", default: 0 })
  sort_order: number;

  @CreateDateColumn({ type: "timestamp with time zone" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updated_at: Date;
}
