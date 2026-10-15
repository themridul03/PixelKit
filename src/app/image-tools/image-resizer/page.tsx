'use client';

import React, { useState, useEffect } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { FileDropzone, FileItem } from '@/components/upload/FileDropzone';
import { getToolById } from '@/config/tools';
import { resizeImage } from '@/lib/image/resizeImage';
import { loadImage } from '@/lib/image/imageCore';
import { downloadBlob } from '@/lib/utils/download';
import {
  Lock,
  Unlock,
  Maximize2,
  Sparkles,
  Eye,
  Download,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Percent
} from 'lucide-react';

const PRESETS = [
  { name: 'Instagram Square', width: 1080, height: 1080 },
  { name: 'Instagram Story', width: 1080, height: 1920 },
  { name: 'YouTube Thumbnail', width: 1280, height: 720 },
  { name: 'Twitter / X Header', width: 1500, height: 500 },
  { name: 'LinkedIn Banner', width: 1584, height: 396 },
  { name: 'Full HD 1080p', width: 1920, height: 1080 }
];

export default function ImageResizerPage() {
  const tool = getToolById('image-resizer')!;
  const [files, setFiles] = useState<FileItem[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);

  const [origW, setOrigW] = useState<number>(1080);
  const [origH, setOrigH] = useState<number>(1080);

  const [width, setWidth] = useState<number>(1080);
  const [height, setHeight] = useState<number>(1080);
  const [originalAspectRatio, setOriginalAspectRatio] = useState<number>(1);
  const [lockAspect, setLockAspect] = useState(true);
  const [fitMode, setFitMode] = useState<'stretch' | 'contain' | 'cover'>('stretch');
  const [format, setFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');

  // Live Screen Preview
  const [livePreviewUrl, setLivePreviewUrl] = useState<string | null>(null);
  const [isProcessingLive, setIsProcessingLive] = useState(false);

  useEffect(() => {
    if (files.length > 0) {
      const current = files[activeFileIndex] || files[0];
      loadImage(current.file).then((img) => {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        setOrigW(w);
        setOrigH(h);
        setWidth(w);
        setHeight(h);
        setOriginalAspectRatio(w / h);
      });
    } else {
      setLivePreviewUrl(null);
    }
  }, [files, activeFileIndex]);

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockAspect && originalAspectRatio > 0) {
      setHeight(Math.max(1, Math.round(val / originalAspectRatio)));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockAspect && originalAspectRatio > 0) {
      setWidth(Math.max(1, Math.round(val * originalAspectRatio)));
    }
  };

  const applyPreset = (presetW: number, presetH: number) => {
    setWidth(presetW);
    setHeight(presetH);
  };

  const applyScalePercent = (percent: number) => {
    const scale = percent / 100;
    setWidth(Math.max(1, Math.round(origW * scale)));
    setHeight(Math.max(1, Math.round(origH * scale)));
  };

  // Live Render on screen
  useEffect(() => {
    if (!files.length || width <= 0 || height <= 0) return;
    const current = files[activeFileIndex] || files[0];

    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        setIsProcessingLive(true);
        const res = await resizeImage(current.file, {
          width,
          height,
          fitMode,
          format
        });
        if (isMounted) {
          const url = URL.createObjectURL(res.blob);
          setLivePreviewUrl(url);
        }
      } catch (err) {
        console.error('Resize live preview error:', err);
      } finally {
        if (isMounted) setIsProcessingLive(false);
      }
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [files, activeFileIndex, width, height, fitMode, format]);

  const handleDownload = async () => {
    if (!files.length) return;
    const current = files[activeFileIndex] || files[0];
    try {
      const res = await resizeImage(current.file, {
        width,
        height,
        fitMode,
        format
      });
      downloadBlob(res.blob, res.outputFilename);
    } catch (err: any) {
      alert(`Error resizing image: ${err.message}`);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileDropzone
          acceptedFormats={['image/jpeg', 'image/png', 'image/webp']}
          maxFileSizeMB={40}
          multiple={true}
          files={files}
          onFilesChange={(newFiles) => {
            setFiles(newFiles);
            setActiveFileIndex(0);
          }}
          title="Upload image(s) to resize"
          subtitle="Supports JPG, PNG, and WebP up to 40MB"
        />

        {files.length > 0 && (
          <div className="space-y-6">
            {/* Quick Presets & Scaling Buttons */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Maximize2 className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    One-Click Dimension Presets &amp; Scaling
                  </h3>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-500 font-medium mr-1 flex items-center gap-1">
                    <Percent className="w-3 h-3 text-blue-500" /> Scale:
                  </span>
                  {[25, 50, 75, 100, 150, 200].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => applyScalePercent(pct)}
                      className="px-2 py-1 rounded-md text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Social Presets */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {PRESETS.map((p) => {
                  const isMatch = width === p.width && height === p.height;
                  return (
                    <button
                      key={p.name}
                      onClick={() => applyPreset(p.width, p.height)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        isMatch
                          ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-500/20 text-blue-600 dark:text-blue-300 font-bold'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300 text-xs font-medium'
                      }`}
                    >
                      <span className="block font-semibold truncate">{p.name}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {p.width}×{p.height}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Split Screen Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 5 Cols: Dimension Inputs & Controls */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Pixel Dimensions
                    </h4>
                    <span className="text-xs text-slate-500">
                      Original: {origW} × {origH} px
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Width (px)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="12000"
                        value={width}
                        onChange={(e) => handleWidthChange(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Height (px)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="12000"
                        value={height}
                        onChange={(e) => handleHeightChange(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Lock Aspect Ratio Toggle */}
                  <button
                    onClick={() => setLockAspect(!lockAspect)}
                    className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                      lockAspect
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800'
                    }`}
                  >
                    {lockAspect ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    <span>{lockAspect ? 'Aspect Ratio Locked (Proportional)' : 'Aspect Ratio Unlocked (Free)'}</span>
                  </button>

                  {/* Fit Mode */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Fitting Strategy
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Stretch', val: 'stretch' },
                        { label: 'Contain (Pad)', val: 'contain' },
                        { label: 'Cover (Fill)', val: 'cover' }
                      ].map((m) => (
                        <button
                          key={m.val}
                          onClick={() => setFitMode(m.val as any)}
                          className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                            fitMode === m.val
                              ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Output Format */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Output Format
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['image/jpeg', 'image/png', 'image/webp'] as const).map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => setFormat(fmt)}
                          className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                            format === fmt
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
                    disabled={!livePreviewUrl}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all disabled:opacity-50 mt-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Resized Image
                  </button>
                </div>
              </div>

              {/* Right 7 Cols: Live Visual Preview */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-emerald-600" />
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Live Screen Preview
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      {isProcessingLive && (
                        <span className="flex items-center gap-1 text-[11px] text-blue-500">
                          <RefreshCw className="w-3 h-3 animate-spin" /> Rendering...
                        </span>
                      )}
                      <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {width} × {height} px
                      </span>
                    </div>
                  </div>

                  {/* Canvas Container */}
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 aspect-video flex items-center justify-center p-3 relative">
                    {livePreviewUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={livePreviewUrl}
                        alt="Live Resized Preview"
                        className="max-w-full max-h-full object-contain rounded shadow"
                      />
                    ) : (
                      <RefreshCw className="w-5 h-5 animate-spin text-slate-500" />
                    )}
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
