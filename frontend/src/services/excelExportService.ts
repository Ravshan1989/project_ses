// UZ: Excel eksport uchun umumiy service
// UZ: Barcha sahifalar uchun bitta joydan Excel export qilish imkoniyati
import XLSX from 'xlsx-js-style';

// UZ: Oddiy jadval uchun Excel export
export const exportSimpleTable = (data: any[], fileName: string, sheetName: string = 'Hisobot') => {
    // UZ: Workbook yaratish
    const workbook = XLSX.utils.book_new();

    // UZ: Ma'lumotlarni worksheet ga aylantirish
    const worksheet = XLSX.utils.json_to_sheet(data);

    // UZ: Worksheet ni workbook ga qo'shish
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // UZ: Faylni yuklab olish
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

// UZ: Kunlik hisobotlar uchun Excel export (formatlash bilan)
export const exportDailyReport = (
    data: any[],
    fileName: string,
    title: string,
    date: string,
    columns: { header: string; key: string; width?: number }[]
) => {
    // UZ: Workbook yaratish
    const workbook = XLSX.utils.book_new();

    // UZ: Sarlavha va ma'lumotlarni tayyorlash
    const worksheetData: any[][] = [];

    // UZ: Sarlavha qatori
    worksheetData.push([title]);
    worksheetData.push([`Sana: ${date}`]);
    worksheetData.push([]); // UZ: Bo'sh qator

    // UZ: Ustun sarlavhalari
    const headers = columns.map(col => col.header);
    worksheetData.push(headers);

    // UZ: Ma'lumotlar qatorlari
    data.forEach(row => {
        const rowData = columns.map(col => row[col.key] ?? 0);
        worksheetData.push(rowData);
    });

    // UZ: Worksheet yaratish
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // UZ: Ustun kengliklarini sozlash
    const colWidths = columns.map(col => ({ wch: col.width || 15 }));
    worksheet['!cols'] = colWidths;

    // UZ: Sarlavha uchun formatlash
    if (worksheet['A1']) {
        worksheet['A1'].s = {
            font: { bold: true, sz: 14 },
            alignment: { horizontal: 'center', vertical: 'center' }
        };
    }

    // UZ: Ustun sarlavhalari uchun formatlash
    const headerRow = 4; // UZ: 4-qator (0-indexed: 3)
    headers.forEach((_, idx) => {
        const cellAddress = XLSX.utils.encode_cell({ r: 3, c: idx });
        if (worksheet[cellAddress]) {
            worksheet[cellAddress].s = {
                font: { bold: true },
                fill: { fgColor: { rgb: 'D3D3D3' } },
                alignment: { horizontal: 'center', vertical: 'center' },
                border: {
                    top: { style: 'thin', color: { rgb: '000000' } },
                    bottom: { style: 'thin', color: { rgb: '000000' } },
                    left: { style: 'thin', color: { rgb: '000000' } },
                    right: { style: 'thin', color: { rgb: '000000' } }
                }
            };
        }
    });

    // UZ: Ma'lumotlar uchun border qo'shish
    data.forEach((_, rowIdx) => {
        columns.forEach((_, colIdx) => {
            const cellAddress = XLSX.utils.encode_cell({ r: rowIdx + 4, c: colIdx });
            if (worksheet[cellAddress]) {
                worksheet[cellAddress].s = {
                    border: {
                        top: { style: 'thin', color: { rgb: '000000' } },
                        bottom: { style: 'thin', color: { rgb: '000000' } },
                        left: { style: 'thin', color: { rgb: '000000' } },
                        right: { style: 'thin', color: { rgb: '000000' } }
                    }
                };
            }
        });
    });

    // UZ: Worksheet ni workbook ga qo'shish
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Kunlik Hisobot');

    // UZ: Faylni yuklab olish
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

// UZ: Form1 uchun backend API orqali export
export const exportForm1 = async (period: string, apiUrl: string) => {
    try {
        // UZ: Backend dan Excel faylni olish
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Excel yuklab olishda xatolik');
        }

        // UZ: Blob sifatida olish
        const blob = await response.blob();

        // UZ: Yuklab olish
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Form1_${period}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Excel export error:', error);
        throw error;
    }
};
