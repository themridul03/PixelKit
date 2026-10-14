import { canvasToBlob } from '../image/imageCore';

export interface RenderedPdfPage {
  pageNumber: number;
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
}

export interface PdfToImageOptions {
  scale?: number; // 1 = 72-150 DPI preview, 2 = 300 DPI high-res
  format?: 'image/jpeg' | 'image/png';
  quality?: number;
  pages?: number[]; // empty = all pages
  onProgress?: (current: number, total: number) => void;
}

export async function convertPdfToImages(
  file: File | Blob,
  options: PdfToImageOptions = {}
): Promise<RenderedPdfPage[]> {
  // Dynamically import pdfjs-dist in the browser
  const pdfjsLib = await import('pdfjs-dist');

  if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
  }

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  const targetPages =
    options.pages && options.pages.length > 0
      ? options.pages.filter((p) => p >= 1 && p <= numPages)
      : Array.from({ length: numPages }, (_, i) => i + 1);

  const results: RenderedPdfPage[] = [];
  const scale = options.scale || 1.5;
  const format = options.format || 'image/jpeg';
  const quality = options.quality ?? 0.9;

  for (let idx = 0; idx < targetPages.length; idx++) {
    const pageNum = targetPages[idx];
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    if (format === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };

    await page.render(renderContext).promise;

    const blob = await canvasToBlob(canvas, format, quality);
    const dataUrl = canvas.toDataURL(format, quality);

    results.push({
      pageNumber: pageNum,
      blob,
      dataUrl,
      width: viewport.width,
      height: viewport.height
    });

    if (options.onProgress) {
      options.onProgress(idx + 1, targetPages.length);
    }
  }

  return results;
}
