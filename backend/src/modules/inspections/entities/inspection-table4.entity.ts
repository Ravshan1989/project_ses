import {
    Entity, Column, PrimaryGeneratedColumn,
    CreateDateColumn, UpdateDateColumn, Unique,
} from "typeorm";

/**
 * 24 соатдан сўнг хабардор этиш тартибида ўтказилган текширишлар натижасида
 * тадбиркорлик субъектларга нисбаtan қўлланилган таъсир чоралари
 * (Nazoratlarni muvofiqlashtirish - Jadval 4)
 */
@Entity("inspection_table4")
@Unique(["organization_id", "period_month", "row_key"])
export class InspectionTable4 {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "uuid" })
    organization_id: string;

    @Column({ length: 7 })
    period_month: string;

    /** Hudud kaliti */
    @Column()
    row_key: string;

    /** Келишилган тартибда ўтказилган текширишлар (24 соат) */
    @Column({ type: "int", default: 0 })
    inspections_count: number;

    /** Шундан аниқланган камчиликлар */
    @Column({ type: "int", default: 0 })
    defects_count: number;

    // ─── Қўлланилган чоралар ────────────────────────────────────────────
    /** Фаолиятини тўхтатиб қўйиш */
    @Column({ type: "int", default: 0 })
    measure_suspend: number;

    /** Маъмурий жавобгарликка тортиш */
    @Column({ type: "int", default: 0 })
    measure_admin: number;

    /** Лицензияни бекор қилиш */
    @Column({ type: "int", default: 0 })
    measure_license: number;

    /** Тавдинома */
    @Column({ type: "int", default: 0 })
    measure_tavdinaoma: number;

    /** Огоҳлантириш (кўрсатма) */
    @Column({ type: "int", default: 0 })
    measure_warning: number;

    /** Хулоса */
    @Column({ type: "int", default: 0 })
    measure_conclusion: number;

    /** ТМБ олиб қўйиш */
    @Column({ type: "int", default: 0 })
    measure_tmb: number;

    /** Бошқалар (электр/газ/су узиш) */
    @Column({ type: "int", default: 0 })
    others: number;

    // ─── Молиявий жаримаlar ─────────────────────────────────────────────
    /** Жарима сони */
    @Column({ type: "int", default: 0 })
    fine_count: number;

    /** Жарима суммаси (млн.сўм) */
    @Column({ type: "numeric", precision: 12, scale: 2, default: 0 })
    fine_amount: number;

    // ─── Қўзғатилган даъволар ───────────────────────────────────────────
    /** Иқтисодий судга */
    @Column({ type: "int", default: 0 })
    court_economic: number;

    /** Фуқаролик судга */
    @Column({ type: "int", default: 0 })
    court_civil: number;

    /** Маъмурий судга */
    @Column({ type: "int", default: 0 })
    court_admin: number;

    @CreateDateColumn({ type: "timestamp with time zone" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp with time zone" })
    updated_at: Date;
}
