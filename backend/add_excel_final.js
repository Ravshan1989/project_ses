// UZ: Qolgan 3 ta sahifaga Excel export qo'shish
const fs = require('fs');

const files = [
    'EpidemiologyDailyReportPage.tsx',
    'CovidDailyReportPage.tsx',
    'AriDailyReportPage.tsx'
];

const basePath = 'd:/323/project_ses/frontend/src/features/disease/';

files.forEach(fileName => {
    const filePath = basePath + fileName;
    let content = fs.readFileSync(filePath, 'utf8');

    // UZ: 1. DownloadOutlined import qo'shish
    content = content.replace(
        "import { SaveOutlined, ReloadOutlined, ExperimentOutlined, DeleteOutlined, CheckCircleOutlined, AuditOutlined, QrcodeOutlined } from '@ant-design/icons';",
        "import { SaveOutlined, ReloadOutlined, ExperimentOutlined, DeleteOutlined, CheckCircleOutlined, AuditOutlined, QrcodeOutlined, DownloadOutlined } from '@ant-design/icons';"
    );

    // UZ: 2. Excel service import qo'shish
    content = content.replace(
        "import PermissionGate from '../../components/PermissionGate';",
        "import PermissionGate from '../../components/PermissionGate';\nimport { exportDailyReport } from '../../services/excelExportService'; // UZ: Excel eksport service"
    );

    // UZ: 3. Excel tugmasi qo'shish
    content = content.replace(
        "<Button icon={<ReloadOutlined />} onClick={fetchReports}>",
        "<Button icon={<DownloadOutlined />} onClick={handleExcelExport}>Excel</Button>\n                            <Button icon={<ReloadOutlined />} onClick={fetchReports}>"
    );

    // UZ: 4. handleExcelExport funksiyasini qo'shish (handleSave dan keyin)
    const handleSaveMatch = content.match(/(const handleSave = async \(\) => {[\s\S]*?    };)/);
    if (handleSaveMatch) {
        const handleSaveEnd = content.indexOf(handleSaveMatch[0]) + handleSaveMatch[0].length;

        const excelFunction = `

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
        const prefix = '${fileName.replace('DailyReportPage.tsx', '')}';
        const fileName = \`\${prefix}_Kunlik_\${date.format('DD-MM-YYYY')}\`;
        const title = t('daily_reports.${fileName.toLowerCase().replace('dailyreportpage.tsx', '')}_title');
        const dateStr = date.format('DD.MM.YYYY');

        // UZ: Excel ga eksport qilish
        exportDailyReport(data, fileName, title, dateStr, columns);
        notification.success({ message: 'Excel fayl yuklab olindi!' });
    };`;

        content = content.slice(0, handleSaveEnd) + excelFunction + content.slice(handleSaveEnd);
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${fileName} - Excel export qo'shildi`);
});

console.log('\n🎉 Barcha sahifalarga Excel export qo'shildi!');
