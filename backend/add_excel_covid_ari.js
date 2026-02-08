// UZ: Covid va ARI sahifalariga Excel export qo'shish - final
const fs = require('fs');

// UZ: CovidDailyReportPage
let covidContent = fs.readFileSync('d:/323/project_ses/frontend/src/features/disease/CovidDailyReportPage.tsx', 'utf8');

// UZ: Funksiya qo'shish - handleSave dan keyin
const covidInsertPos = covidContent.indexOf('    const handleVerify = async (id: string) => {');
const covidFunc = `
    // UZ: Excel ga eksport qilish funksiyasi
    const handleExcelExport = () => {
        const columns = data.length > 0 ? Object.keys(data[0])
            .filter(key => !['is_submitted', 'id', 'organizationId', 'status', 'verificationToken'].includes(key))
            .map(key => ({
                header: key === 'key' ? '№' : key === 'district_name' ? t('daily_reports.table.district') : key,
                key: key,
                width: key === 'key' ? 5 : key === 'district_name' ? 20 : 12
            })) : [];
        const fileName = \`COVID_Kunlik_\${date.format('DD-MM-YYYY')}\`;
        const title = t('daily_reports.covid_title');
        const dateStr = date.format('DD.MM.YYYY');
        exportDailyReport(data, fileName, title, dateStr, columns);
        notification.success({ message: 'Excel fayl yuklab olindi!' });
    };

`;

covidContent = covidContent.slice(0, covidInsertPos) + covidFunc + covidContent.slice(covidInsertPos);
fs.writeFileSync('d:/323/project_ses/frontend/src/features/disease/CovidDailyReportPage.tsx', covidContent, 'utf8');
console.log('✅ CovidDailyReportPage - Excel export funksiyasi qo'shildi');

// UZ: AriDailyReportPage
let ariContent = fs.readFileSync('d:/323/project_ses/frontend/src/features/disease/AriDailyReportPage.tsx', 'utf8');

// UZ: 1. Import qo'shish
ariContent = ariContent.replace(
    "} from '@ant-design/icons';",
    ", DownloadOutlined } from '@ant-design/icons';"
);

ariContent = ariContent.replace(
    "import { useTranslation } from 'react-i18next';",
    "import { useTranslation } from 'react-i18next';\nimport { exportDailyReport } from '../../services/excelExportService'; // UZ: Excel eksport service"
);

// UZ: 2. Funksiya qo'shish
const ariInsertPos = ariContent.indexOf('    const handleVerify = async (id: string) => {');
const ariFunc = `
    // UZ: Excel ga eksport qilish funksiyasi
    const handleExcelExport = () => {
        const columns = data.length > 0 ? Object.keys(data[0])
            .filter(key => !['is_submitted', 'id', 'organizationId', 'status', 'verificationToken'].includes(key))
            .map(key => ({
                header: key === 'key' ? '№' : key === 'district_name' ? t('daily_reports.table.district') : key,
                key: key,
                width: key === 'key' ? 5 : key === 'district_name' ? 20 : 12
            })) : [];
        const fileName = \`ARI_Kunlik_\${date.format('DD-MM-YYYY')}\`;
        const title = t('daily_reports.ari_title');
        const dateStr = date.format('DD.MM.YYYY');
        exportDailyReport(data, fileName, title, dateStr, columns);
        notification.success({ message: 'Excel fayl yuklab olindi!' });
    };

`;

ariContent = ariContent.slice(0, ariInsertPos) + ariFunc + ariContent.slice(ariInsertPos);

// UZ: 3. Tugma qo'shish
ariContent = ariContent.replace(
    '<Button icon={<ReloadOutlined />} onClick={fetchReports}>',
    '<Button icon={<DownloadOutlined />} onClick={handleExcelExport}>Excel</Button>\n                            <Button icon={<ReloadOutlined />} onClick={fetchReports}>'
);

fs.writeFileSync('d:/323/project_ses/frontend/src/features/disease/AriDailyReportPage.tsx', ariContent, 'utf8');
console.log('✅ AriDailyReportPage - Excel export to\'liq qo\'shildi');

console.log('\n🎉 Barcha sahifalarga Excel export qo\'shildi!');
