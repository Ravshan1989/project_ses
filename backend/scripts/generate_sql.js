const fs = require('fs');
const data = JSON.parse(fs.readFileSync('disease_list.json', 'utf8'));
const sql = data.map(d => {
    const escapedName = d.name.replace(/'/g, "''");
    return `INSERT INTO diseases (code, name, "reportFrequency", "isActive") VALUES ('${d.code}', '${escapedName}', 'MONTHLY', true) ON CONFLICT (code) DO NOTHING;`;
}).join('\n');
fs.writeFileSync('insert_diseases.sql', sql);
console.log(`Generated SQL for ${data.length} diseases.`);
