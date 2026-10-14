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
  }
];

export interface PassportPhotoOptions {
  preset: PassportPreset;
  cropRect: { x: number; y: number; width: number; height: number };
  generatePrintSheet: boolean; // 4x6 inch paper with multiple copies
  copiesCount?: number; // e.g. 2, 4, 6
  backgroundColor?: string;
}

export async function generatePassportPhoto(
  file: File,
  options: PassportPhotoOptions
): Promise<{ singleBlob: Blob; sheetBlob?: Blob; filename: string }> {
  const img = await loadImage(file);
  const { preset, cropRect } = options;

  // 1. Render single photo
  const singleCanvas = document.createElement('canvas');
  singleCanvas.width = preset.pixelWidth;
  singleCanvas.height = preset.pixelHeight;
  const sCtx = singleCanvas.getContext('2d');
  if (!sCtx) throw new Error('Could not get canvas context');

  sCtx.fillStyle = options.backgroundColor || '#ffffff';
  sCtx.fillRect(0, 0, singleCanvas.width, singleCanvas.height);

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

  const singleBlob = await canvasToBlob(singleCanvas, 'image/jpeg', 0.95);

  let sheetBlob: Blob | undefined;
  if (options.generatePrintSheet) {
    // 4x6 inches at 300 DPI = 1200 x 1800 px (portrait) or 1800 x 1200 px (landscape)
    const sheetCanvas = document.createElement('canvas');
    sheetCanvas.width = 1800;
    sheetCanvas.height = 1200;
    const sheetCtx = sheetCanvas.getContext('2d');
    if (sheetCtx) {
      sheetCtx.fillStyle = '#ffffff';
      sheetCtx.fillRect(0, 0, sheetCanvas.width, sheetCanvas.height);

      const margin = 60;
      const spacing = 40;
      let curX = margin;
      let curY = margin;

      const copies = options.copiesCount || 6;
      for (let i = 0; i < copies; i++) {
        if (curX + preset.pixelWidth > sheetCanvas.width - margin) {
          curX = margin;
          curY += preset.pixelHeight + spacing;
        }
        if (curY + preset.pixelHeight > sheetCanvas.height - margin) break;

        // Draw photo
        sheetCtx.drawImage(singleCanvas, curX, curY);

        // Draw light grey cutting guide border
        sheetCtx.strokeStyle = '#d1d5db';
        sheetCtx.lineWidth = 1;
        sheetCtx.strokeRect(curX, curY, preset.pixelWidth, preset.pixelHeight);

        curX += preset.pixelWidth + spacing;
      }

      sheetBlob = await canvasToBlob(sheetCanvas, 'image/jpeg', 0.95);
    }
  }

  const filename = replaceExtension(file.name, `passport_${preset.id}.jpg`);
  return { singleBlob, sheetBlob, filename };
}
