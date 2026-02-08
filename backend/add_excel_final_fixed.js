// UZ: Qolgan 3 ta sahifaga Excel export qo'shish - to'g'ri versiya
const fs = require('fs');

const pages = [
    {
        file: 'd:/323/project_ses/frontend/src/features/disease/EpidemiologyDailyReportPage.tsx',
        title: 'daily_reports.epidemiology_title',
        prefix: 'Epidemiologiya_Kunlik'
    },
    {
        file: 'd:/323/project_ses/frontend/src/features/disease/CovidDailyReportPage.tsx',
        title: 'daily_reports.covid_title',
        prefix: 'COVID_Kunlik'
    },
    {
        file: 'd:/323/project_ses/frontend/src/features/disease/AriDailyReportPage.tsx',
        title: 'daily_reports.ari_title',
        prefix: 'ARI_Kunlik'
    }
];

pages.forEach(page => {
    let content = fs.readFileSync(page.file, 'utf8');

    // UZ: 1. DownloadOutlined import qo'shish
    content = content.replace(
        "} from '@ant-design/icons';",
        ", DownloadOutlined } from '@ant-design/icons';"
    );

    // UZ: 2. Excel service import qo'shish
    const importIndex = content.indexOf("import { useTranslation } from 'react-i18next';");
    if (importIndex > 0) {
        content = content.slice(0, importIndex) +
            "import { exportDailyReport } from '../../services/excelExportService'; // UZ: Excel eksport service\n" +
            content.slice(importIndex);
    }

    // UZ: 3. Excel tugmasi qo'shish
    content = content.replace(
        '<Button icon={<ReloadOutlined />} onClick={fetchReports}>',
        '<Button icon={<DownloadOutlined />} onClick={handleExcelExport}>Excel</Button>\n                            <Button icon={<ReloadOutlined />} onClick={fetchReports}>'
    );

    // UZ: 4. handleExcelExport funksiyasini qo'shish
    const handleSavePattern = /const handleSave = async \(\) => \{[\s\S]*?\n    \};/;
    const match = content.match(handleSavePattern);

    if (match) {
        const insertPos = content.indexOf(match[0]) + match[0].length;

        const excelFunc = `

    // UZ: Excel ga eksport qilish funksiyasi
    const handleExcelExport = () => {
        // UZ: Ustunlar ro'yxati (avtomatik)
        const columns = data.length > 0 ? Object.keys(data[0])
            .filter(key => !['is_submitted', 'id', 'organizationId', 'status', 'verificationToken'].includes(key))
            .map(key => ({
                header: key === 'key' ? '№' : key === 'district_name' ? t('daily_reports.table.district') : key,
                key: key,
                width: key === 'key' ? 5 : key === 'district_name' ? 20 : 12
            })) : [];

        // UZ: Fayl nomi va sarlavha
        const fileName = \`${page.prefix}_\${date.format('DD-MM-YYYY')}\`;
        const title = t('${page.title}');
        const dateStr = date.format('DD.MM.YYYY');

        // UZ: Excel ga eksport qilish
        exportDailyReport(data, fileName, title, dateStr, columns);
        notification.success({ message: 'Excel fayl yuklab olindi!' });
    };`;

        content = content.slice(0, insertPos) + excelFunc + content.slice(insertPos);
    }

    fs.writeFileSync(page.file, content, 'utf8');
    console.log(`✅ ${page.prefix} - Excel export qo'shildi`);
});

console.log('\n🎉 Barcha sahifalarga Excel export qo'shildi!');
