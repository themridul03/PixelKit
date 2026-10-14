'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { FileDropzone, FileItem } from '@/components/upload/FileDropzone';
import { DownloadBar, DownloadItem } from '@/components/download/DownloadBar';
import { getToolById } from '@/config/tools';
import { loadImage, canvasToBlob } from '@/lib/image/imageCore';
import {
  Sliders,
  Type,
  Edit2,
  Undo,
  RotateCcw,
  Sparkles,
  Download,
  Image as ImageIcon
} from 'lucide-react';

export default function ImageEditorPage() {
  const tool = getToolById('image-editor')!;
  const [files, setFiles] = useState<FileItem[]>([]);
  const [activeTab, setActiveTab] = useState<'adjust' | 'draw' | 'text'>('adjust');

  // Adjustments
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);
  const [grayscale, setGrayscale] = useState(0);
  const [sepia, setSepia] = useState(0);
  const [invert, setInvert] = useState(0);

  // Drawing
  const [penColor, setPenColor] = useState('#ef4444');
  const [penSize, setPenSize] = useState(6);
  const [isDrawing, setIsDrawing] = useState(false);

  // Text
  const [overlayText, setOverlayText] = useState('PixelKit');
  const [textColor, setTextColor] = useState('#ffffff');
  const [textSize, setTextSize] = useState(48);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [baseImage, setBaseImage] = useState<HTMLImageElement | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [downloadItems, setDownloadItems] = useState<DownloadItem[]>([]);

  useEffect(() => {
    if (files.length > 0) {
      loadImage(files[0].file).then((img) => {
        setBaseImage(img);
        initCanvas(img);
      });
    }
  }, [files]);

  const initCanvas = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    ctx.drawImage(img, 0, 0);

    const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([initialData]);
  };

  const applyFilters = () => {
    const canvas = canvasRef.current;
    if (!canvas || !baseImage) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px) grayscale(${grayscale}%) sepia(${sepia}%) invert(${invert}%)`;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(baseImage, 0, 0);
    ctx.filter = 'none';
  };

  useEffect(() => {
    applyFilters();
  }, [brightness, contrast, saturation, blur, grayscale, sepia, invert]);

  // Drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTab !== 'draw') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    ctx.beginPath();
    ctx.moveTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || activeTab !== 'draw') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    ctx.lineTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing && canvasRef.current) {
      setIsDrawing(false);
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        setHistory((prev) => [...prev, ctx.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height)]);
      }
    }
  };

  const addTextToCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.font = `bold ${textSize}px sans-serif`;
    ctx.fillStyle = textColor;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 8;
    ctx.fillText(overlayText, canvas.width / 2, canvas.height / 2);
    ctx.shadowBlur = 0;

    setHistory((prev) => [...prev, ctx.getImageData(0, 0, canvas.width, canvas.height)]);
  };

  const handleUndo = () => {
    if (history.length > 1) {
      const nextHistory = history.slice(0, -1);
      const lastState = nextHistory[nextHistory.length - 1];
      const canvas = canvasRef.current;
      if (canvas && lastState) {
        const ctx = canvas.getContext('2d');
        ctx?.putImageData(lastState, 0, 0);
      }
      setHistory(nextHistory);
    }
  };

  const handleResetAdjustments = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setBlur(0);
    setGrayscale(0);
    setSepia(0);
    setInvert(0);
  };

  const handleExport = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !files.length) return;
    const blob = await canvasToBlob(canvas, 'image/jpeg', 0.95);
    setDownloadItems([
      {
        name: files[0].file.name.replace(/\.[^/.]+$/, '_edited.jpg'),
        blob,
        originalSize: files[0].file.size
      }
    ]);
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileDropzone
          acceptedFormats={['image/jpeg', 'image/png', 'image/webp']}
          maxFileSizeMB={50}
          multiple={false}
          files={files}
          onFilesChange={(newFiles) => {
            setFiles(newFiles);
            setDownloadItems([]);
          }}
          title="Upload image into the editor"
          subtitle="Supports JPG, PNG, and WebP"
        />

        {files.length > 0 && (
          <div className="space-y-6">
            {/* Editor Workspace with Canvas & Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Canvas viewport */}
              <div className="lg:col-span-2 bg-slate-100 dark:bg-slate-950/60 rounded-2xl p-4 flex flex-col items-center justify-center border border-slate-200 dark:border-slate-800 min-h-[420px] overflow-hidden">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="max-h-[500px] max-w-full rounded-lg shadow-md bg-white object-contain cursor-crosshair"
                />
              </div>

              {/* Tools Controls Panel */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-5">
                {/* Mode Selector Tabs */}
                <div className="flex rounded-xl bg-slate-200/80 dark:bg-slate-700/60 p-1">
                  <button
                    onClick={() => setActiveTab('adjust')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      activeTab === 'adjust' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-xs' : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Adjust</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('draw')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      activeTab === 'draw' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-xs' : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Draw</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('text')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      activeTab === 'text' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-xs' : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Type className="w-3.5 h-3.5" />
                    <span>Text</span>
                  </button>
                </div>

                {/* Adjust Tab */}
                {activeTab === 'adjust' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Brightness
                      </span>
                      <span className="text-xs text-blue-600 font-semibold">{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full accent-blue-600"
                    />

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Contrast
                      </span>
                      <span className="text-xs text-blue-600 font-semibold">{contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-full accent-blue-600"
                    />

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Saturation
                      </span>
                      <span className="text-xs text-blue-600 font-semibold">{saturation}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={saturation}
                      onChange={(e) => setSaturation(Number(e.target.value))}
                      className="w-full accent-blue-600"
                    />

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Blur</span>
                      <span className="text-xs text-blue-600 font-semibold">{blur}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={blur}
                      onChange={(e) => setBlur(Number(e.target.value))}
                      className="w-full accent-blue-600"
                    />

                    <div className="pt-2 flex justify-between">
                      <button
                        onClick={handleResetAdjustments}
                        className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Sliders</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Draw Tab */}
                {activeTab === 'draw' && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-500">
                      Click and drag across the canvas to draw freely.
                    </p>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Pen Color
                      </label>
                      <input
                        type="color"
                        value={penColor}
                        onChange={(e) => setPenColor(e.target.value)}
                        className="w-full h-9 rounded-lg border cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <span>Brush Size</span>
                        <span>{penSize}px</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="30"
                        value={penSize}
                        onChange={(e) => setPenSize(Number(e.target.value))}
                        className="w-full accent-blue-600"
                      />
                    </div>
                  </div>
                )}

                {/* Text Tab */}
                {activeTab === 'text' && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Overlay Text
                      </label>
                      <input
                        type="text"
                        value={overlayText}
                        onChange={(e) => setOverlayText(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-semibold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Text Color
                      </label>
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-full h-9 rounded-lg border cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <span>Font Size</span>
                        <span>{textSize}px</span>
                      </div>
                      <input
                        type="range"
                        min="16"
                        max="120"
                        value={textSize}
                        onChange={(e) => setTextSize(Number(e.target.value))}
                        className="w-full accent-blue-600"
                      />
                    </div>

                    <button
                      onClick={addTextToCanvas}
                      className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs transition-colors hover:opacity-90"
                    >
                      Add Text to Center
                    </button>
                  </div>
                )}

                {/* Undo / Export buttons */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                  <button
                    onClick={handleUndo}
                    disabled={history.length <= 1}
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-semibold flex items-center justify-center gap-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 disabled:opacity-40"
                  >
                    <Undo className="w-3.5 h-3.5" />
                    <span>Undo Last Action</span>
                  </button>

                  <button
                    onClick={handleExport}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Export Edited Image</span>
                  </button>
                </div>
              </div>
            </div>

            <DownloadBar
              items={downloadItems}
              onReset={() => {
                setFiles([]);
                setDownloadItems([]);
              }}
              successTitle="Edited Image Ready!"
            />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
