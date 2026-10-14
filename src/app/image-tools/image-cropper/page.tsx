'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { FileDropzone, FileItem } from '@/components/upload/FileDropzone';
import { DownloadBar, DownloadItem } from '@/components/download/DownloadBar';
import { getToolById } from '@/config/tools';
import { cropImage, CropRect } from '@/lib/image/cropImage';
import { loadImage } from '@/lib/image/imageCore';
import { RotateCw, FlipHorizontal, FlipVertical, Crop, Sparkles } from 'lucide-react';

export default function ImageCropperPage() {
  const tool = getToolById('image-cropper')!;
  const [files, setFiles] = useState<FileItem[]>([]);
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [imageMeta, setImageMeta] = useState<{ width: number; height: number } | null>(null);
  const [cropBox, setCropBox] = useState<CropRect>({ x: 0, y: 0, width: 400, height: 400 });
  const [aspectPreset, setAspectPreset] = useState<'free' | '1:1' | '4:3' | '16:9' | '9:16'>('free');
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadItems, setDownloadItems] = useState<DownloadItem[]>([]);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (files.length > 0) {
      loadImage(files[0].file).then((img) => {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        setImageMeta({ width: w, height: h });
        // Initial center crop
        const boxSize = Math.round(Math.min(w, h) * 0.8);
        setCropBox({
          x: Math.round((w - boxSize) / 2),
          y: Math.round((h - boxSize) / 2),
          width: boxSize,
          height: boxSize
        });
      });
    }
  }, [files]);

  // Update preview canvas
  useEffect(() => {
    if (!files.length || !imageMeta || !previewCanvasRef.current) return;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    loadImage(files[0].file).then((img) => {
      canvas.width = Math.min(600, imageMeta.width);
      const scale = canvas.width / imageMeta.width;
      canvas.height = imageMeta.height * scale;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw semi-transparent dim overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Clear the crop rectangle
      const scaledX = cropBox.x * scale;
      const scaledY = cropBox.y * scale;
      const scaledW = cropBox.width * scale;
      const scaledH = cropBox.height * scale;

      ctx.clearRect(scaledX, scaledY, scaledW, scaledH);
      ctx.drawImage(
        img,
        cropBox.x,
        cropBox.y,
        cropBox.width,
        cropBox.height,
        scaledX,
        scaledY,
        scaledW,
        scaledH
      );

      // Draw selection border
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.strokeRect(scaledX, scaledY, scaledW, scaledH);
    });
  }, [files, imageMeta, cropBox]);

  const setPresetRatio = (preset: 'free' | '1:1' | '4:3' | '16:9' | '9:16') => {
    setAspectPreset(preset);
    if (!imageMeta) return;
    const w = imageMeta.width;
    const h = imageMeta.height;

    let targetW = cropBox.width;
    let targetH = cropBox.height;

    if (preset === '1:1') {
      const minDim = Math.min(w, h) * 0.7;
      targetW = minDim;
      targetH = minDim;
    } else if (preset === '4:3') {
      targetW = Math.min(w, h * (4 / 3)) * 0.7;
      targetH = targetW * (3 / 4);
    } else if (preset === '16:9') {
      targetW = Math.min(w, h * (16 / 9)) * 0.7;
      targetH = targetW * (9 / 16);
    } else if (preset === '9:16') {
      targetH = Math.min(h, w * (16 / 9)) * 0.7;
      targetW = targetH * (9 / 16);
    }

    setCropBox({
      x: Math.max(0, Math.round((w - targetW) / 2)),
      y: Math.max(0, Math.round((h - targetH) / 2)),
      width: Math.round(targetW),
      height: Math.round(targetH)
    });
  };

  const handleApplyCrop = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    try {
      const res = await cropImage(files[0].file, {
        rect: cropBox,
        rotation,
        flipHorizontal: flipH,
        flipVertical: flipV,
        format: 'image/jpeg'
      });
      setDownloadItems([
        {
          name: res.filename,
          blob: res.blob,
          originalSize: files[0].file.size
        }
      ]);
    } catch (err: any) {
      alert(`Error during crop: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileDropzone
          acceptedFormats={['image/jpeg', 'image/png', 'image/webp']}
          maxFileSizeMB={40}
          multiple={false}
          files={files}
          onFilesChange={(newFiles) => {
            setFiles(newFiles);
            setDownloadItems([]);
          }}
          title="Upload image to crop and transform"
          subtitle="Supports JPG, PNG, and WebP"
        />

        {files.length > 0 && imageMeta && downloadItems.length === 0 && (
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-base">
                <Crop className="w-5 h-5 text-blue-600" />
                <span>Crop Area &amp; Transform</span>
              </div>

              {/* Rotate & Flip Tools */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Rotate 90° ({rotation}°)</span>
                </button>
                <button
                  onClick={() => setFlipH(!flipH)}
                  className={`p-1.5 rounded-lg border text-xs ${
                    flipH ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                  title="Flip horizontally"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setFlipV(!flipV)}
                  className={`p-1.5 rounded-lg border text-xs ${
                    flipV ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                  title="Flip vertically"
                >
                  <FlipVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Aspect Ratio Presets */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Aspect Ratio:</span>
              {(['free', '1:1', '4:3', '16:9', '9:16'] as const).map((preset) => (
                <button
                  key={preset}
                  onClick={() => setPresetRatio(preset)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                    aspectPreset === preset
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                  }`}
                >
                  {preset.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Canvas Preview Area */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <canvas
                ref={previewCanvasRef}
                className="max-w-full rounded-lg shadow-sm border border-slate-300 dark:border-slate-700"
              />
              <p className="text-xs text-slate-500 mt-3">
                Selected area: {cropBox.width} × {cropBox.height} px (Original: {imageMeta.width} × {imageMeta.height} px)
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleApplyCrop}
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isProcessing ? 'Processing...' : 'Apply Crop & Export'}</span>
              </button>
            </div>
          </div>
        )}

        <DownloadBar
          items={downloadItems}
          onReset={() => {
            setFiles([]);
            setDownloadItems([]);
          }}
          successTitle="Image Cropped Successfully!"
        />
      </div>
    </ToolLayout>
  );
}
