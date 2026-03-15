import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from "typeorm";

/**
 * Tадбиркорлик субъектларда ўтказилган текширишлар
 * (Nazoratlarni muvofiqlashtirish - Jadval 2)
 */
@Entity("inspection_table2")
@Unique(["organization_id", "period_month", "row_key"])
export class InspectionTable2 {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  organization_id: string;

  @Column({ length: 7 })
  period_month: string;

  /** Hudud kaliti (tuman/shahar yoki "total") */
  @Column()
  row_key: string;

  // ========== Ўтган yil ==========
  /** Йил бошидан жами ўтказилган текширишлар */
  @Column({ type: "int", default: 0 })
  prev_total: number;

  /** шундан: хабардор этиш тартибида */
  @Column({ type: "int", default: 0 })
  prev_notified: number;

  /** шундан: келишилган тартибида */
  @Column({ type: "int", default: 0 })
  prev_agreed: number;

  // ========== Жорий yил ==========
  /** Йил бошидан жами ўтказилган текширишлар */
  @Column({ type: "int", default: 0 })
  curr_total: number;

  /** шундан: хабардор этиш тартибида */
  @Column({ type: "int", default: 0 })
  curr_notified: number;

  /** шундан: 24 соатдан сўнг хабардор этиш */
  @Column({ type: "int", default: 0 })
  curr_notified_24h: number;

  @CreateDateColumn({ type: "timestamp with time zone" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updated_at: Date;
}
