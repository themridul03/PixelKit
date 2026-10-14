import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

export interface PdfWatermarkOptions {
  text: string;
  fontSize?: number;
  opacity?: number; // 0.1 to 1.0
  rotation?: number; // e.g. 45
  color?: { r: number; g: number; b: number };
}

export async function addWatermarkToPdf(
  file: File,
  options: PdfWatermarkOptions
): Promise<{ blob: Blob; pageCount: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pages = pdfDoc.getPages();
  const text = options.text || 'CONFIDENTIAL';
  const fontSize = options.fontSize || 48;
  const opacity = options.opacity ?? 0.25;
  const rotationAngle = options.rotation ?? 45;
  const col = options.color || { r: 0.8, g: 0.1, b: 0.1 };

  for (const page of pages) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    page.drawText(text, {
      x: (width - textWidth) / 2,
      y: (height - textHeight) / 2,
      size: fontSize,
      font,
      color: rgb(col.r, col.g, col.b),
      opacity: opacity,
      rotate: degrees(rotationAngle)
    });
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });

  return {
    blob,
    pageCount: pages.length
  };
}
