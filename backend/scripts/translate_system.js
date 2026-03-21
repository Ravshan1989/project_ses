const { Client } = require('pg');

const DISEASES_MAPPING = {
    "Ичтерлама": "Ichterlama",
    "Паратифлар  А, Б, С (Барчаси)": "Paratiflar A, B, C (Barchasi)",
    "шу жумладан: паратиф А": "shu jumladan: paratif A",
    "паратиф Б": "paratif B",
    "Ичтерлама ва паратиф бактерияларини ра ташувчилари": "Ichterlama va paratif bakteriyalarini tashuvchilari",
    "Бошқа сальмонеллез инфекциялари": "Boshqa salmonellez infeksiyalari",
    "шу жумладан бактериологик тасдиқланганлар": "shu jumladan bakteriologik tasdiqlanganlar",
    "Бактериал ичбуруғ (шигиллез)": "Bakterial ichburug' (shigellez)",
    "Флекснер, Нюкасл шигелласи келтириб чиқарган": "Fleksner, Nyukasl shigellasi keltirib chiqargan",
    "Зонне шигелласи келтириб чиқарган": "Zonne shigellasi keltirib chiqargan",
    "Григорьев-Шига шигелласи келтириб чиқарган": "Grigoryev-Shiga shigellasi keltirib chiqargan",
    "Ичбуруғ бактерия ташувчилари": "Ichburug' bakteriya tashuvchilari",
    "Иерсения энтероколити келтириб чиқарган энтеритлар": "Ierseniya enterokoliti keltirib chiqargan enteritlar",
    "Аниқланган қўзғатувчилар сабаб бўлган энтерит, колит, гастроэнтеритлар, овқат токсикоинфекциялари": "Aniqlangan qo'zg'atuvchilar sabab bo'lgan enterit, kolit, gastroenteritlar, ovqat toksikoinfeksiyalari",
    "шу жумладан ротавирус инфекциялар": "shu jumladan rotavirus infeksiyalar",
    "Қўзғатувчилари аниқланмаган ва аниқ белгиланмаган ўткир ичак инфекциялари ва овқат токсикоинфекциялари": "Qo'zg'atuvchilari aniqlanmagan va aniq belgilanmagan o'tkir ichak infeksiyalari va ovqat toksikoinfeksiyalari",
    "Туляремия": "Tulyaremiya",
    "Куйдирги": "Kuydirgi",
    "Биринчи марта ташҳиси аниқланган бруцеллез": "Birinchi marta tashhisi aniqlangan brutsellez",
    "Бўғма": "Bo'g'ma",
    "Бўғма қўзғатувчи токсиген штаммларининг бактерия ташувчилари": "Bo'g'ma qo'zg'atuvchi toksigen shtammlarining bakteriya tashuvchilari",
    "Кўкйўтал": "Ko'kyutal",
    "Менингококкли инфекция": "Meningokokkli infeksiya",
    "шу жумлаdan тарқоқ тури": "shu jumladan tarqoq turi",
    "Қоқшол": "Qoqshol",
    "Ўткир полиомиелит": "O'tkir poliomielit",
    "Сувчечак": "Suvchechak",
    "Қизамиқ": "Qizamiq",
    "Баҳор-ёзги кана энцефалити": "Bahor-yozgi kana entsefality",
    "Скарлатина": "Skarlatina",
    "Геморрагик иситма": "Gemorragik isitma",
    "Қизилча": "Qizilcha",
    "Туғма қизилча": "Tug'ma qizilcha",
    "Ўткир вирусли гепатит  (жами)": "O'tkir virusli gepatit (jami)",
    "шу жумладан гепатит А": "shu jumladan gepatit A",
    "гепатит В": "gepatit B",
    "гепатит С": "gepatit C",
    "гепатит Е": "gepatit E",
    "гепатит Д": "gepatit D",
    "Гепатит вирусини ташувчилар – биринчи марта аниқланганлар – жами": "Gepatit virusini tashuvchilar – birinchi marta aniqlanganlar – jami",
    "улардан Гепатит В (HBAg)": "ulardan Gepatit B (HBAg)",
    "Гепатит С": "Gepatit C",
    "Сурункали гепатитлар (биринчи марта аниқланганлар)": "Surunkali gepatitlar (birinchi marta aniqlanganlar)",
    "Қутуриш": "Quturish",
    "Орнитоз": "Ornitoz",
    "Инфекцион мононуклеоз": "Infeksion mononukleoz",
    "Эпидемик паротит": "Epidemik parotit",
    "Риккетсиозлар": "Rikketsiozlar",
    "шу жумладан, эпидемия тошмали терлама": "shu jumladan, epidemiya toshmali terlama",
    "Брилл касаллиги": "Brill kasalligi",
    "Канали тошма терлама": "Kanali toshma terlama",
    "Ку иситмаси Лихорадка Ку": "Qu isitmasi (Лихорадка Ку)",
    "Биринчи марта ташҳиси аниқланган безгак": "Birinchi marta tashhisi aniqlangan bezgak",
    "Безгак паразитларини ташувчилар": "Bezgak parazitlarini tashuvchilar",
    "Лептоспироз": "Leptospiroz",
    "Юқори ва қуйи нафас олиш йўлларининг ўткир инфекциялари (ЎРИ)": "Yuqori va quyi nafas olish yo'llarining o'tkir infeksiyalari (O'RI)",
    "Легионеллез": "Legionellez",
    "Гриппга ўхшаш  касалликлар": "Grippga o'xshash kasalliklar",
    "Ўткир ўпка яллиғланиши (Зотилжам)": "O'tkir o'pka yallig'lanishi (Zotiljam)",
    "Оғир ўткир респиратор инфекциялар (ОЎРИ)": "Og'ir o'tkir respirator infeksiyalar (O'RI)",
    "Сил (биринчи марта аниқланган, барча формаси)": "Sil (birinchi marta aniqlangan, barcha formasi)",
    "шу жумладан бактерия ажратиш билан (БК+)": "shu jumladan bakteriya ajratish bilan (BK+)",
    "162 сатрдан нафас олиш аъзолари сили": "162-satrdan nafas olish a'zolari sili",
    "Заҳм  (биринчи марта аниқланган, барча формаси)": "Zahm (birinchi marta aniqlangan, barcha formasi)",
    "Ўткир ва сурункали сўзак": "O'tkir va surunkali suzak",
    "Қўтир": "Qotir",
    "Педикулез": "Pedikulez",
    "Канали қайталама терлама": "Kanali qaytalama terlama",
    "Аскаридоз": "Askaridoz",
    "Трихоцефаллез (трихуроз)": "Trikhotsefalloz (trikhuroz)",
    "Энтеробиоз": "Enterobioz",
    "Геминолипедоз": "Geminolipedoz",
    "Тремадозы": "Tremadozlar",
    "Эхинококкоз": "Exinokokkoz",
    "Тениаринхоз (тениоз)": "Teniarinxoz (tenioz)",
    "Трихофития": "Trixofitiya",
    "Микроспория": "Mikrosporiya",
    "Лейшманиоз": "Leyshmanioz",
    "шу жумладан тери лейшманиози": "shu jumladan teri leyshmaniozi",
    "Аниқланган коронавиrus инфекцияси": "Aniqlangan koronavirus infeksiyasi",
    "Амёбиаз": "Amiobioz",
    "Балантидиаз": "Balantidiaz",
    "Жиардиаз (лямблиоз)": "Jiardiaz (lyamblioz)",
    "Криптоспоридиоз": "Kriptosporidioz",
    "Изоспороз": "Izosporoz",
    "Касалхона ички инфекциялари – жами": "Kasalxona ichki infeksiyalari – jami",
    "Чақалоқлардаги йирингли септик инфекциялар: омфалит, мастит, конъюктивит, сепсис, пиодермия, импетиго, пўрсилдоқ яра, остеомиелит": "Chaqaloqlardagi yiringli septik infeksiyalar: omfalit, mastit, konyuktivit, sepsis, piodermiya, impetigo, po'rsildoq yara, osteomielit",
    "Туққан аёллардаги йирингли септик касалликлар: сепсис, мастит, акушерлик ярасининг жарроҳлик амалиётидан кейинги инфекцияси, туғруқдан кейинги ёйилган инфекция ва бошқалар": "Tuqqan ayollardagi yiringli septik kasalliklar: sepsis, mastit, akusherlik yarasining jarrohlik amaliyotidan keyingi infeksiyasi, tug'ruqdan keyingi yoyilgan infeksiya va boshqalar",
    "Операциядан кейинги инфекциялар: сепсис, абцесс, флегмона, инъекциядан кейинги сепсис, инфузиялар, перфузиялар, трансфузиялар оқибатида юз берадиган сепсис": "Operatsiyadan keyingi infeksiyalar: sepsis, abstsess, flegmona, inyeksiyadan keyingi sepsis, infuziyalar, perfuziyalar, transfuziyalar oqibatida yuz beradigan sepsis",
    "Юқори нафас олиш йўлларининг ўткир инфекциялари": "Yuqori nafas olish yo'llarining o'tkir infeksiyalari",
    "Сийдик чиқариш йўллари инфекциялари": "Siydik chiqarish yo'llari infeksiyalari",
    "Аниқланган ва аниқланмаган қўзғатувчилар сабаб бўлган ўткир ичак инфекциялари: энтеритлар, колитлар, гоастроэнтеритлар, энтероколитлар": "Aniqlangan va aniqlanmagan qo'zg'atuvchilar sabab bo'lgan o'tkir ichak infeksiyalari: enteritlar, kolitlar, gastroenteritlar, enterokolitlar",
    "106 -сатрдан бошқа сальмонеллез инфекциялари": "106-satrdan boshqa salmonellez infeksiyalari",
    "137 – сатрдан вирусли гепатит В": "137-satrdan virusli gepatit B",
    "Аниқланган коронавирус инфекцияси": "Aniqlangan koronavirus infeksiyasi"
};

async function run() {
    const client = new Client({
        user: 'postgres',
        host: 'shinkansen.proxy.rlwy.net',
        database: 'railway',
        password: 'yKosJEzShgHdtHUZteXfnWbaSdFglplu',
        port: 29403,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        // 1. Update Diseases
        for (const [cyr, lat] of Object.entries(DISEASES_MAPPING)) {
            await client.query('UPDATE diseases SET name = $1 WHERE name = $2', [lat, cyr]);
            // Also try with sanitized versions if needed (carriage returns, etc)
            const cyrSanitized = cyr.replace(/\r\n/g, '\r\n').replace(/\n/g, '\n');
            await client.query('UPDATE diseases SET name = $1 WHERE name = $2', [lat, cyrSanitized]);
        }
        console.log('Diseases updated.');

        // 2. Update Templates
        await client.query("UPDATE templates SET name = 'Shakl 1' WHERE name = 'Shakl 1'");
        await client.query("UPDATE templates SET name = 'Emlash' WHERE name = 'Emlash'");
        console.log('Templates updated.');

    } catch (err) {
        console.error('DB Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
