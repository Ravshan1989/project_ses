const fs = require('fs');
const path = require('path');

const files = [
    'd:/323/project_ses/frontend/src/features/disease/FluDailyReportPage.tsx',
    'd:/323/project_ses/frontend/src/features/disease/EpidemiologyDailyReportPage.tsx',
    'd:/323/project_ses/frontend/src/features/disease/CovidDailyReportPage.tsx',
    'd:/323/project_ses/frontend/src/features/disease/AriDailyReportPage.tsx',
    'd:/323/project_ses/frontend/src/features/export/ExportPage.tsx'
];

files.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove isTestMode state
    content = content.replace(/\s*const \[isTestMode, setIsTestMode\] = useState\(false\);.*\n/g, '\n');

    // Fix useEffect dependency
    content = content.replace(/}, \[date, isTestMode\]\);/g, '}, [date]);');

    // Remove isTest from API calls
    content = content.replace(/isTestMode/g, 'false');
    content = content.replace(/isTest:\s*false.*\n/g, '');
    content = content.replace(/\&isTest=false/g, '');

    // Remove test mode UI (switch and alert)
    content = content.replace(/\s*{isTestMode && \([\s\S]*?<\/Popconfirm>\s*\)\}\s*/g, '');
    content = content.replace(/\s*<div style={{ display: 'flex'.*?isTestMode.*?<\/div>\s*/g, '');
    content = content.replace(/\s*{isTestMode && \([\s\S]*?<\/Alert>\s*\)\}\s*/g, '');

    // Remove cleanup function
    content = content.replace(/\s*const handleCleanup = async \(\) => {[\s\S]*?};/g, '');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Tozalandi: ${path.basename(filePath)}`);
});

console.log('\n🎉 Barcha fayllar tozalandi!');
