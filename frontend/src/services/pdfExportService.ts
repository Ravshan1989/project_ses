import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';

// UZ: Font muammosini hal qilish uchun asosiy fontni yuklash kerak bo'lishi mumkin.
// Hozircha standart font bilan ishlaymiz. Agar kirillcha chiqmasa, base64 font qo'shamiz.

export const exportDailyReportPDF = (
    data: any[],
    columns: any[],
    title: string,
    dateStr: string,
    isLandscape: boolean = true
) => {
    const doc = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    // Sarlavha
    doc.setFontSize(14);
    doc.text(title, 14, 15);
    doc.setFontSize(10);
    doc.text(`Holat: ${dateStr}`, 14, 22);

    // Jadval ustunlarini tayyorlash
    const tableHead = [columns.map(c => c.header)];

    // Jadval ma'lumotlarini tayyorlash
    const tableBody = data.map(row => {
        return columns.map(col => {
            // Agar kalit ichma-ich bo'lsa (nested), masalan 'organization.name'
            const keys = col.key.split('.');
            let value = row;
            keys.forEach((k: string) => {
                value = value ? value[k] : '';
            });
            return value;
        });
    });

    // Jadvalni chizish
    autoTable(doc, {
        head: tableHead,
        body: tableBody,
        startY: 30,
        styles: {
            fontSize: 8,
            cellPadding: 1,
            valign: 'middle',
            halign: 'center',
            lineWidth: 0.1,
            lineColor: [200, 200, 200]
        },
        headStyles: {
            fillColor: [22, 119, 255], // Ant Design Blue
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center'
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245]
        },
        // Kirill yozuvlarini qo'llab-quvvatlash uchun fontni tekshirish kerak
        // Agar chiqmasa, 'Roboto' yoki shunga o'xshash font kerak bo'ladi
        theme: 'grid'
    });

    // Faylni saqlash
    const fileName = `${title.replace(/\s+/g, '_')}_${dayjs().format('YYYY-MM-DD_HH-mm')}.pdf`;
    doc.save(fileName);
};
