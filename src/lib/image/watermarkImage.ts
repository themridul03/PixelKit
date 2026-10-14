import { loadImage, canvasToBlob } from './imageCore';
import { replaceExtension } from '../utils/format';

export type WatermarkPosition =
  | 'center'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'tile';

export interface WatermarkOptions {
  type: 'text' | 'image';
  text?: string;
  watermarkImageFile?: File;
  position: WatermarkPosition;
  opacity: number; // 0.1 to 1.0
  fontSize?: number; // in pixels
  color?: string; // hex
  rotation?: number; // degrees (e.g. -45)
  format?: 'image/jpeg' | 'image/png';
}

export async function watermarkImage(
  file: File,
  options: WatermarkOptions
): Promise<{ blob: Blob; filename: string }> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Draw original image
  ctx.drawImage(img, 0, 0);

  ctx.save();
  ctx.globalAlpha = options.opacity;

  if (options.type === 'text' && options.text) {
    const text = options.text;
    const fontSize = options.fontSize || Math.max(24, Math.round(canvas.width / 25));
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillStyle = options.color || '#ffffff';
    ctx.textBaseline = 'middle';

    if (options.position === 'tile') {
      const textMetrics = ctx.measureText(text);
      const stepX = textMetrics.width + 120;
      const stepY = fontSize * 4;

      ctx.rotate((-30 * Math.PI) / 180);
      for (let x = -canvas.width; x < canvas.width * 2; x += stepX) {
        for (let y = -canvas.height; y < canvas.height * 2; y += stepY) {
          ctx.fillText(text, x, y);
        }
      }
    } else {
      let x = canvas.width / 2;
      let y = canvas.height / 2;
      ctx.textAlign = 'center';

      if (options.position === 'top-left') {
        x = 40;
        y = 40 + fontSize;
        ctx.textAlign = 'left';
      } else if (options.position === 'top-right') {
        x = canvas.width - 40;
        y = 40 + fontSize;
        ctx.textAlign = 'right';
      } else if (options.position === 'bottom-left') {
        x = 40;
        y = canvas.height - 40;
        ctx.textAlign = 'left';
      } else if (options.position === 'bottom-right') {
        x = canvas.width - 40;
        y = canvas.height - 40;
        ctx.textAlign = 'right';
      }

      ctx.fillText(text, x, y);
    }
  } else if (options.type === 'image' && options.watermarkImageFile) {
    const markImg = await loadImage(options.watermarkImageFile);
    const maxMarkW = canvas.width * 0.25;
    const markRatio = maxMarkW / (markImg.naturalWidth || markImg.width);
    const markW = (markImg.naturalWidth || markImg.width) * markRatio;
    const markH = (markImg.naturalHeight || markImg.height) * markRatio;

    let x = (canvas.width - markW) / 2;
    let y = (canvas.height - markH) / 2;

    if (options.position === 'top-left') {
      x = 30;
      y = 30;
    } else if (options.position === 'top-right') {
      x = canvas.width - markW - 30;
      y = 30;
    } else if (options.position === 'bottom-left') {
      x = 30;
      y = canvas.height - markH - 30;
    } else if (options.position === 'bottom-right') {
      x = canvas.width - markW - 30;
      y = canvas.height - markH - 30;
    }

    ctx.drawImage(markImg, x, y, markW, markH);
  }

  ctx.restore();

  const format = options.format || 'image/jpeg';
  const blob = await canvasToBlob(canvas, format, 0.92);
  const ext = format === 'image/png' ? 'png' : 'jpg';
  const filename = replaceExtension(file.name, `watermarked.${ext}`);

  return { blob, filename };
}
