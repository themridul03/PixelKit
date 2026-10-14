import { PDFDocument, PageSizes, rgb, StandardFonts } from 'pdf-lib';
import { loadImage, imageToCanvas, canvasToBlob } from '../image/imageCore';

export interface ImageToPdfOptions {
  pageSize: 'a4' | 'letter' | 'a3' | 'fit';
  orientation: 'portrait' | 'landscape';
  margin: 'none' | 'small' | 'medium' | 'large';
  addPageNumbers?: boolean;
  imageQuality?: number;
}

export async function convertImagesToPdf(
  files: File[],
  options: ImageToPdfOptions
): Promise<{ blob: Blob; pageCount: number; fileSize: number }> {
  if (files.length === 0) {
    throw new Error('At least one image is required to generate a PDF');
  }

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const marginMap = {
    none: 0,
    small: 18,
    medium: 36,
    large: 54
  };
  const marginPt = marginMap[options.margin] || 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const imgEl = await loadImage(file);
    const origW = imgEl.naturalWidth || imgEl.width;
    const origH = imgEl.naturalHeight || imgEl.height;

    // Convert to JPEG blob for high efficiency embedding in PDF
    const canvas = imageToCanvas(imgEl);
    const jpegBlob = await canvasToBlob(canvas, 'image/jpeg', options.imageQuality ?? 0.88);
    const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
    const embeddedImg = await pdfDoc.embedJpg(jpegBytes);

    let pageW = 0;
    let pageH = 0;

    if (options.pageSize === 'fit') {
      pageW = origW;
      pageH = origH;
    } else {
      let baseSize = PageSizes.A4;
      if (options.pageSize === 'letter') baseSize = PageSizes.Letter;
      else if (options.pageSize === 'a3') baseSize = PageSizes.A3;

      if (options.orientation === 'landscape') {
        pageW = baseSize[1];
        pageH = baseSize[0];
      } else {
        pageW = baseSize[0];
        pageH = baseSize[1];
      }
    }

    const page = pdfDoc.addPage([pageW, pageH]);

    // Available drawing area
    const availW = Math.max(10, pageW - marginPt * 2);
    const availH = Math.max(10, pageH - marginPt * 2);

    // Fit image inside available area preserving aspect ratio
    const scale = Math.min(availW / origW, availH / origH);
    const drawW = origW * scale;
    const drawH = origH * scale;
    const drawX = marginPt + (availW - drawW) / 2;
    const drawY = marginPt + (availH - drawH) / 2;

    page.drawImage(embeddedImg, {
      x: drawX,
      y: drawY,
      width: drawW,
      height: drawH
    });

    if (options.addPageNumbers) {
      const pageText = `${i + 1} / ${files.length}`;
      const textSize = 10;
      const textWidth = font.widthOfTextAtSize(pageText, textSize);
      page.drawText(pageText, {
        x: (pageW - textWidth) / 2,
        y: Math.max(10, marginPt / 2),
        size: textSize,
        font,
        color: rgb(0.4, 0.4, 0.4)
      });
    }
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });

  return {
    blob,
    pageCount: files.length,
    fileSize: blob.size
  };
}
