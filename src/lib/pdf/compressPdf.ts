import { PDFDocument } from 'pdf-lib';

export interface PdfCompressResult {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  reductionPercentage: number;
  isReduced: boolean;
  pageCount: number;
}

export async function compressPdf(file: File): Promise<PdfCompressResult> {
  const arrayBuffer = await file.arrayBuffer();
  const originalSize = file.size;

  // Load document and strip extraneous metadata
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  pdfDoc.setTitle('');
  pdfDoc.setAuthor('');
  pdfDoc.setSubject('');
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer('PixelKit Browser PDF Optimizer');
  pdfDoc.setCreator('PixelKit');

  // Save with stream object deduplication and compact structure
  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  const compressedSize = pdfBytes.byteLength;

  const diff = originalSize - compressedSize;
  const isReduced = diff > 0;
  const reductionPercentage = originalSize > 0 && isReduced ? Math.round((diff / originalSize) * 100) : 0;

  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });

  return {
    blob,
    originalSize,
    compressedSize,
    reductionPercentage,
    isReduced,
    pageCount: pdfDoc.getPageCount()
  };
}
