import { loadImage, imageToCanvas, canvasToBlob } from './imageCore';
import { replaceExtension } from '../utils/format';

export interface CompressOptions {
  quality: number; // 0.1 to 1.0
  format?: 'image/jpeg' | 'image/webp' | 'image/png';
  maxWidth?: number;
  maxHeight?: number;
}

export interface CompressResult {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  reductionPercentage: number;
  originalDimensions: { width: number; height: number };
  outputDimensions: { width: number; height: number };
  outputFilename: string;
}

export async function compressImage(
  file: File,
  options: CompressOptions
): Promise<CompressResult> {
  const img = await loadImage(file);
  const origWidth = img.naturalWidth || img.width;
  const origHeight = img.naturalHeight || img.height;

  let targetWidth = origWidth;
  let targetHeight = origHeight;

  if (options.maxWidth && targetWidth > options.maxWidth) {
    const ratio = options.maxWidth / targetWidth;
    targetWidth = Math.round(targetWidth * ratio);
    targetHeight = Math.round(targetHeight * ratio);
  }

  if (options.maxHeight && targetHeight > options.maxHeight) {
    const ratio = options.maxHeight / targetHeight;
    targetWidth = Math.round(targetWidth * ratio);
    targetHeight = Math.round(targetHeight * ratio);
  }

  const format = options.format || (file.type === 'image/png' ? 'image/png' : 'image/jpeg');
  const canvas = imageToCanvas(img, targetWidth, targetHeight);
  const blob = await canvasToBlob(canvas, format, options.quality);

  const origSize = file.size;
  const newSize = blob.size;
  const diff = origSize - newSize;
  const reductionPercentage = origSize > 0 ? Math.max(0, Math.round((diff / origSize) * 100)) : 0;

  const extMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp'
  };
  const targetExt = extMap[format] || 'jpg';
  const outputFilename = replaceExtension(file.name, `min.${targetExt}`);

  return {
    blob,
    originalSize: origSize,
    compressedSize: newSize,
    reductionPercentage,
    originalDimensions: { width: origWidth, height: origHeight },
    outputDimensions: { width: targetWidth, height: targetHeight },
    outputFilename
  };
}
