import { loadImage, canvasToBlob } from './imageCore';
import { replaceExtension } from '../utils/format';

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CropOptions {
  rect: CropRect;
  rotation?: number; // 0, 90, 180, 270
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
  quality?: number;
}

export async function cropImage(file: File, options: CropOptions): Promise<{ blob: Blob; filename: string }> {
  const img = await loadImage(file);
  const { rect, rotation = 0, flipHorizontal = false, flipVertical = false } = options;

  // 1. Create a canvas for the crop region
  const cropCanvas = document.createElement('canvas');
  cropCanvas.width = Math.max(1, Math.round(rect.width));
  cropCanvas.height = Math.max(1, Math.round(rect.height));
  const cropCtx = cropCanvas.getContext('2d');
  if (!cropCtx) throw new Error('Could not get canvas context for cropping');

  cropCtx.imageSmoothingEnabled = true;
  cropCtx.imageSmoothingQuality = 'high';

  cropCtx.drawImage(
    img,
    rect.x,
    rect.y,
    rect.width,
    rect.height,
    0,
    0,
    cropCanvas.width,
    cropCanvas.height
  );

  // 2. Apply rotation/flipping if needed
  let finalCanvas = cropCanvas;
  if (rotation !== 0 || flipHorizontal || flipVertical) {
    const rotCanvas = document.createElement('canvas');
    const isSideways = rotation === 90 || rotation === 270;
    rotCanvas.width = isSideways ? cropCanvas.height : cropCanvas.width;
    rotCanvas.height = isSideways ? cropCanvas.width : cropCanvas.height;

    const rotCtx = rotCanvas.getContext('2d');
    if (!rotCtx) throw new Error('Could not get canvas context for transform');

    rotCtx.translate(rotCanvas.width / 2, rotCanvas.height / 2);
    rotCtx.rotate((rotation * Math.PI) / 180);
    rotCtx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
    rotCtx.drawImage(cropCanvas, -cropCanvas.width / 2, -cropCanvas.height / 2);
    finalCanvas = rotCanvas;
  }

  const format = options.format || 'image/jpeg';
  const quality = options.quality ?? 0.92;
  const blob = await canvasToBlob(finalCanvas, format, quality);

  const extMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp'
  };
  const filename = replaceExtension(file.name, `cropped.${extMap[format] || 'jpg'}`);

  return { blob, filename };
}
