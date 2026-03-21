import { Client } from 'pg';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

const DB_CONFIG = {
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'regionstat',
};

async function generateManualPdf(month: string, orgId: string) {
  const client = new Client(DB_CONFIG);
  await client.connect();

  try {
    console.log(`Generating PDF for ${month}, org: ${orgId}`);

    // Fetch records
    const res = await client.query(
      `SELECT * FROM appeal_records WHERE period_month = $1 AND organization_id = $2`,
      [month, orgId]
    );
    const records = res.rows;

    const doc = new PDFDocument();
    const outputPath = path.join(__dirname, `Appeals_Report_Manual_${month}.pdf`);
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    doc.fontSize(20).text(`Murojaatlar hisoboti - ${month}`, { align: 'center' });
    doc.moveDown();

    records.forEach((r, idx) => {
      doc.fontSize(12).text(`${idx + 1}. ${r.applicant_name} | Kanal: ${r.channel} | Holat: ${r.status}`);
      doc.moveDown(0.2);
    });

    doc.end();
    
    return new Promise((resolve) => {
        stream.on('finish', () => {
            console.log(`PDF generated: ${outputPath}`);
            resolve(outputPath);
        });
    });
  } finally {
    await client.end();
  }
}

const month = process.argv[2] || '2026-03';
const orgId = process.argv[3];

if (!orgId) {
    console.error('Please provide an organizationId as the second argument');
    process.exit(1);
}

generateManualPdf(month, orgId).catch(console.error);
