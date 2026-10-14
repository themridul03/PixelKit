import { loadImage, imageToCanvas, canvasToBlob } from './imageCore';
import { replaceExtension } from '../utils/format';

export interface ResizeOptions {
  width: number;
  height: number;
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
  quality?: number;
  fitMode?: 'contain' | 'cover' | 'stretch';
  backgroundColor?: string;
}

export interface ResizeResult {
  blob: Blob;
  outputFilename: string;
  width: number;
  height: number;
  fileSize: number;
}

export async function resizeImage(
  file: File,
  options: ResizeOptions
): Promise<ResizeResult> {
  const img = await loadImage(file);
  const origW = img.naturalWidth || img.width;
  const origH = img.naturalHeight || img.height;

  const targetW = Math.max(1, Math.round(options.width));
  const targetH = Math.max(1, Math.round(options.height));

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const format = options.format || 'image/jpeg';
  const quality = options.quality ?? 0.9;

  if (format === 'image/jpeg' || options.backgroundColor) {
    ctx.fillStyle = options.backgroundColor || '#ffffff';
    ctx.fillRect(0, 0, targetW, targetH);
  }

  const fitMode = options.fitMode || 'stretch';

  if (fitMode === 'stretch') {
    ctx.drawImage(img, 0, 0, targetW, targetH);
  } else if (fitMode === 'contain') {
    const scale = Math.min(targetW / origW, targetH / origH);
    const nw = origW * scale;
    const nh = origH * scale;
    const dx = (targetW - nw) / 2;
    const dy = (targetH - nh) / 2;
    ctx.drawImage(img, dx, dy, nw, nh);
  } else if (fitMode === 'cover') {
    const scale = Math.max(targetW / origW, targetH / origH);
    const nw = origW * scale;
    const nh = origH * scale;
    const dx = (targetW - nw) / 2;
    const dy = (targetH - nh) / 2;
    ctx.drawImage(img, dx, dy, nw, nh);
  }

  const blob = await canvasToBlob(canvas, format, quality);

  const extMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp'
  };
  const targetExt = extMap[format] || 'jpg';
  const outputFilename = replaceExtension(file.name, `resized_${targetW}x${targetH}.${targetExt}`);

  return {
    blob,
    outputFilename,
    width: targetW,
    height: targetH,
    fileSize: blob.size
  };
}
