const fs = require('fs');
const path = 'frontend/src/features/kommunal-hygiene/KommunalGigiyenaWaterPage.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// Find the line with "Тармоқ контрол нуқталаридан" in the BACT section (second occurrence)
let tarmokCount = 0;
let insertAfterIdx = -1;
for (let i = 0; i < lines.length; i++) {
    const l = lines[i].replace(/\r$/, '');
    if (l.includes('Тармоқ контрол нуқталаридан')) {
        tarmokCount++;
        if (tarmokCount === 2) {
            // This is the bact one - we insert AFTER this line
            insertAfterIdx = i;
            console.log('Found bact Тармоқ контрол at line', i + 1);
            break;
        }
    }
}

if (insertAfterIdx === -1) {
    console.log('ERROR: Could not find second Тармоқ контрол. Tarmok count:', tarmokCount);
    process.exit(1);
}

// Check what's currently at insertAfterIdx+1 (should be corrupted tbody code)
console.log('Line after:', lines[insertAfterIdx + 1]?.trim());

// The missing content to insert BETWEEN bact Тармоқ and the corrupted tbody content:
const missing = [
    `                                                 <th style={thStyle}><TW label="Истеъмолчидан" width={40} /></th>`,
    `                                                 <th style={thStyle}><TW label="УМС" width={30} /></th>`,
    `                                                 <th style={thStyle}><TW label="Коли индекс" width={35} /></th>`,
    `                                                 <th style={thStyle}><TW label="СФЗ" width={30} /></th>`,
    `                                             </tr>`,
    `                                             <tr>`,
    `                                                 {Array.from({ length: 14 }, (_, i) => (`,
    `                                                     <th key={\`chem-\${i}\`} style={{ ...thStyle, color: '#94a3b8' }}>{i + 1}</th>`,
    `                                                 ))}`,
    `                                                 {Array.from({ length: 8 }, (_, i) => (`,
    `                                                     <th key={\`bact-\${i}\`} style={{ ...thStyle, color: '#94a3b8' }}>{i + 1}</th>`,
    `                                                 ))}`,
    `                                             </tr>`,
    `                                         </thead>`,
    `                                         <tbody>`,
    `                                             {ROW_TYPES.map(rt => (`,
    `                                                 <tr key={rt.key}>`,
    `                                                     <td style={{ ...tdStyle, textAlign: 'left', fontWeight: rt.key.includes('norm') ? 400 : 700, paddingLeft: rt.key.includes('norm') ? 24 : 8, width: 220 }}>`,
];

// Insert missing lines after bact Тармоқ line
lines.splice(insertAfterIdx + 1, 0, ...missing);

// Verify the splice worked
console.log('\nAfter splice, lines around insertion:');
for (let i = insertAfterIdx; i <= insertAfterIdx + missing.length + 3; i++) {
    console.log(i + 1, ':', lines[i]?.trim()?.substring(0, 70));
}

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('\nDone! File saved.');
