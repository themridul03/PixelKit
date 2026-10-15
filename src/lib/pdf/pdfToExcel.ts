import * as XLSX from 'xlsx';

export interface ExtractedTableData {
  rows: string[][];
  headers: string[];
  pageCount: number;
  totalCells: number;
}

export async function extractPdfToTable(file: File | Blob): Promise<ExtractedTableData> {
  const pdfjsLib = await import('pdfjs-dist');
  if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;

  const allRows: string[][] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    // Group text items by vertical position (Y coordinate rounded to tolerance)
    const itemsByY: { y: number; x: number; text: string }[] = [];

    for (const item of textContent.items as any[]) {
      if (!item.str || !item.str.trim()) continue;
      // transform: [scaleX, skewY, skewX, scaleY, transX, transY]
      const x = item.transform[4];
      const y = Math.round(item.transform[5]);
      itemsByY.push({ x, y, text: item.str.trim() });
    }

    // Sort by Y descending (top of page first), then X ascending (left to right)
    itemsByY.sort((a, b) => {
      const yDiff = b.y - a.y;
      if (Math.abs(yDiff) > 6) return yDiff; // Different line
      return a.x - b.x; // Same line, sort left to right
    });

    // Group into lines
    let currentLineY: number | null = null;
    let currentLineCells: { x: number; text: string }[] = [];

    for (const item of itemsByY) {
      if (currentLineY === null || Math.abs(item.y - currentLineY) > 6) {
        if (currentLineCells.length > 0) {
          allRows.push(currentLineCells.map((c) => c.text));
        }
        currentLineY = item.y;
        currentLineCells = [item];
      } else {
        currentLineCells.push(item);
      }
    }
    if (currentLineCells.length > 0) {
      allRows.push(currentLineCells.map((c) => c.text));
    }
  }

  // Normalize column count
  const maxCols = allRows.reduce((max, row) => Math.max(max, row.length), 0);
  const normalizedRows = allRows.map((row) => {
    const filled = [...row];
    while (filled.length < maxCols) filled.push('');
    return filled;
  });

  const headers = normalizedRows.length > 0
    ? normalizedRows[0]
    : Array.from({ length: maxCols }, (_, i) => `Column ${i + 1}`);

  const dataRows = normalizedRows.length > 1 ? normalizedRows.slice(1) : normalizedRows;

  return {
    headers,
    rows: dataRows,
    pageCount: numPages,
    totalCells: normalizedRows.reduce((acc, r) => acc + r.length, 0)
  };
}

export function exportTableToXlsx(headers: string[], rows: string[][], sheetName: string = 'PDF_Data'): Blob {
  const wsData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

export function exportTableToCsv(headers: string[], rows: string[][]): Blob {
  const wsData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const csv = XLSX.utils.sheet_to_csv(ws);
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
}
