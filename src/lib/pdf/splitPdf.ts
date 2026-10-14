import { PDFDocument } from 'pdf-lib';

export function parsePageRange(rangeStr: string, maxPages: number): number[] {
  const pages = new Set<number>();
  const parts = rangeStr.split(',').map((p) => p.trim());

  for (const part of parts) {
    if (!part) continue;
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        const from = Math.max(1, Math.min(start, end));
        const to = Math.min(maxPages, Math.max(start, end));
        for (let i = from; i <= to; i++) {
          pages.add(i);
        }
      }
    } else {
      const pageNum = parseInt(part, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= maxPages) {
        pages.add(pageNum);
      }
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

export async function splitPdfByRange(
  file: File,
  pageNumbers: number[]
): Promise<{ blob: Blob; pageCount: number }> {
  if (pageNumbers.length === 0) {
    throw new Error('Please select at least one valid page to extract');
  }

  const arrayBuffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer);
  const newDoc = await PDFDocument.create();

  // Convert 1-based page numbers to 0-based indices
  const indices = pageNumbers.map((p) => p - 1);
  const copiedPages = await newDoc.copyPages(srcDoc, indices);
  copiedPages.forEach((page) => newDoc.addPage(page));

  const pdfBytes = await newDoc.save();
  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });

  return {
    blob,
    pageCount: newDoc.getPageCount()
  };
}

export async function splitPdfAllPages(
  file: File
): Promise<{ name: string; blob: Blob }[]> {
  const arrayBuffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer);
  const total = srcDoc.getPageCount();
  const results: { name: string; blob: Blob }[] = [];

  const baseName = file.name.replace(/\.pdf$/i, '');

  for (let i = 0; i < total; i++) {
    const singleDoc = await PDFDocument.create();
    const [page] = await singleDoc.copyPages(srcDoc, [i]);
    singleDoc.addPage(page);
    const bytes = await singleDoc.save();
    results.push({
      name: `${baseName}_page_${i + 1}.pdf`,
      blob: new Blob([bytes as any], { type: 'application/pdf' })
    });
  }

  return results;
}
