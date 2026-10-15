'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { FileDropzone, FileItem } from '@/components/upload/FileDropzone';
import { getToolById } from '@/config/tools';
import {
  PASSPORT_PRESETS,
  PassportPreset,
  detectAutoPortraitCrop,
  generatePassportPhoto,
  CropRect
} from '@/lib/image/passportPhoto';
import { loadImage } from '@/lib/image/imageCore';
import { downloadBlob } from '@/lib/utils/download';
import {
  UserCheck,
  Sparkles,
  Printer,
  Sliders,
  Move,
  ZoomIn,
  RotateCw,
  SunMedium,
  Download,
  CheckCircle2,
  HelpCircle,
  Eye,
  RefreshCw,
  Palette,
  Layers,
  ArrowRight
} from 'lucide-react';

const BG_OPTIONS = [
  { label: 'Studio White', color: '#ffffff', class: 'bg-white border-slate-300' },
  { label: 'Light Blue', color: '#e0f2fe', class: 'bg-sky-100 border-sky-300' },
  { label: 'Light Grey', color: '#f1f5f9', class: 'bg-slate-100 border-slate-300' },
  { label: 'Warm Cream', color: '#fefce8', class: 'bg-amber-50 border-amber-300' },
  { label: 'Original', color: 'transparent', class: 'bg-slate-200 border-slate-400' }
];

export default function PassportPhotoMakerPage() {
  const tool = getToolById('passport-photo-maker')!;
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loadedImg, setLoadedImg] = useState<HTMLImageElement | null>(null);

  // Mode: 'auto' | 'manual'
  const [controlMode, setControlMode] = useState<'auto' | 'manual'>('auto');

  // Preset & sheet options
  const [selectedPreset, setSelectedPreset] = useState<PassportPreset>(PASSPORT_PRESETS[0]);
  const [generateSheet, setGenerateSheet] = useState(true);
  const [copiesCount, setCopiesCount] = useState(6);
  const [bgColor, setBgColor] = useState<string>('#ffffff');

  // Manual Adjustments
  const [cropBox, setCropBox] = useState<CropRect>({ x: 0, y: 0, width: 600, height: 600 });
  const [zoomLevel, setZoomLevel] = useState<number>(100); // 50 to 200%
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [brightness, setBrightness] = useState<number>(0); // -50 to 50
  const [contrast, setContrast] = useState<number>(0);     // -50 to 50
  const [saturation, setSaturation] = useState<number>(0); // -50 to 50
  const [headGuideScale, setHeadGuideScale] = useState<number>(100);

  // Live Screen Output Previews
  const [liveSingleUrl, setLiveSingleUrl] = useState<string | null>(null);
  const [liveSheetUrl, setLiveSheetUrl] = useState<string | null>(null);
  const [isRenderingLive, setIsRenderingLive] = useState(false);

  // Canvas Refs for interactive drag
  const alignCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, initPanX: 0, initPanY: 0 });

  // 1. When image is loaded, trigger smart auto-crop
  useEffect(() => {
    if (files.length > 0) {
      loadImage(files[0].file).then((img) => {
        setLoadedImg(img);
        applySmartAutoCrop(img, selectedPreset);
      });
    } else {
      setLoadedImg(null);
      setLiveSingleUrl(null);
      setLiveSheetUrl(null);
    }
  }, [files]);

  // When preset changes, recalculate aspect ratio crop
  useEffect(() => {
    if (loadedImg) {
      applySmartAutoCrop(loadedImg, selectedPreset);
    }
  }, [selectedPreset]);

  const applySmartAutoCrop = (img: HTMLImageElement, preset: PassportPreset) => {
    const targetAspect = preset.pixelWidth / preset.pixelHeight;
    const detected = detectAutoPortraitCrop(img, targetAspect);
    setCropBox(detected);
    setZoomLevel(100);
    setPanX(0);
    setPanY(0);
  };

  // Re-calculate effective crop with zoom and pan
  const getEffectiveCropRect = useCallback((): CropRect => {
    if (!loadedImg) return cropBox;
    const imgW = loadedImg.naturalWidth || loadedImg.width;
    const imgH = loadedImg.naturalHeight || loadedImg.height;

    // Zoom modifies the crop box size: higher zoom = smaller crop area
    const zoomFactor = 100 / Math.max(30, zoomLevel);
    const effectiveW = Math.round(cropBox.width * zoomFactor);
    const effectiveH = Math.round(cropBox.height * zoomFactor);

    // Apply pan offset
    let effX = Math.round(cropBox.x + (cropBox.width - effectiveW) / 2 + panX);
    let effY = Math.round(cropBox.y + (cropBox.height - effectiveH) / 2 + panY);

    // Keep within bounds
    if (effX < 0) effX = 0;
    if (effY < 0) effY = 0;
    if (effX + effectiveW > imgW) effX = Math.max(0, imgW - effectiveW);
    if (effY + effectiveH > imgH) effY = Math.max(0, imgH - effectiveH);

    return { x: effX, y: effY, width: effectiveW, height: effectiveH };
  }, [loadedImg, cropBox, zoomLevel, panX, panY]);

  // Draw alignment overlay canvas
  useEffect(() => {
    if (!loadedImg || !alignCanvasRef.current) return;
    const canvas = alignCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgW = loadedImg.naturalWidth || loadedImg.width;
    const imgH = loadedImg.naturalHeight || loadedImg.height;

    // Set canvas dimensions
    const displayWidth = Math.min(500, imgW);
    const scale = displayWidth / imgW;
    canvas.width = displayWidth;
    canvas.height = Math.round(imgH * scale);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(loadedImg, 0, 0, canvas.width, canvas.height);

    // Dim background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const eff = getEffectiveCropRect();
    const sx = eff.x * scale;
    const sy = eff.y * scale;
    const sw = eff.width * scale;
    const sh = eff.height * scale;

    // Draw active crop area
    ctx.clearRect(sx, sy, sw, sh);
    ctx.drawImage(loadedImg, eff.x, eff.y, eff.width, eff.height, sx, sy, sw, sh);

    // Biometric Head Oval Guide
    const headScale = headGuideScale / 100;
    const ovalW = sw * 0.3 * headScale;
    const ovalH = sh * 0.38 * headScale;
    const ovalCenterX = sx + sw / 2;
    const ovalCenterY = sy + sh * 0.42;

    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(ovalCenterX, ovalCenterY, ovalW, ovalH, 0, 0, 2 * Math.PI);
    ctx.stroke();

    // Eye line dashed
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(ovalCenterX - ovalW * 0.9, ovalCenterY - ovalH * 0.15);
    ctx.lineTo(ovalCenterX + ovalW * 0.9, ovalCenterY - ovalH * 0.15);
    ctx.stroke();
    ctx.setLineDash([]);

    // Chin reference line
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.6)';
    ctx.beginPath();
    ctx.moveTo(ovalCenterX - ovalW * 0.5, ovalCenterY + ovalH);
    ctx.lineTo(ovalCenterX + ovalW * 0.5, ovalCenterY + ovalH);
    ctx.stroke();

    // Crop border
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx, sy, sw, sh);

    // Rule of thirds lines
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx + sw / 3, sy);
    ctx.lineTo(sx + sw / 3, sy + sh);
    ctx.moveTo(sx + (2 * sw) / 3, sy);
    ctx.lineTo(sx + (2 * sw) / 3, sy + sh);
    ctx.stroke();
  }, [loadedImg, getEffectiveCropRect, headGuideScale]);

  // Live Screen Render: Updates live preview of single photo and print sheet
  useEffect(() => {
    if (!files.length || !loadedImg) return;

    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        setIsRenderingLive(true);
        const eff = getEffectiveCropRect();
        const res = await generatePassportPhoto(files[0].file, {
          preset: selectedPreset,
          cropRect: eff,
          generatePrintSheet: generateSheet,
          copiesCount: copiesCount,
          backgroundColor: bgColor,
          brightness,
          contrast,
          saturation
        });

        if (isMounted) {
          setLiveSingleUrl(res.singleDataUrl);
          if (res.sheetDataUrl) setLiveSheetUrl(res.sheetDataUrl);
        }
      } catch (e) {
        console.error('Live render error:', e);
      } finally {
        if (isMounted) setIsRenderingLive(false);
      }
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [
    files,
    loadedImg,
    selectedPreset,
    generateSheet,
    copiesCount,
    bgColor,
    brightness,
    contrast,
    saturation,
    getEffectiveCropRect
  ]);

  // Mouse & Touch Drag Handlers for direct canvas positioning
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initPanX: panX,
      initPanY: panY
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    // Map screen movement to pan
    setPanX(dragStartRef.current.initPanX + dx * 2);
    setPanY(dragStartRef.current.initPanY + dy * 2);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Download actions
  const handleDownloadSingle = async () => {
    if (!files.length) return;
    const eff = getEffectiveCropRect();
    const res = await generatePassportPhoto(files[0].file, {
      preset: selectedPreset,
      cropRect: eff,
      generatePrintSheet: false,
      backgroundColor: bgColor,
      brightness,
      contrast,
      saturation
    });
    downloadBlob(res.singleBlob, res.filename);
  };

  const handleDownloadSheet = async () => {
    if (!files.length) return;
    const eff = getEffectiveCropRect();
    const res = await generatePassportPhoto(files[0].file, {
      preset: selectedPreset,
      cropRect: eff,
      generatePrintSheet: true,
      copiesCount: copiesCount,
      backgroundColor: bgColor,
      brightness,
      contrast,
      saturation
    });
    if (res.sheetBlob) {
      downloadBlob(res.sheetBlob, res.filename.replace('.jpg', '_printable_4x6_sheet.jpg'));
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
          title="Upload headshot portrait photo"
          subtitle="Looking straight into the camera with neutral expression on plain background"
        />

        {loadedImg && (
          <div className="space-y-6">
            {/* Mode & Country Preset Selector Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Passport &amp; Visa Specifications
                  </h3>
                </div>

                {/* Mode Switcher Tabs */}
                <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <button
                    onClick={() => {
                      setControlMode('auto');
                      applySmartAutoCrop(loadedImg, selectedPreset);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      controlMode === 'auto'
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto Smart Framing</span>
                  </button>
                  <button
                    onClick={() => setControlMode('manual')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      controlMode === 'manual'
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Manual Studio Edit</span>
                  </button>
                </div>
              </div>

              {/* Country Preset Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {PASSPORT_PRESETS.map((preset) => {
                  const isSelected = selectedPreset.id === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => setSelectedPreset(preset)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {preset.country}
                      </p>
                      <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                        {preset.widthMm} × {preset.heightMm} mm
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {preset.pixelWidth}×{preset.pixelHeight} px
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Split Screen Studio Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 6 Cols: Interactive Canvas & Guides */}
              <div className="lg:col-span-6 space-y-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Move className="w-3.5 h-3.5 text-blue-500" />
                      Interactive Biometric Alignment
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Drag canvas to reposition face
                    </span>
                  </div>

                  {/* Alignment Canvas */}
                  <div className="flex flex-col items-center justify-center p-3 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden relative select-none">
                    <canvas
                      ref={alignCanvasRef}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      className="max-w-full rounded shadow-sm cursor-grab active:cursor-grabbing"
                    />
                    <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-xs text-[10px] text-emerald-400 px-2 py-1 rounded-md border border-emerald-500/30">
                      Biometric Oval Match
                    </div>
                  </div>

                  {/* Alignment Hints */}
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      Green oval marks official head size (60-70% height). Dashed line marks eye level.
                    </span>
                  </div>

                  {/* Manual Sliders (when in Manual Mode or Auto fine-tune) */}
                  <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                            <ZoomIn className="w-3 h-3 text-blue-500" /> Zoom
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{zoomLevel}%</span>
                        </div>
                        <input
                          type="range"
                          min={60}
                          max={220}
                          step={2}
                          value={zoomLevel}
                          onChange={(e) => setZoomLevel(Number(e.target.value))}
                          className="w-full accent-blue-600"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                            <Move className="w-3 h-3 text-blue-500" /> Head Oval Scale
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{headGuideScale}%</span>
                        </div>
                        <input
                          type="range"
                          min={70}
                          max={130}
                          step={2}
                          value={headGuideScale}
                          onChange={(e) => setHeadGuideScale(Number(e.target.value))}
                          className="w-full accent-blue-600"
                        />
                      </div>
                    </div>

                    {/* Studio Color & Lighting Controls */}
                    <div className="pt-2 space-y-3">
                      {/* Background Color Picker */}
                      <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                          Studio Background Tint
                        </label>
                        <div className="flex flex-wrap items-center gap-2">
                          {BG_OPTIONS.map((bg) => (
                            <button
                              key={bg.label}
                              onClick={() => setBgColor(bg.color)}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border transition-all ${
                                bgColor === bg.color
                                  ? 'border-blue-500 ring-2 ring-blue-500/20 font-semibold text-slate-900 dark:text-white'
                                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              <span className={`w-3 h-3 rounded-full border ${bg.class}`} />
                              <span>{bg.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Lighting Controls */}
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        <div>
                          <div className="flex justify-between text-[11px] mb-1 text-slate-600 dark:text-slate-400">
                            <span>Brightness</span>
                            <span>{brightness > 0 ? `+${brightness}` : brightness}</span>
                          </div>
                          <input
                            type="range"
                            min={-40}
                            max={40}
                            step={2}
                            value={brightness}
                            onChange={(e) => setBrightness(Number(e.target.value))}
                            className="w-full accent-blue-600"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[11px] mb-1 text-slate-600 dark:text-slate-400">
                            <span>Contrast</span>
                            <span>{contrast > 0 ? `+${contrast}` : contrast}</span>
                          </div>
                          <input
                            type="range"
                            min={-40}
                            max={40}
                            step={2}
                            value={contrast}
                            onChange={(e) => setContrast(Number(e.target.value))}
                            className="w-full accent-blue-600"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[11px] mb-1 text-slate-600 dark:text-slate-400">
                            <span>Vibrancy</span>
                            <span>{saturation > 0 ? `+${saturation}` : saturation}</span>
                          </div>
                          <input
                            type="range"
                            min={-40}
                            max={40}
                            step={2}
                            value={saturation}
                            onChange={(e) => setSaturation(Number(e.target.value))}
                            className="w-full accent-blue-600"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right 6 Cols: Live Screen Previews & Direct Downloads */}
              <div className="lg:col-span-6 space-y-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-emerald-600" />
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Live Photo Previews
                      </h4>
                    </div>
                    {isRenderingLive && (
                      <span className="flex items-center gap-1 text-[11px] text-blue-500">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Rendering...
                      </span>
                    )}
                  </div>

                  {/* Single Photo Card Preview */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    {liveSingleUrl ? (
                      <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-slate-300 dark:border-slate-600 bg-white shadow-sm flex items-center justify-center shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={liveSingleUrl}
                          alt="Passport Single"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse shrink-0" />
                    )}

                    <div className="space-y-1.5 flex-1 text-center sm:text-left">
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                        Single Official Photo ({selectedPreset.country})
                      </h5>
                      <p className="text-[11px] text-slate-500">
                        Dimensions: {selectedPreset.widthMm} × {selectedPreset.heightMm} mm ({selectedPreset.pixelWidth} × {selectedPreset.pixelHeight} px @ 300 DPI)
                      </p>
                      <button
                        onClick={handleDownloadSingle}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors mt-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download Single Photo
                      </button>
                    </div>
                  </div>

                  {/* 4x6 Printable Sheet Section */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Printer className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          4x6 Inch Printable Sheet
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500">Copies:</span>
                        <select
                          value={copiesCount}
                          onChange={(e) => setCopiesCount(Number(e.target.value))}
                          className="text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                        >
                          <option value={2}>2 Copies</option>
                          <option value={4}>4 Copies</option>
                          <option value={6}>6 Copies</option>
                          <option value={8}>8 Copies</option>
                        </select>
                      </div>
                    </div>

                    {liveSheetUrl && (
                      <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white shadow-xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={liveSheetUrl}
                          alt="Printable 4x6 Sheet"
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                      <button
                        onClick={handleDownloadSheet}
                        className="w-full sm:flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download 4x6&quot; Sheet (JPG)
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Print Now
                      </button>
                    </div>
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
