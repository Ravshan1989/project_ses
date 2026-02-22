import { Client } from "pg";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

async function check() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const res = await client.query(
      "SELECT id, name, parent_id FROM organizations",
    );
    console.log("Organizations:", res.rows);

    const res2 = await client.query("SELECT count(*) FROM submissions");
    console.log("Total submissions:", res2.rows[0].count);

    const res3 = await client.query(
      'SELECT id, "reportingPeriod", "isTest", template_id, organization_id FROM submissions LIMIT 10',
    );
    console.log("Sample submissions:", res3.rows);

    const res4 = await client.query("SELECT id, code FROM templates");
    console.log("Templates:", res4.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

check();
