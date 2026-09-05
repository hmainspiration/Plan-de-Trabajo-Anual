import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { PlanState, MONTHS } from './data';

const areaColors = [
  'FFBDD7EE', // Light Blue
  'FFC6E0B4', // Light Green
  'FFFFE699', // Light Yellow
];

export const exportToExcel = async (plan: PlanState) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Plan de Trabajo', {
    views: [{ showGridLines: false }]
  });
  
  // Set column widths
  worksheet.columns = [
    { width: 40 }, // ACTIVIDAD
    ...MONTHS.map(() => ({ width: 8 })), // 12 months
    { width: 12 }, // TOTAL ANUAL
    { width: 30 }  // OBSERVACIONES
  ];

  let currentRow = 2;

  // Title
  worksheet.mergeCells(`A${currentRow}:O${currentRow}`);
  const titleCell = worksheet.getCell(`A${currentRow}`);
  titleCell.value = 'PLAN DE TRABAJO ANUAL - JURISDICCION NICARAGUA';
  titleCell.font = { bold: true, size: 12 };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  currentRow += 2;

  // Iglesia
  worksheet.getCell(`A${currentRow}`).value = 'NOMBRE DE LA IGLESIA:';
  worksheet.getCell(`A${currentRow}`).font = { bold: true };
  worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'right' };
  worksheet.mergeCells(`B${currentRow}:G${currentRow}`);
  const iglesiaCell = worksheet.getCell(`B${currentRow}`);
  iglesiaCell.value = plan.iglesia;
  iglesiaCell.border = { bottom: { style: 'thin' } };
  iglesiaCell.alignment = { horizontal: 'center' };
  currentRow++;

  // Ministro
  worksheet.getCell(`A${currentRow}`).value = 'MINISTRO ACTUAL:';
  worksheet.getCell(`A${currentRow}`).font = { bold: true };
  worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'right' };
  worksheet.mergeCells(`B${currentRow}:G${currentRow}`);
  const ministroCell = worksheet.getCell(`B${currentRow}`);
  ministroCell.value = plan.ministro;
  ministroCell.border = { bottom: { style: 'thin' } };
  ministroCell.alignment = { horizontal: 'center' };
  currentRow += 2; // Extra space

  const borderStyle: Partial<ExcelJS.Borders> = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };

  plan.areas.forEach((area, index) => {
    const color = areaColors[index % areaColors.length];
    const fillStyle: ExcelJS.Fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: color }
    };

    // Area Header
    worksheet.mergeCells(`A${currentRow}:O${currentRow}`);
    const areaCell = worksheet.getCell(`A${currentRow}`);
    areaCell.value = `${area.name}: OBJETIVO PRINCIPAL: ${area.objective}`;
    areaCell.font = { bold: true };
    areaCell.alignment = { horizontal: 'center', vertical: 'middle' };
    currentRow++;

    // Columns Header
    const headerRow = worksheet.getRow(currentRow);
    const headers = ["ACTIVIDAD", ...MONTHS, "TOTAL,\nANUAL", "OBSERVACIONES Y\nCOMENTARIOS"];
    headers.forEach((h, i) => {
      const cell = headerRow.getCell(i + 1);
      cell.value = h;
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.fill = fillStyle;
      cell.border = borderStyle;
    });
    headerRow.height = 30;
    currentRow++;

    // Activities
    area.activities.forEach((act, actIndex) => {
      const row = worksheet.getRow(currentRow);
      
      // Actividad
      const cellA = row.getCell(1);
      cellA.value = `  ${actIndex + 1}.  ${act.name}`;
      cellA.fill = fillStyle;
      cellA.border = borderStyle;
      cellA.alignment = { vertical: 'middle' };
      
      let total = 0;
      MONTHS.forEach((month, mIndex) => {
        const val = act.months[month] || 0;
        const cellM = row.getCell(mIndex + 2);
        cellM.value = val === 0 ? '' : val;
        cellM.alignment = { horizontal: 'center', vertical: 'middle' };
        cellM.border = borderStyle;
        total += val;
      });
      
      // Total
      const cellTotal = row.getCell(14);
      cellTotal.value = total === 0 ? '' : total;
      cellTotal.alignment = { horizontal: 'center', vertical: 'middle' };
      cellTotal.fill = fillStyle;
      cellTotal.border = borderStyle;
      
      // Observaciones
      const cellObs = row.getCell(15);
      cellObs.value = act.observaciones || "";
      cellObs.fill = fillStyle;
      cellObs.border = borderStyle;
      cellObs.alignment = { vertical: 'middle', wrapText: true };
      
      currentRow++;
    });

    currentRow += 1; // Spacing between areas
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const fileName = plan.iglesia ? `Plan_Trabajo_${plan.iglesia.replace(/\s+/g, '_')}.xlsx` : "Plan_Trabajo.xlsx";
  saveAs(blob, fileName);
  return blob;
};
