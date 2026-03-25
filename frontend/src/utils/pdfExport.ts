import jsPDF from 'jspdf';
import 'jspdf-autotable';
import dayjs from 'dayjs';

// UZ: PDF eksport qilish uchun universal funksiya
export const exportDashboardToPDF = (data: {
    title: string;
    subtitle: string;
    stats: { label: string; value: string | number }[];
    tableData: any[];
    tableColumns: { header: string; dataKey: string }[];
    user: string;
    organization: string;
}) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    // UZ: Sarlavha (Header)
    doc.setFontSize(22);
    doc.setTextColor(22, 119, 255); // Blue
    doc.text(data.title.toUpperCase(), 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(data.subtitle, 14, 28);
    doc.text(`Sana: ${dayjs().format('DD.MM.YYYY HH:mm')}`, 14, 33);
    doc.text(`Tashkilot: ${data.organization}`, 14, 38);
    doc.text(`Mas'ul: ${data.user}`, 14, 43);

    // UZ: Chiziq
    doc.setLineWidth(0.5);
    doc.line(14, 48, 196, 48);

    // UZ: Statistika (Stats Cards)
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('ASOSIY KO\'RSATKICHLAR', 14, 58);

    let yPos = 68;
    data.stats.forEach((stat) => {
        doc.setFontSize(10);
        doc.setTextColor(80);
        doc.text(`${stat.label}:`, 14, yPos);
        
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.setFont('helvetica', 'bold');
        doc.text(String(stat.value), 60, yPos);
        doc.setFont('helvetica', 'normal');
        yPos += 8;
    });

    // UZ: Jadval (Table)
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('HISOBOTLAR RO\'YXATI', 14, yPos + 10);

    (doc as any).autoTable({
        startY: yPos + 15,
        head: [data.tableColumns.map(col => col.header)],
        body: data.tableData.map(row => data.tableColumns.map(col => {
            const val = row[col.dataKey];
            // Handle nested objects if any (e.g., organization.name)
            if (typeof val === 'object' && val !== null) {
                return val.name || JSON.stringify(val);
            }
            return String(val);
        })),
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [22, 119, 255], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        margin: { top: 30 },
    });

    // UZ: Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `Smart SES Monitoring Tizimi - Sahifa ${i} / ${pageCount}`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
    }

    // UZ: Faylni saqlash
    doc.save(`Hisobot_${dayjs().format('YYYYMMDD_HHmm')}.pdf`);
};
