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
// UZ: Haftalik hisobotlar uchun Excel export (nested headers bilan)
export const exportWeeklyReport = (
    data: any[],
    fileName: string,
    title: string,
    period: string,
    columns: any[]
) => {
    const workbook = XLSX.utils.book_new();
    const worksheetData: any[][] = [];

    // Title and Period
    worksheetData.push([title]);
    worksheetData.push([`Davr: ${period}`]);
    worksheetData.push([]); // Spacer

    // Nested Headers (Row 4 and 5)
    // Row 4: Top level headers (Hudud, ARI, Pneumonia, Flu, SARI, Deaths)
    // Row 5: Detailed sub-headers (Jami, Age groups, etc.)
    const headerRow1: string[] = ['', '']; // For No and District
    const headerRow2: string[] = ['№', 'Ma\'muriy hududlar'];

    columns.slice(2).forEach(col => {
        if (col.children) {
            headerRow1.push(col.title);
            col.children.forEach((child: any, idx: number) => {
                if (idx > 0) headerRow1.push(''); // Empty cells for merge
                headerRow2.push(child.title);
            });
        } else {
            headerRow1.push(col.title);
            headerRow2.push('');
        }
    });

    worksheetData.push(headerRow1);
    worksheetData.push(headerRow2);

    // Data Row 6+
    data.forEach((row, idx) => {
        const rowData: any[] = [idx + 1, row.district_name];
        columns.slice(2).forEach(col => {
            if (col.children) {
                col.children.forEach((child: any) => {
                    rowData.push(row[child.dataIndex] ?? 0);
                });
            } else {
                rowData.push(row[col.dataIndex] ?? 0);
            }
        });
        worksheetData.push(rowData);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Merges for nested headers
    const merges: any[] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 10 } }, // Title
        { s: { r: 3, c: 0 }, e: { r: 4, c: 0 } }, // No
        { s: { r: 3, c: 1 }, e: { r: 4, c: 1 } }, // District
    ];

    let currentCol = 2;
    columns.slice(2).forEach(col => {
        if (col.children) {
            merges.push({ s: { r: 3, c: currentCol }, e: { r: 3, c: currentCol + col.children.length - 1 } });
            currentCol += col.children.length;
        } else {
            merges.push({ s: { r: 3, c: currentCol }, e: { r: 4, c: currentCol } });
            currentCol += 1;
        }
    });
    worksheet['!merges'] = merges;

    // Formatting
    const headerStyle = {
        font: { bold: true },
        fill: { fgColor: { rgb: 'D3D3D3' } },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border: {
            top: { style: 'thin' }, bottom: { style: 'thin' },
            left: { style: 'thin' }, right: { style: 'thin' }
        }
    };

    // Apply header style to rows 4 and 5
    for (let c = 0; c < headerRow2.length; c++) {
        const addr1 = XLSX.utils.encode_cell({ r: 3, c });
        const addr2 = XLSX.utils.encode_cell({ r: 4, c });
        if (worksheet[addr1]) worksheet[addr1].s = headerStyle;
        if (worksheet[addr2]) worksheet[addr2].s = headerStyle;
    }

    // Set widths
    worksheet['!cols'] = [{ wch: 5 }, { wch: 30 }, ...Array(headerRow2.length - 2).fill({ wch: 10 })];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Haftalik Hisobot');
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

// UZ: Yagona kunlik hisobot uchun ko'p varaqli Excel export
export const exportUnifiedDailyReport = (
    sections: {
        data: any[];
        columns: { header: string; key: string; width?: number }[];
        title: string;
        sheetName: string;
    }[],
    fileName: string,
    date: string
) => {
    const workbook = XLSX.utils.book_new();

    sections.forEach(section => {
        const worksheetData: any[][] = [];
        worksheetData.push([section.title]);
        worksheetData.push([`Sana: ${date}`]);
        worksheetData.push([]);

        const headers = section.columns.map(col => col.header);
        worksheetData.push(headers);

        section.data.forEach(row => {
            const rowData = section.columns.map(col => row[col.key] ?? 0);
            worksheetData.push(rowData);
        });

        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        worksheet['!cols'] = section.columns.map(col => ({ wch: col.width || 15 }));

        // Simple styling for headers
        headers.forEach((_, idx) => {
            const cellAddress = XLSX.utils.encode_cell({ r: 3, c: idx });
            if (worksheet[cellAddress]) {
                worksheet[cellAddress].s = {
                    font: { bold: true },
                    fill: { fgColor: { rgb: 'D3D3D3' } },
                    alignment: { horizontal: 'center' },
                    border: {
                        top: { style: 'thin' }, bottom: { style: 'thin' },
                        left: { style: 'thin' }, right: { style: 'thin' }
                    }
                };
            }
        });

        XLSX.utils.book_append_sheet(workbook, worksheet, section.sheetName);
    });

    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};
