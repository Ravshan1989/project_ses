const pptxgen = require("pptxgenjs");

let pres = new pptxgen();

// --- THEME DEFINITION (PREMIUM & TRUST) ---
const COLORS = {
    PRIMARY: "002B5B", // Deep Navy (Professionalism)
    SECONDARY: "2B4865",
    ACCENT: "256D85",  // Teal (Modern/Security)
    HIGHLIGHT: "DFF6FF",
    WHITE: "FFFFFF"
};

// Common Layout Helpers
const addBackgroundDecorator = (slide) => {
    slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: "100%", h: 0.2, fill: { color: COLORS.PRIMARY } });
    slide.addShape(pres.ShapeType.rect, { x: 0, y: "96%", w: "100%", h: 0.15, fill: { color: COLORS.ACCENT } });
};

const titleProps = { x: 0.5, y: 0.6, w: "90%", h: 0.8, align: "left", fontSize: 32, color: COLORS.PRIMARY, bold: true, fontFace: "Georgia" };
const bodyProps = { x: 0.8, y: 1.6, w: "85%", h: 4, fontSize: 22, color: "333333", bullet: { indent: 25 }, fontFace: "Calibri" };

// --- SLIDE 1: PITCH TITLE ---
let slide1 = pres.addSlide();
slide1.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: "100%", h: "100%", fill: { color: COLORS.PRIMARY } });
slide1.addText("SMART SES", { x: 0, y: 2.0, w: "100%", h: 1, align: "center", fontSize: 72, color: COLORS.WHITE, bold: true });
slide1.addText("Tuman va Shahar Boshqaruvi Uchun Raqamli Qalqon", { x: 0, y: 3.4, w: "100%", h: 0.5, align: "center", fontSize: 24, color: COLORS.HIGHLIGHT });
slide1.addShape(pres.ShapeType.line, { x: 3, y: 4.2, w: 4, h: 0, line: { color: COLORS.WHITE, width: 2 } });
slide1.addText("Rahbariyat Uchun Strategik Yechim", { x: 0, y: 4.8, w: "100%", h: 0.5, align: "center", fontSize: 18, color: COLORS.WHITE, italic: true });

// --- SLIDE 2: PAIN POINTS (EYE-OPENER) ---
let slide2 = pres.addSlide();
addBackgroundDecorator(slide2);
slide2.addText("Sizda Haliyam Qog'ozmi? (Boshqaruvdagi Bo'shliqlar)", titleProps);
slide2.addText([
    { text: "Inspektor qayerda? (Nazorat yo'qligi)." },
    { text: "Hisobot qachon tayyor bo'ladi? (Haftalab kutish)." },
    { text: "Ma'lumotlar to'g'rimi? (Inson omili va xatolar)." },
    { text: "Epidemiya chiqsa kim javob beradi? (Kechikkan reaksiya)." }
], bodyProps);

// --- SLIDE 3: SOLUTION (GAME CHANGER) ---
let slide3 = pres.addSlide();
addBackgroundDecorator(slide3);
slide3.addText("SMART SES: Boshqaruvni Qo'lga Oling", titleProps);
slide3.addText([
    { text: "100% Shaffoflik: Real vaqtda barcha jarayonlar monitorida." },
    { text: "Smart Monitoring: Har bir ob'ektning raqamli pasporti." },
    { text: "Markazlashgan Dashboard: Birgina ekran orqali tuman nazorati." },
    { text: "Tezkor Reaksiya: Favqulodda vaziyatlarda 1-soniyalik ogohlantirish." }
], bodyProps);

// --- SLIDE 4: RESOURCE CONTROL (GPS/FOTO) ---
let slide4 = pres.addSlide();
addBackgroundDecorator(slide4);
slide4.addText("Intizom – Bu Muvaffaqiyat Garovi", titleProps);
slide4.addText([
    { text: "Inspektor borishini GPS va Foto-fakt orqali tasdiqlash." },
    { text: "Sinxronizatsiya: Xodim joyida ma'lumot kiritadi, siz kabinetingizda ko'rasiz." },
    { text: "Offline rejim: Internet yo'qligi endi muammo emas." },
    { text: "Ish unumi 3 baravarga oshishi." }
], bodyProps);

// --- SLIDE 5: SPECIALIZED MODULES (PREVENTION) ---
let slide5 = pres.addSlide();
addBackgroundDecorator(slide5);
slide5.addText("Ixtisoslashgan Nazorat: Xavfsiz Hudud", titleProps);
slide5.addText([
    { text: "Bolalar gigiyenasi: Maktab va bog'chalarda 24/7 nazorat." },
    { text: "Oziq-ovqat xavfsizligi: Taomlanish maskanlari monitoringi." },
    { text: "Epidemiologiya: Kasallik trendlarini bashorat qilish." },
    { text: "Kommunal nazorat: Hudud ekologiyasi va tozaligi." }
], bodyProps);

// --- SLIDE 6: MAGIC BUTTON (EXCEL EXPORT) ---
let slide6 = pres.addSlide();
addBackgroundDecorator(slide6);
slide6.addText("Hisobotlar – 5 Soniyada Tayyor!", titleProps);
slide6.addText([
    { text: "Davlat standarti bo'yicha tayyor Excel jadvallar." },
    { text: "Haftalik, oylik va yillik tahlillar bir tugma orqali." },
    { text: "Vazir yoki Yuqori tashkilot kelsa – hisobot stolingizda tayyor." },
    { text: "80% ish vaqtini qog'ozdan — haqiqiy natijaga yo'naltirish." }
], bodyProps);

// --- SLIDE 7: ROI & SECURITY (WHY INVEST?) ---
let slide7 = pres.addSlide();
addBackgroundDecorator(slide7);
slide7.addText("Nega SMART SES ga Sarmoya Kiritish Kerak?", titleProps);
slide7.addText([
    { text: "Xatolar kamayadi – Jarima va tekshiruvlar xavfi minimallashadi." },
    { text: "Budjet tejaladi – Resurslar samarali taqsimlanadi." },
    { text: "Nufuz (Prestige) – Hududingiz eng raqamlashgan va xavfsiz maskanga aylanadi." },
    { text: "To'liq xavfsizlik: Barcha ma'lumotlar himoyalangan va zaxiralangan." }
], bodyProps);

// --- SLIDE 8: FINAL CALL ---
let slide8 = pres.addSlide();
slide8.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: "100%", h: "100%", fill: { color: COLORS.PRIMARY } });
slide8.addText("SMART SES — Zamonaviy Boshqaruv Kelajagidir", { x: 0, y: 2.0, w: "100%", h: 1, align: "center", fontSize: 44, color: COLORS.WHITE, bold: true });
slide8.addText("Savollar va Hamkorlik Uchun Rahmat!", { x: 0, y: 3.5, w: "100%", h: 0.5, align: "center", fontSize: 24, color: COLORS.HIGHLIGHT });
slide8.addText("Tizimni amalda ko'rsatish (Live Demo) ->", { x: 0, y: 5.5, w: "100%", h: 0.5, align: "center", fontSize: 16, color: COLORS.WHITE, italic: true });

// Save the Presentation
pres.writeFile({ fileName: "SMART_SES_PITCH.pptx" })
    .then(fileName => {
        console.log(`Success: ${fileName} created!`);
    })
    .catch(err => {
        console.error("Error creating pitch presentation:", err);
    });
