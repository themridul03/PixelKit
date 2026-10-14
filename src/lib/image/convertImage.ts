import { loadImage, imageToCanvas, canvasToBlob } from './imageCore';
import { replaceExtension } from '../utils/format';

export type TargetImageFormat = 'image/jpeg' | 'image/png' | 'image/webp' | 'base64';

export interface ConvertOptions {
  targetFormat: TargetImageFormat;
  quality?: number;
  backgroundColor?: string;
}

export interface ConvertResult {
  blob?: Blob;
  base64Data?: string;
  outputFilename: string;
  mimeType: string;
  size: number;
}

export async function convertImage(file: File, options: ConvertOptions): Promise<ConvertResult> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // If converting to JPEG or specified background color, fill it first
  if (options.targetFormat === 'image/jpeg' || (options.backgroundColor && options.backgroundColor !== 'transparent')) {
    ctx.fillStyle = options.backgroundColor || '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0);

  if (options.targetFormat === 'base64') {
    const dataUrl = canvas.toDataURL('image/png');
    return {
      base64Data: dataUrl,
      outputFilename: replaceExtension(file.name, 'txt'),
      mimeType: 'text/plain',
      size: dataUrl.length
    };
  }

  const quality = options.quality ?? 0.92;
  const blob = await canvasToBlob(canvas, options.targetFormat, quality);

  const extMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp'
  };
  const ext = extMap[options.targetFormat] || 'jpg';
  const outputFilename = replaceExtension(file.name, ext);

  return {
    blob,
    outputFilename,
    mimeType: options.targetFormat,
    size: blob.size
  };
}
