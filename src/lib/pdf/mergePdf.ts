import { PDFDocument } from 'pdf-lib';

export async function mergePdfs(files: File[]): Promise<{ blob: Blob; pageCount: number; size: number }> {
  if (files.length < 2) {
    throw new Error('Please select at least 2 PDF files to merge');
  }

  const mergedDoc = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const doc = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedDoc.copyPages(doc, doc.getPageIndices());
    copiedPages.forEach((page) => mergedDoc.addPage(page));
  }

  const pdfBytes = await mergedDoc.save();
  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });

  return {
    blob,
    pageCount: mergedDoc.getPageCount(),
    size: blob.size
  };
}
