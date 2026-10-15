import { PDFDocument, PageSizes, rgb, StandardFonts } from 'pdf-lib';

export interface TextToPdfOptions {
  title?: string;
  fontSize?: number;
  pageSize?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
  lineSpacing?: number;
  margin?: number;
  showPageNumbers?: boolean;
}

export async function convertTextToPdf(
  text: string,
  options: TextToPdfOptions = {}
): Promise<{ blob: Blob; pageCount: number; size: number }> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const fontSize = options.fontSize || 11;
  const lineSpacing = options.lineSpacing || 1.4;
  const lineHeight = fontSize * lineSpacing;
  const margin = options.margin !== undefined ? options.margin : 50;

  let baseDim = options.pageSize === 'letter' ? PageSizes.Letter : PageSizes.A4;
  let pageW = options.orientation === 'landscape' ? baseDim[1] : baseDim[0];
  let pageH = options.orientation === 'landscape' ? baseDim[0] : baseDim[1];

  const contentW = pageW - margin * 2;
  const topMargin = options.title ? margin + 30 : margin;
  const bottomMargin = margin + (options.showPageNumbers !== false ? 25 : 0);
  const usableH = pageH - topMargin - bottomMargin;

  // Split text into wrapped lines
  const rawParagraphs = text.split('\n');
  const wrappedLines: { text: string; isHeading?: boolean }[] = [];

  for (const para of rawParagraphs) {
    if (!para.trim()) {
      wrappedLines.push({ text: '' });
      continue;
    }

    const isH1 = para.startsWith('# ');
    const isH2 = para.startsWith('## ');
    const cleanPara = isH1 ? para.slice(2) : isH2 ? para.slice(3) : para;
    const currentFont = isH1 || isH2 ? boldFont : font;
    const currentSize = isH1 ? fontSize + 4 : isH2 ? fontSize + 2 : fontSize;

    const words = cleanPara.split(/\s+/);
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = currentFont.widthOfTextAtSize(testLine, currentSize);

      if (testWidth <= contentW) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          wrappedLines.push({ text: currentLine, isHeading: isH1 || isH2 });
        }
        currentLine = word;
      }
    }
    if (currentLine) {
      wrappedLines.push({ text: currentLine, isHeading: isH1 || isH2 });
    }
  }

  // Calculate lines per page
  const linesPerPage = Math.max(10, Math.floor(usableH / lineHeight));
  const totalPages = Math.max(1, Math.ceil(wrappedLines.length / linesPerPage));

  for (let p = 0; p < totalPages; p++) {
    const page = pdfDoc.addPage([pageW, pageH]);
    let currentY = pageH - topMargin;

    // Header title on first page or all pages
    if (options.title && p === 0) {
      page.drawText(options.title, {
        x: margin,
        y: pageH - margin,
        size: fontSize + 6,
        font: boldFont,
        color: rgb(0.1, 0.2, 0.5)
      });
      // Header divider line
      page.drawLine({
        start: { x: margin, y: pageH - margin - 8 },
        end: { x: pageW - margin, y: pageH - margin - 8 },
        thickness: 1,
        color: rgb(0.85, 0.88, 0.92)
      });
    }

    const pageLines = wrappedLines.slice(p * linesPerPage, (p + 1) * linesPerPage);

    for (const lineObj of pageLines) {
      if (lineObj.text) {
        const lineFont = lineObj.isHeading ? boldFont : font;
        const lineSz = lineObj.isHeading ? fontSize + 2 : fontSize;
        page.drawText(lineObj.text, {
          x: margin,
          y: currentY,
          size: lineSz,
          font: lineFont,
          color: lineObj.isHeading ? rgb(0.1, 0.15, 0.3) : rgb(0.15, 0.15, 0.15)
        });
      }
      currentY -= lineHeight;
    }

    // Footer page number
    if (options.showPageNumbers !== false) {
      const pageNumberText = `Page ${p + 1} of ${totalPages}`;
      const textWidth = font.widthOfTextAtSize(pageNumberText, 9);
      page.drawText(pageNumberText, {
        x: (pageW - textWidth) / 2,
        y: margin / 2,
        size: 9,
        font,
        color: rgb(0.5, 0.5, 0.5)
      });
    }
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });

  return {
    blob,
    pageCount: totalPages,
    size: blob.size
  };
}
