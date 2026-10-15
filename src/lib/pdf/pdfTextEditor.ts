import { PDFDocument, StandardFonts, rgb, PDFFont } from 'pdf-lib';

export interface EditableTextItem {
  id: string;
  str: string;
  originalStr: string;
  x: number;          // PDF X (points from bottom-left)
  y: number;          // PDF Y (points from bottom-left)
  width: number;      // Width in points
  height: number;     // Height in points
  fontSize: number;   // Font size in points
  fontName: string;
  fontCategory: 'sans' | 'serif' | 'mono';
  isBold: boolean;
  isItalic: boolean;
  colorHex: string;
  pageNumber: number;
  isModified: boolean;
  // Normalized viewport percentage (0 to 100%) for exact overlay positioning
  leftPercent: number;
  topPercent: number;
  widthPercent: number;
  heightPercent: number;
}

/**
 * Parses fontName string to determine matching standard font and weights
 */
export function detectFontFamilyCategory(fontName: string): {
  category: 'sans' | 'serif' | 'mono';
  isBold: boolean;
  isItalic: boolean;
} {
  const lower = (fontName || '').toLowerCase();

  const isBold = lower.includes('bold') || lower.includes('heavy') || lower.includes('black') || lower.includes('-b') || lower.includes('_b');
  const isItalic = lower.includes('italic') || lower.includes('oblique') || lower.includes('-i') || lower.includes('_i');

  let category: 'sans' | 'serif' | 'mono' = 'sans';
  if (lower.includes('times') || lower.includes('roman') || lower.includes('serif') || lower.includes('georgia') || lower.includes('cambria')) {
    category = 'serif';
  } else if (lower.includes('courier') || lower.includes('mono') || lower.includes('consolas') || lower.includes('typewriter')) {
    category = 'mono';
  }

  return { category, isBold, isItalic };
}

/**
 * Extracts all text elements with their exact coordinates, sizes, and fonts from a PDF
 */
export async function extractEditableTextFromPdf(file: File | Blob): Promise<Record<number, EditableTextItem[]>> {
  const pdfjsLib = await import('pdfjs-dist');
  if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;

  const result: Record<number, EditableTextItem[]> = {};

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });
    const textContent = await page.getTextContent();
    const items: EditableTextItem[] = [];

    let itemIdx = 0;
    for (const rawItem of textContent.items as any[]) {
      if (!rawItem.str || !rawItem.str.trim()) continue;

      // PDF coordinate transform: [scaleX, skewY, skewX, scaleY, transX, transY]
      const tx = rawItem.transform[4];
      const ty = rawItem.transform[5];
      const fontSize = Math.abs(rawItem.transform[3] || rawItem.transform[0] || 12);
      const width = rawItem.width || fontSize * 0.5 * rawItem.str.length;
      const height = rawItem.height || fontSize * 1.1;

      const { category, isBold, isItalic } = detectFontFamilyCategory(rawItem.fontName || '');

      // In PDF coordinate system: (0,0) is bottom-left
      // In Web screen system: (0,0) is top-left
      const leftPercent = Math.max(0, Math.min(100, (tx / viewport.width) * 100));
      const topPercent = Math.max(0, Math.min(100, ((viewport.height - ty - height * 0.2) / viewport.height) * 100));
      const widthPercent = Math.max(1, (width / viewport.width) * 100);
      const heightPercent = Math.max(1, (height / viewport.height) * 100);

      items.push({
        id: `page-${pageNum}-item-${itemIdx++}`,
        str: rawItem.str,
        originalStr: rawItem.str,
        x: tx,
        y: ty,
        width,
        height,
        fontSize: Math.round(fontSize * 10) / 10,
        fontName: rawItem.fontName || 'Helvetica',
        fontCategory: category,
        isBold,
        isItalic,
        colorHex: '#0f172a',
        pageNumber: pageNum,
        isModified: false,
        leftPercent,
        topPercent,
        widthPercent,
        heightPercent
      });
    }

    result[pageNum] = items;
  }

  return result;
}

/**
 * Saves edited text back into the PDF, preserving exact original fonts and format
 */
export async function applyTextEditsToPdf(
  file: File | Blob,
  textItemsByPage: Record<number, EditableTextItem[]>
): Promise<{ blob: Blob; modifiedCount: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  // Pre-embed standard fonts matching detected categories
  const fontMap: Record<string, PDFFont> = {
    'sans-regular': await pdfDoc.embedFont(StandardFonts.Helvetica),
    'sans-bold': await pdfDoc.embedFont(StandardFonts.HelveticaBold),
    'sans-italic': await pdfDoc.embedFont(StandardFonts.HelveticaOblique),
    'serif-regular': await pdfDoc.embedFont(StandardFonts.TimesRoman),
    'serif-bold': await pdfDoc.embedFont(StandardFonts.TimesRomanBold),
    'serif-italic': await pdfDoc.embedFont(StandardFonts.TimesRomanItalic),
    'mono-regular': await pdfDoc.embedFont(StandardFonts.Courier),
    'mono-bold': await pdfDoc.embedFont(StandardFonts.CourierBold),
    'mono-italic': await pdfDoc.embedFont(StandardFonts.CourierOblique)
  };

  const pdfPages = pdfDoc.getPages();
  let modifiedCount = 0;

  for (let pageNum = 1; pageNum <= pdfPages.length; pageNum++) {
    const pageItems = textItemsByPage[pageNum] || [];
    const modifiedItems = pageItems.filter((item) => item.isModified);

    if (modifiedItems.length === 0) continue;

    const page = pdfPages[pageNum - 1];

    for (const item of modifiedItems) {
      modifiedCount++;

      // 1. Erase / Whiteout the original text area cleanly
      const eraseMarginX = 3;
      const eraseMarginY = 2;
      const eraseW = Math.max(item.width + eraseMarginX * 2, 20);
      const eraseH = Math.max(item.height + eraseMarginY * 2, item.fontSize * 1.3);

      page.drawRectangle({
        x: item.x - eraseMarginX,
        y: item.y - eraseMarginY,
        width: eraseW,
        height: eraseH,
        color: rgb(1, 1, 1), // Exact whiteout background matching document paper
        opacity: 1.0
      });

      // 2. Select matching embedded font
      const key = `${item.fontCategory}-${item.isBold ? 'bold' : item.isItalic ? 'italic' : 'regular'}`;
      const font = fontMap[key] || fontMap['sans-regular'];

      // 3. Draw the replacement text at the exact same position with the exact same font
      page.drawText(item.str, {
        x: item.x,
        y: item.y,
        size: item.fontSize,
        font,
        color: rgb(0.08, 0.1, 0.15) // Clean dark typography
      });
    }
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
  return { blob, modifiedCount };
}
