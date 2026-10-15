'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { FileDropzone, FileItem } from '@/components/upload/FileDropzone';
import { getToolById } from '@/config/tools';
import { cropImage, CropRect } from '@/lib/image/cropImage';
import { loadImage } from '@/lib/image/imageCore';
import { downloadBlob } from '@/lib/utils/download';
import {
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Crop,
  Sparkles,
  Sliders,
  Eye,
  Download,
  CheckCircle2,
  Move,
  ZoomIn,
  RefreshCw,
  Maximize2
} from 'lucide-react';

const SOCIAL_PRESETS = [
  { label: 'Freeform', aspect: 'free', ratio: null },
  { label: '1:1 Square (Insta Post)', aspect: '1:1', ratio: 1 },
  { label: '16:9 Landscape (YouTube)', aspect: '16:9', ratio: 16 / 9 },
  { label: '9:16 Portrait (Reels/Story)', aspect: '9:16', ratio: 9 / 16 },
  { label: '4:3 Standard Photo', aspect: '4:3', ratio: 4 / 3 },
  { label: '3:1 Banner (Twitter/X)', aspect: '3:1', ratio: 3 }
];

export default function ImageCropperPage() {
  const tool = getToolById('image-cropper')!;
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loadedImg, setLoadedImg] = useState<HTMLImageElement | null>(null);

  // Transformations
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('free');

  // Crop Coordinates
  const [cropBox, setCropBox] = useState<CropRect>({ x: 0, y: 0, width: 400, height: 400 });
  const [zoomScale, setZoomScale] = useState<number>(100); // 30% to 150%

  // Output format
  const [outputFormat, setOutputFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');

  // Live Screen Preview
  const [livePreviewUrl, setLivePreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, initX: 0, initY: 0 });

  // On image load, initialize crop
  useEffect(() => {
    if (files.length > 0) {
      loadImage(files[0].file).then((img) => {
        setLoadedImg(img);
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        const initSize = Math.round(Math.min(w, h) * 0.8);
        setCropBox({
          x: Math.round((w - initSize) / 2),
          y: Math.round((h - initSize) / 2),
          width: initSize,
          height: initSize
        });
        setZoomScale(100);
      });
    } else {
      setLoadedImg(null);
      setLivePreviewUrl(null);
    }
  }, [files]);

  // Apply Aspect Ratio Presets
  const applyPresetRatio = useCallback(
    (presetKey: string) => {
      setSelectedPreset(presetKey);
      if (!loadedImg) return;
      const w = loadedImg.naturalWidth || loadedImg.width;
      const h = loadedImg.naturalHeight || loadedImg.height;

      const p = SOCIAL_PRESETS.find((sp) => sp.aspect === presetKey);
      if (!p || p.ratio === null) {
        // Freeform: keep current or default 80%
        return;
      }

      const ratio = p.ratio;
      let targetW = cropBox.width;
      let targetH = Math.round(targetW / ratio);

      if (targetH > h) {
        targetH = Math.round(h * 0.85);
        targetW = Math.round(targetH * ratio);
      }
      if (targetW > w) {
        targetW = Math.round(w * 0.85);
        targetH = Math.round(targetW / ratio);
      }

      setCropBox({
        x: Math.max(0, Math.round((w - targetW) / 2)),
        y: Math.max(0, Math.round((h - targetH) / 2)),
        width: targetW,
        height: targetH
      });
    },
    [loadedImg, cropBox.width]
  );

  // Automatic Smart Center Max Crop
  const handleAutoSmartCenter = () => {
    if (!loadedImg) return;
    const w = loadedImg.naturalWidth || loadedImg.width;
    const h = loadedImg.naturalHeight || loadedImg.height;

    const p = SOCIAL_PRESETS.find((sp) => sp.aspect === selectedPreset);
    const ratio = p?.ratio || 1;

    let targetW = w;
    let targetH = Math.round(w / ratio);
    if (targetH > h) {
      targetH = h;
      targetW = Math.round(h * ratio);
    }

    setCropBox({
      x: Math.round((w - targetW) / 2),
      y: Math.round((h - targetH) / 2),
      width: targetW,
      height: targetH
    });
    setZoomScale(100);
  };

  // Draw interactive alignment canvas
  useEffect(() => {
    if (!loadedImg || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgW = loadedImg.naturalWidth || loadedImg.width;
    const imgH = loadedImg.naturalHeight || loadedImg.height;

    const displayW = Math.min(600, imgW);
    const scale = displayW / imgW;
    canvas.width = displayW;
    canvas.height = Math.round(imgH * scale);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(loadedImg, 0, 0, canvas.width, canvas.height);

    // Dark semi-transparent mask
    ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const sx = cropBox.x * scale;
    const sy = cropBox.y * scale;
    const sw = cropBox.width * scale;
    const sh = cropBox.height * scale;

    // Draw active crop region
    ctx.clearRect(sx, sy, sw, sh);
    ctx.drawImage(loadedImg, cropBox.x, cropBox.y, cropBox.width, cropBox.height, sx, sy, sw, sh);

    // Crop border
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(sx, sy, sw, sh);

    // Rule of thirds grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx + sw / 3, sy);
    ctx.lineTo(sx + sw / 3, sy + sh);
    ctx.moveTo(sx + (2 * sw) / 3, sy);
    ctx.lineTo(sx + (2 * sw) / 3, sy + sh);
    ctx.moveTo(sx, sy + sh / 3);
    ctx.lineTo(sx + sw, sy + sh / 3);
    ctx.moveTo(sx, sy + (2 * sh) / 3);
    ctx.lineTo(sx + sw, sy + (2 * sh) / 3);
    ctx.stroke();
  }, [loadedImg, cropBox]);

  // Live Screen Output Preview Generation
  useEffect(() => {
    if (!files.length || !loadedImg) return;

    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        const res = await cropImage(files[0].file, {
          rect: cropBox,
          rotation,
          flipHorizontal: flipH,
          flipVertical: flipV,
          format: outputFormat
        });
        if (isMounted) {
          const url = URL.createObjectURL(res.blob);
          setLivePreviewUrl(url);
        }
      } catch (err) {
        console.error('Crop preview error:', err);
      }
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [files, loadedImg, cropBox, rotation, flipH, flipV, outputFormat]);

  // Direct canvas drag handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      initX: cropBox.x,
      initY: cropBox.y
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current || !loadedImg || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const scale = (loadedImg.naturalWidth || loadedImg.width) / canvas.width;

    const dx = (e.clientX - dragStartRef.current.mouseX) * scale;
    const dy = (e.clientY - dragStartRef.current.mouseY) * scale;

    const imgW = loadedImg.naturalWidth || loadedImg.width;
    const imgH = loadedImg.naturalHeight || loadedImg.height;

    let newX = Math.round(dragStartRef.current.initX + dx);
    let newY = Math.round(dragStartRef.current.initY + dy);

    if (newX < 0) newX = 0;
    if (newY < 0) newY = 0;
    if (newX + cropBox.width > imgW) newX = imgW - cropBox.width;
    if (newY + cropBox.height > imgH) newY = imgH - cropBox.height;

    setCropBox((prev) => ({ ...prev, x: newX, y: newY }));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleDownload = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    try {
      const res = await cropImage(files[0].file, {
        rect: cropBox,
        rotation,
        flipHorizontal: flipH,
        flipVertical: flipV,
        format: outputFormat
      });
      downloadBlob(res.blob, res.filename);
    } catch (err: any) {
      alert(`Error saving crop: ${err.message}`);
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
          onFilesChange={(newFiles) => setFiles(newFiles)}
          title="Upload image to crop, straighten, and transform"
          subtitle="Supports JPG, PNG, and WebP images up to 40MB"
        />

        {loadedImg && (
          <div className="space-y-6">
            {/* Top Toolbar: Aspect Ratio Presets & Auto Modes */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Crop className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Crop Presets &amp; Social Ratios
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAutoSmartCenter}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-semibold hover:bg-blue-100 transition-colors border border-blue-200 dark:border-blue-800"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Auto Center Max Crop
                  </button>
                </div>
              </div>

              {/* Preset Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {SOCIAL_PRESETS.map((p) => {
                  const isSelected = selectedPreset === p.aspect;
                  return (
                    <button
                      key={p.aspect}
                      onClick={() => applyPresetRatio(p.aspect)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-500/20 text-blue-600 dark:text-blue-300 font-bold'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300 text-xs font-medium'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Split Screen Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 7 Cols: Interactive Canvas & Sliders */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Move className="w-3.5 h-3.5 text-blue-500" />
                      Interactive Crop Frame
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Drag crop area across image
                    </span>
                  </div>

                  {/* Canvas Viewport */}
                  <div className="flex flex-col items-center justify-center p-3 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden select-none">
                    <canvas
                      ref={canvasRef}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      className="max-w-full rounded shadow-sm cursor-grab active:cursor-grabbing"
                    />
                  </div>

                  {/* Rotation, Flips & Size Sliders */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setRotation((r) => (r + 90) % 360)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                          <span>Rotate 90° ({rotation}°)</span>
                        </button>
                        <button
                          onClick={() => setFlipH(!flipH)}
                          className={`p-1.5 rounded-lg border text-xs transition-colors ${
                            flipH
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                          title="Flip horizontally"
                        >
                          <FlipHorizontal className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setFlipV(!flipV)}
                          className={`p-1.5 rounded-lg border text-xs transition-colors ${
                            flipV
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                          title="Flip vertically"
                        >
                          <FlipVertical className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-xs font-mono text-slate-500">
                        Box: {cropBox.width} × {cropBox.height} px
                      </div>
                    </div>

                    {/* Crop Width & Height Fine Adjust Sliders */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1 text-slate-600 dark:text-slate-400">
                          <span>Crop Width</span>
                          <span>{cropBox.width}px</span>
                        </div>
                        <input
                          type="range"
                          min={50}
                          max={loadedImg.naturalWidth || loadedImg.width}
                          step={10}
                          value={cropBox.width}
                          onChange={(e) => {
                            const nw = Number(e.target.value);
                            setCropBox((prev) => ({ ...prev, width: nw }));
                          }}
                          className="w-full accent-blue-600"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1 text-slate-600 dark:text-slate-400">
                          <span>Crop Height</span>
                          <span>{cropBox.height}px</span>
                        </div>
                        <input
                          type="range"
                          min={50}
                          max={loadedImg.naturalHeight || loadedImg.height}
                          step={10}
                          value={cropBox.height}
                          onChange={(e) => {
                            const nh = Number(e.target.value);
                            setCropBox((prev) => ({ ...prev, height: nh }));
                          }}
                          className="w-full accent-blue-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right 5 Cols: Live Cropped Screen Preview & Download */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-emerald-600" />
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Live Cropped Result
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                      {cropBox.width} × {cropBox.height} px
                    </span>
                  </div>

                  {/* Live Cropped Result Card */}
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 aspect-video flex items-center justify-center p-2">
                    {livePreviewUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={livePreviewUrl}
                        alt="Live Crop Preview"
                        className="max-w-full max-h-full object-contain rounded shadow"
                      />
                    ) : (
                      <RefreshCw className="w-5 h-5 animate-spin text-slate-500" />
                    )}
                  </div>

                  {/* Format & Export Actions */}
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Export Format
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['image/jpeg', 'image/png', 'image/webp'] as const).map((fmt) => (
                          <button
                            key={fmt}
                            onClick={() => setOutputFormat(fmt)}
                            className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                              outputFormat === fmt
                                ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {fmt.split('/')[1].toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleDownload}
                      disabled={isProcessing}
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Exporting Cropped Image...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Download Cropped Photo
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
