// UZ: Barcha kunlik hisobotlarga Excel export qo'shish scripti
const fs = require('fs');
const path = require('path');

// UZ: Fayllar ro'yxati
const files = [
    {
        path: 'd:/323/project_ses/frontend/src/features/disease/FluDailyReportPage.tsx',
        title: 'daily_reports.flu_title',
        prefix: 'Gripp_Kunlik'
    },
    {
        path: 'd:/323/project_ses/frontend/src/features/disease/EpidemiologyDailyReportPage.tsx',
        title: 'daily_reports.epidemiology_title',
        prefix: 'Epidemiologiya_Kunlik'
    },
    {
        path: 'd:/323/project_ses/frontend/src/features/disease/CovidDailyReportPage.tsx',
        title: 'daily_reports.covid_title',
        prefix: 'COVID_Kunlik'
    },
    {
        path: 'd:/323/project_ses/frontend/src/features/disease/AriDailyReportPage.tsx',
        title: 'daily_reports.ari_title',
        prefix: 'ARI_Kunlik'
    }
];

files.forEach(fileInfo => {
    let content = fs.readFileSync(fileInfo.path, 'utf8');

    // UZ: 1. Import qo'shish - DownloadOutlined icon
    if (!content.includes('DownloadOutlined')) {
        // UZ: Eski importni izohga olamiz va yangisini qo'shamiz (Append-only)
        content = content.replace(
            /import { (.*) } from '@ant-design\/icons';/g,
            "// $& // ESKI\nimport { $1, DownloadOutlined } from '@ant-design/icons';"
        );
    }

    // UZ: 2. Excel service import qo'shish
    if (!content.includes('excelExportService')) {
        content = content.replace(
            /import PermissionGate from/,
            `// import PermissionGate from // ESKI\nimport { exportDailyReport } from '../../services/excelExportService'; // UZ: Excel eksport service\nimport PermissionGate from`
        );
    }

    // UZ: 3. Excel tugmasi qo'shish
    if (!content.includes('handleExcelExport')) {
        // UZ: Tugma qo'shish - ReloadOutlined dan oldin (Append-only)
        content = content.replace(
            /<Button icon={<ReloadOutlined \/>}(.*?)<\/Button>/s,
            (match) => `// ${match} // ESKI\n                            <Button icon={<DownloadOutlined />} onClick={handleExcelExport}>Excel</Button>\n                            ${match}`
        );

        // UZ: handleSave funksiyasidan keyin handleExcelExport qo'shish
        const handleSaveEnd = content.indexOf('    };', content.indexOf('const handleSave'));
        if (handleSaveEnd > 0) {
            const insertPos = handleSaveEnd + 6; // "    };" dan keyin

            const excelFunction = `

    // UZ: Excel ga eksport qilish funksiyasi
    const handleExcelExport = () => {
        // UZ: Ustunlar ro'yxati (har bir sahifa uchun mos)
        const columns = data.length > 0 ? Object.keys(data[0])
            .filter(key => key !== 'is_submitted' && key !== 'id' && key !== 'organizationId' && key !== 'status' && key !== 'verificationToken')
            .map(key => ({
                header: key === 'key' ? '№' : key === 'district_name' ? t('daily_reports.table.district') : key,
                key: key,
                width: key === 'key' ? 5 : key === 'district_name' ? 20 : 12
            })) : [];

        // UZ: Fayl nomi va sarlavha
        const fileName = \`\${fileInfo.prefix}_\${date.format('DD-MM-YYYY')}\`;
        const title = t('\${fileInfo.title}');
        const dateStr = date.format('DD.MM.YYYY');

        // UZ: Excel ga eksport qilish
        exportDailyReport(data, fileName, title, dateStr, columns);
        notification.success({ message: 'Excel fayl yuklab olindi!' });
    };
`;

            content = content.slice(0, insertPos) + excelFunction + content.slice(insertPos);
        }
    }

    fs.writeFileSync(fileInfo.path, content, 'utf8');
    console.log(`✅ Excel export qo'shildi: ${path.basename(fileInfo.path)}`);
});

console.log(`\n🎉 Barcha sahifalarga Excel export qo'shildi!`);
