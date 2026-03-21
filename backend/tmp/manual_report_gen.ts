import { Client } from 'pg';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';

const DB_CONFIG = {
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'regionstat',
};

async function generateManualReport(month: string, orgId: string) {
  const client = new Client(DB_CONFIG);
  await client.connect();

  try {
    console.log(`Generating report for ${month}, org: ${orgId}`);

    // Fetch records
    const res = await client.query(
      `SELECT * FROM appeal_records WHERE period_month = $1 AND organization_id = $2`,
      [month, orgId]
    );
    const records = res.rows;

    const [yearStr] = month.split("-");
    const currYear = parseInt(yearStr);
    const prevYear = currYear - 1;

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Report');

    sheet.addRow([`Murojaatlar hisoboti - ${month}`]);
    sheet.addRow(['ID', 'Sana', 'Murojaatchi', 'Kanal', 'Holat']);

    records.forEach(r => {
      sheet.addRow([r.id, r.date, r.applicant_name, r.channel, r.status]);
    });

    const outputPath = path.join(__dirname, `Appeals_Report_Manual_${month}.xlsx`);
    await workbook.xlsx.writeFile(outputPath);
    console.log(`Report generated: ${outputPath}`);
    return outputPath;
  } finally {
    await client.end();
  }
}

const month = process.argv[2] || '2026-03';
const orgId = process.argv[3]; // We might need a valid UUID here

if (!orgId) {
    console.error('Please provide an organizationId as the second argument');
    process.exit(1);
}

generateManualReport(month, orgId).catch(console.error);
