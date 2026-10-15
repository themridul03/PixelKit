import { loadImage, canvasToBlob } from './imageCore';
import { replaceExtension } from '../utils/format';

export interface PassportPreset {
  id: string;
  name: string;
  country: string;
  widthMm: number;
  heightMm: number;
  pixelWidth: number;
  pixelHeight: number;
  description: string;
}

export const PASSPORT_PRESETS: PassportPreset[] = [
  {
    id: 'us-passport',
    name: 'United States Passport / Visa',
    country: 'United States',
    widthMm: 51,
    heightMm: 51,
    pixelWidth: 600,
    pixelHeight: 600,
    description: '2 x 2 inches (51 x 51 mm) at 300 DPI. White or off-white background.'
  },
  {
    id: 'schengen-visa',
    name: 'Schengen / European Union Visa',
    country: 'Schengen Area',
    widthMm: 35,
    heightMm: 45,
    pixelWidth: 413,
    pixelHeight: 531,
    description: '35 x 45 mm at 300 DPI. Light grey or light blue background.'
  },
  {
    id: 'uk-passport',
    name: 'United Kingdom Passport',
    country: 'United Kingdom',
    widthMm: 35,
    heightMm: 45,
    pixelWidth: 413,
    pixelHeight: 531,
    description: '35 x 45 mm. Plain light cream or light grey background.'
  },
  {
    id: 'india-passport',
    name: 'India Passport / OCI',
    country: 'India',
    widthMm: 51,
    heightMm: 51,
    pixelWidth: 600,
    pixelHeight: 600,
    description: '2 x 2 inches (51 x 51 mm) or 35 x 45 mm. White plain background.'
  },
  {
    id: 'canada-passport',
    name: 'Canada Passport',
    country: 'Canada',
    widthMm: 50,
    heightMm: 70,
    pixelWidth: 591,
    pixelHeight: 827,
    description: '50 x 70 mm. Plain white or light-coloured background.'
  },
  {
    id: 'australia-passport',
    name: 'Australia Passport',
    country: 'Australia',
    widthMm: 35,
    heightMm: 45,
    pixelWidth: 413,
    pixelHeight: 531,
    description: '35 x 45 mm. High quality white or light grey background.'
  }
];

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PassportPhotoOptions {
  preset: PassportPreset;
  cropRect: CropRect;
  generatePrintSheet: boolean; // 4x6 inch paper with multiple copies
  copiesCount?: number; // e.g. 2, 4, 6, 8
  backgroundColor?: string;
  brightness?: number; // -50 to 50
  contrast?: number;   // -50 to 50
  saturation?: number; // -50 to 50
}

/**
 * Smart automatic face / portrait framing detection.
 * Analyzes skin tone centroids and golden biometric portrait ratios.
 */
export function detectAutoPortraitCrop(
  img: HTMLImageElement,
  targetAspect: number // width / height
): CropRect {
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;

  let faceCenterX = w / 2;
  let faceCenterY = h * 0.36;

  // Try quick canvas sampling for skin tone centroid in upper 75% of image
  try {
    const thumbCanvas = document.createElement('canvas');
    const sampleW = 120;
    const sampleH = Math.round((h / w) * sampleW);
    thumbCanvas.width = sampleW;
    thumbCanvas.height = sampleH;
    const tCtx = thumbCanvas.getContext('2d');

    if (tCtx) {
      tCtx.drawImage(img, 0, 0, sampleW, sampleH);
      const imgData = tCtx.getImageData(0, 0, sampleW, sampleH).data;

      let skinPixelCount = 0;
      let totalX = 0;
      let totalY = 0;

      // Scan rows from 10% to 75% of height (where human faces reside)
      const startY = Math.floor(sampleH * 0.1);
      const endY = Math.floor(sampleH * 0.75);

      for (let y = startY; y < endY; y += 2) {
        for (let x = 0; x < sampleW; x += 2) {
          const idx = (y * sampleW + x) * 4;
          const r = imgData[idx];
          const g = imgData[idx + 1];
          const b = imgData[idx + 2];

          // Generalized skin tone heuristic in RGB
          const isSkin =
            r > 60 &&
            g > 40 &&
            b > 20 &&
            r > g &&
            r > b &&
            Math.abs(r - g) > 12 &&
            r - b > 12;

          if (isSkin) {
            totalX += x;
            totalY += y;
            skinPixelCount++;
          }
        }
      }

      if (skinPixelCount > 35) {
        const sampleCentroidX = totalX / skinPixelCount;
        const sampleCentroidY = totalY / skinPixelCount;
        faceCenterX = (sampleCentroidX / sampleW) * w;
        faceCenterY = (sampleCentroidY / sampleH) * h;
      }
    }
  } catch (e) {
    // Canvas security or memory fallback: use geometric golden portrait ratio
  }

  // Calculate box dimensions that honor targetAspect
  // Typical passport portrait crop needs to cover head, neck, and shoulder tops (~65-75% of image height)
  let boxH = Math.min(h, Math.round(Math.min(w, h) * 0.75));
  let boxW = Math.round(boxH * targetAspect);

  if (boxW > w) {
    boxW = Math.round(w * 0.95);
    boxH = Math.round(boxW / targetAspect);
  }

  // Anchor face so centroid is at approximately 38% from top of the crop box
  let boxX = Math.round(faceCenterX - boxW / 2);
  let boxY = Math.round(faceCenterY - boxH * 0.38);

  // Bounds checks
  if (boxX < 0) boxX = 0;
  if (boxY < 0) boxY = 0;
  if (boxX + boxW > w) boxX = Math.max(0, w - boxW);
  if (boxY + boxH > h) boxY = Math.max(0, h - boxH);

  return {
    x: boxX,
    y: boxY,
    width: boxW,
    height: boxH
  };
}

export async function generatePassportPhoto(
  file: File,
  options: PassportPhotoOptions
): Promise<{ singleBlob: Blob; singleDataUrl: string; sheetBlob?: Blob; sheetDataUrl?: string; filename: string }> {
  const img = await loadImage(file);
  const { preset, cropRect } = options;

  // 1. Render single photo canvas
  const singleCanvas = document.createElement('canvas');
  singleCanvas.width = preset.pixelWidth;
  singleCanvas.height = preset.pixelHeight;
  const sCtx = singleCanvas.getContext('2d');
  if (!sCtx) throw new Error('Could not get canvas context');

  // Fill background color
  sCtx.fillStyle = options.backgroundColor || '#ffffff';
  sCtx.fillRect(0, 0, singleCanvas.width, singleCanvas.height);

  // Apply optional CSS filters for lighting & contrast
  const b = (options.brightness || 0) + 100;
  const c = (options.contrast || 0) + 100;
  const s = (options.saturation || 0) + 100;
  sCtx.filter = `brightness(${b}%) contrast(${c}%) saturate(${s}%)`;

  sCtx.drawImage(
    img,
    cropRect.x,
    cropRect.y,
    cropRect.width,
    cropRect.height,
    0,
    0,
    singleCanvas.width,
    singleCanvas.height
  );
  sCtx.filter = 'none';

  const singleBlob = await canvasToBlob(singleCanvas, 'image/jpeg', 0.95);
  const singleDataUrl = singleCanvas.toDataURL('image/jpeg', 0.95);

  let sheetBlob: Blob | undefined;
  let sheetDataUrl: string | undefined;

  if (options.generatePrintSheet) {
    // 4x6 inches at 300 DPI = 1800 x 1200 px (landscape)
    const sheetCanvas = document.createElement('canvas');
    sheetCanvas.width = 1800;
    sheetCanvas.height = 1200;
    const sheetCtx = sheetCanvas.getContext('2d');
    if (sheetCtx) {
      sheetCtx.fillStyle = '#ffffff';
      sheetCtx.fillRect(0, 0, sheetCanvas.width, sheetCanvas.height);

      // Header watermark info
      sheetCtx.fillStyle = '#94a3b8';
      sheetCtx.font = '22px sans-serif';
      sheetCtx.fillText(
        `PixelKit 4x6" Printable Photo Sheet • ${preset.name} (${preset.widthMm}x${preset.heightMm}mm) • 300 DPI`,
        50,
        45
      );

      const marginX = 80;
      const marginY = 80;
      const spacing = 45;
      let curX = marginX;
      let curY = marginY;

      const copies = options.copiesCount || 6;
      for (let i = 0; i < copies; i++) {
        if (curX + preset.pixelWidth > sheetCanvas.width - marginX) {
          curX = marginX;
          curY += preset.pixelHeight + spacing;
        }
        if (curY + preset.pixelHeight > sheetCanvas.height - 40) break;

        // Draw photo
        sheetCtx.drawImage(singleCanvas, curX, curY);

        // Draw light grey cutting guide border
        sheetCtx.strokeStyle = '#cbd5e1';
        sheetCtx.lineWidth = 1.5;
        sheetCtx.strokeRect(curX, curY, preset.pixelWidth, preset.pixelHeight);

        // Draw corner crosshairs for scissor alignment
        const cross = 12;
        sheetCtx.strokeStyle = '#94a3b8';
        sheetCtx.lineWidth = 1;

        // Top-left cross
        sheetCtx.beginPath();
        sheetCtx.moveTo(curX - cross, curY);
        sheetCtx.lineTo(curX, curY);
        sheetCtx.moveTo(curX, curY - cross);
        sheetCtx.lineTo(curX, curY);
        sheetCtx.stroke();

        curX += preset.pixelWidth + spacing;
      }

      sheetBlob = await canvasToBlob(sheetCanvas, 'image/jpeg', 0.95);
      sheetDataUrl = sheetCanvas.toDataURL('image/jpeg', 0.95);
    }
  }

  const filename = replaceExtension(file.name, `passport_${preset.id}.jpg`);
  return { singleBlob, singleDataUrl, sheetBlob, sheetDataUrl, filename };
}
