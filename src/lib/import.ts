import ExcelJS from 'exceljs';
import { PlanState, MONTHS } from '../data';

const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toUpperCase();

const getCellText = (cell: ExcelJS.Cell | undefined): string => {
  if (!cell || cell.value === null || cell.value === undefined) return "";
  if (typeof cell.value === 'object' && 'richText' in cell.value) {
     return cell.value.richText.map(rt => rt.text).join('');
  }
  return cell.value.toString().trim();
};

export const importFromExcel = async (file: File, currentState: PlanState): Promise<PlanState> => {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  
  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error("El archivo de Excel no contiene hojas de cálculo válidas.");
  }

  const newState = JSON.parse(JSON.stringify(currentState)) as PlanState;
  
  // Search for Iglesia and Ministro
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      const val = normalize(getCellText(cell));
      if (val.includes("NOMBRE DE LA IGLESIA")) {
        const adjacent = getCellText(row.getCell(cell.col + 1));
        if (adjacent) newState.iglesia = adjacent;
      }
      if (val.includes("MINISTRO ACTUAL")) {
        const adjacent = getCellText(row.getCell(cell.col + 1));
        if (adjacent) newState.ministro = adjacent;
      }
    });
  });

  // Extract activities
  worksheet.eachRow((row) => {
    const firstCellVal = getCellText(row.getCell(1));
    // Remove leading numbering like "1.", " 1. " and normalize
    const cleanName = normalize(firstCellVal.replace(/^\s*\d+\.\s*/, ''));
    
    if (cleanName) {
      let found = false;
      for (const area of newState.areas) {
        if (found) break;
        for (const act of area.activities) {
          if (normalize(act.name) === cleanName) {
            found = true;
            MONTHS.forEach((month, index) => {
              const cellVal = row.getCell(index + 2).value;
              let num = 0;
              if (typeof cellVal === 'number') num = cellVal;
              else if (typeof cellVal === 'string') num = parseInt(cellVal, 10) || 0;
              act.months[month] = isNaN(num) ? 0 : num;
            });
            const obsVal = getCellText(row.getCell(15));
            act.observaciones = obsVal;
            break;
          }
        }
      }
    }
  });

  return newState;
};

