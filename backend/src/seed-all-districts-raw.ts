import { Client } from "pg";
import * as dotenv from "dotenv";
import { randomUUID } from "crypto";

dotenv.config();

const regionsData = [
  {
    name: "Andijon viloyati",
    districts: [
      "Andijon sh.",
      "Xonobod sh.",
      "Andijon t.",
      "Asaka t.",
      "Baliqchi t.",
      "Bo'ston t.",
      "Buloqboshi t.",
      "Izboskan t.",
      "Jalaquduq t.",
      "Marxamat t.",
      "Oltinko'l t.",
      "Paxtaobod t.",
      "Qo'rg'ontepa t.",
      "Shahrixon t.",
      "Ulug'nor t.",
      "Xo'jaobod t.",
    ],
  },
  {
    name: "Buxoro viloyati",
    districts: [
      "Buxoro sh.",
      "Kogon sh.",
      "Buxoro t.",
      "G'ijduvon t.",
      "Jondor t.",
      "Kogon t.",
      "Olot t.",
      "Peshku t.",
      "Qorako'l t.",
      "Qorovulbozor t.",
      "Romitan t.",
      "Shofirkon t.",
      "Vobkent t.",
    ],
  },
  {
    name: "Farg'ona viloyati",
    districts: [
      "Farg'ona sh.",
      "Marg'ilon sh.",
      "Qo'qon sh.",
      "Quvasoy sh.",
      "Bog'dod t.",
      "Beshariq t.",
      "Buvayda t.",
      "Dang'ara t.",
      "Farg'ona t.",
      "Furqat t.",
      "Oltiariq t.",
      "Qo'shtepa t.",
      "Quva t.",
      "Rishton t.",
      "So'x t.",
      "Toshloq t.",
      "Uchko'prik t.",
      "O'zbekiston t.",
      "Yozyovon t.",
    ],
  },
  {
    name: "Jizzax viloyati",
    districts: [
      "Jizzax sh.",
      "Arnasoy t.",
      "Baxmal t.",
      "Do'stlik t.",
      "Forish t.",
      "G'allaorol t.",
      "Sharof Rashidov t.",
      "Mirzacho'l t.",
      "Paxtakor t.",
      "Yangiobod t.",
      "Zafarobod t.",
      "Zarbdor t.",
      "Zomin t.",
    ],
  },
  {
    name: "Namangan viloyati",
    districts: [
      "Namangan sh.",
      "Chortoq t.",
      "Chust t.",
      "Kosonsoy t.",
      "Mingbuloq t.",
      "Namangan t.",
      "Norin t.",
      "Pop t.",
      "To'raqo'rg'on t.",
      "Uchqo'rg'on t.",
      "Uychi t.",
      "Yangiqo'rg'on t.",
      "Davlatobod t.",
      "Yangi Namangan t.",
    ],
  },
  {
    name: "Navoiy viloyati",
    districts: [
      "Navoiy sh.",
      "Zarafshon sh.",
      "G'ozg'on sh.",
      "Karmana t.",
      "Konimex t.",
      "Navbahor t.",
      "Nurota t.",
      "Qiziltepa t.",
      "Tomdi t.",
      "Uchquduq t.",
      "Xatirchi t.",
    ],
  },
  {
    name: "Qashqadaryo viloyati",
    districts: [
      "Qarshi sh.",
      "Shahrisabz sh.",
      "Chiroqchi t.",
      "Dehqonobod t.",
      "Kasbi t.",
      "Kitob t.",
      "Koson t.",
      "Mirishkor t.",
      "Muborak t.",
      "Nishon t.",
      "Qarshi t.",
      "Qamashi t.",
      "Shahrisabz t.",
      "G'uzor t.",
      "Yakkabog' t.",
      "Ko'kdala t.",
    ],
  },
  {
    name: "Qoraqalpog'iston Respublikasi",
    districts: [
      "Nukus sh.",
      "Amudaryo t.",
      "Beruniy t.",
      "Chimboy t.",
      "Ellikqala t.",
      "Kegeyli t.",
      "Mo'ynoq t.",
      "Nukus t.",
      "Qanliko'l t.",
      "Qo'ng'irot t.",
      "Qorao'zak t.",
      "Shumanay t.",
      "Taxtako'pir t.",
      "To'rtko'l t.",
      "Xo'jayli t.",
      "Taxiatosh t.",
      "Bo'zatov t.",
    ],
  },
  {
    name: "Samarqand viloyati",
    districts: [
      "Samarqand sh.",
      "Kattaqo'rg'on sh.",
      "Bulung'ur t.",
      "Ishtixon t.",
      "Jomboy t.",
      "Kattaqo'rg'on t.",
      "Narpay t.",
      "Nurobod t.",
      "Oqdaryo t.",
      "Pastdarg'om t.",
      "Paxtachi t.",
      "Payariq t.",
      "Samarqand t.",
      "Toyloq t.",
      "Urgut t.",
      "Qo'shrabot t.",
    ],
  },
  {
    name: "Sirdaryo viloyati",
    districts: [
      "Guliston sh.",
      "Shirin sh.",
      "Yangiyer sh.",
      "Boyovut t.",
      "Guliston t.",
      "Mirzaobod t.",
      "Oqoltin t.",
      "Sardoba t.",
      "Sayxunobod t.",
      "Sirdaryo t.",
      "Xovos t.",
    ],
  },
  {
    name: "Surxondaryo viloyati",
    districts: [
      "Termiz sh.",
      "Angor t.",
      "Bandixon t.",
      "Boysun t.",
      "Denov t.",
      "Jarqo'rg'on t.",
      "Muzrabot t.",
      "Oltinsoy t.",
      "Qiziriq t.",
      "Qumqo'rg'on t.",
      "Sariosiyo t.",
      "Sherobod t.",
      "Sho'rchi t.",
      "Termiz t.",
      "Uzun t.",
    ],
  },
  {
    name: "Xorazm viloyati",
    districts: [
      "Urganch sh.",
      "Xiva sh.",
      "Bog'ot t.",
      "Gurlan t.",
      "Qo'shko'pir t.",
      "Shovot t.",
      "Tuproqqala t.",
      "Urganch t.",
      "Xiva t.",
      "Xonqa t.",
      "Hazorasp t.",
      "Yangiariq t.",
      "Yangibozor t.",
    ],
  },
  {
    name: "Toshkent shahri",
    districts: [
      "Bektemir t.",
      "Chilonzor t.",
      "Mirobod t.",
      "Mirzo Ulug'bek t.",
      "Sergeli t.",
      "Shayxontohur t.",
      "Olmazor t.",
      "Uchtepa t.",
      "Yakkasaroy t.",
      "Yunusobod t.",
      "Yangihayot t.",
      "Yashnobod t.",
    ],
  },
  {
    name: "Toshkent viloyati",
    districts: [
      "Nurafshon sh.",
      "Angren sh.",
      "Olmaliq sh.",
      "Chirchiq sh.",
      "Bekobod sh.",
      "Yangiyo'l sh.",
      "Ohangaron sh.",
      "Oqqo'rg'on t.",
      "O'rta Chirchiq t.",
      "Bo'ka t.",
      "Bo'stonliq t.",
      "Zangiota t.",
      "Qibray t.",
      "Quyi Chirchiq t.",
      "Parkent t.",
      "Piskent t.",
      "Toshkent t.",
      "Chinoz t.",
      "Yuqori Chirchiq t.",
      "Yangiyo'l t.",
      "Ohangaron t.",
      "Bekobod t.",
    ],
  },
];

async function seed() {
  const client = new Client({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    user: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "regionstat",
  });

  try {
    await client.connect();
    console.log("Connected to PostgreSQL");

    // 1. Find Republic Root
    const res = await client.query(
      "SELECT id, name FROM organizations WHERE parent_id IS NULL LIMIT 1",
    );
    const republicRoot = res.rows[0];

    if (!republicRoot) {
      console.error("Republic root not found.");
      return;
    }

    console.log(
      `Found Republic Root: ${republicRoot.name} (ID: ${republicRoot.id})`,
    );

    for (const reg of regionsData) {
      // Find or Create Region
      const regRes = await client.query(
        "SELECT id FROM organizations WHERE name = $1 AND parent_id = $2",
        [reg.name, republicRoot.id],
      );
      let regionId;

      if (regRes.rows.length === 0) {
        const insertReg = await client.query(
          "INSERT INTO organizations (id, name, parent_id) VALUES ($1, $2, $3) RETURNING id",
          [randomUUID(), reg.name, republicRoot.id],
        );
        regionId = insertReg.rows[0].id;
        console.log(`Created Region: ${reg.name}`);
      } else {
        regionId = regRes.rows[0].id;
        console.log(`Region exists: ${reg.name}`);
      }

      // Create Districts
      for (const distName of reg.districts) {
        const distRes = await client.query(
          "SELECT id FROM organizations WHERE name = $1 AND parent_id = $2",
          [distName, regionId],
        );
        if (distRes.rows.length === 0) {
          await client.query(
            "INSERT INTO organizations (id, name, parent_id) VALUES ($1, $2, $3)",
            [randomUUID(), distName, regionId],
          );
          console.log(`  Added District: ${distName} to ${reg.name}`);
        }
      }
    }

    console.log("Seeding completed successfully!");
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    await client.end();
  }
}

seed();
