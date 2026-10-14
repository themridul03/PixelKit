import { PDFDocument, degrees } from 'pdf-lib';

export interface PageOrganizationItem {
  originalIndex: number; // 0-based
  rotation: number; // 0, 90, 180, 270
}

export async function organizePdfPages(
  file: File,
  orderedItems: PageOrganizationItem[]
): Promise<{ blob: Blob; pageCount: number }> {
  if (orderedItems.length === 0) {
    throw new Error('A PDF document must have at least one page');
  }

  const arrayBuffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer);
  const newDoc = await PDFDocument.create();

  for (const item of orderedItems) {
    const [copiedPage] = await newDoc.copyPages(srcDoc, [item.originalIndex]);
    if (item.rotation) {
      const currentRotation = copiedPage.getRotation().angle;
      copiedPage.setRotation(degrees((currentRotation + item.rotation) % 360));
    }
    newDoc.addPage(copiedPage);
  }

  const pdfBytes = await newDoc.save();
  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });

  return {
    blob,
    pageCount: newDoc.getPageCount()
  };
}
