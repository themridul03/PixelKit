'use client';

import React, { useState, useEffect } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { FileDropzone, FileItem } from '@/components/upload/FileDropzone';
import { getToolById } from '@/config/tools';
import { compressImage } from '@/lib/image/compressImage';
import { formatBytes } from '@/lib/utils/format';
import { downloadBlob } from '@/lib/utils/download';
import {
  Sparkles,
  Sliders,
  CheckCircle2,
  Download,
  Eye,
  RefreshCw,
  Zap,
  ShieldCheck,
  ArrowRight,
  Maximize2
} from 'lucide-react';

export default function ImageCompressorPage() {
  const tool = getToolById('image-compressor')!;
  const [files, setFiles] = useState<FileItem[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);

  // Preset Mode
  const [compressMode, setCompressMode] = useState<'smart' | 'maximum' | 'lossless' | 'custom'>('smart');

  // Controls
  const [quality, setQuality] = useState(75);
  const [format, setFormat] = useState<'image/jpeg' | 'image/webp' | 'image/png'>('image/jpeg');
  const [maxWidth, setMaxWidth] = useState<number | undefined>(undefined);

  // Live Screen Preview Result
  const [liveResult, setLiveResult] = useState<{
    url: string;
    blob: Blob;
    originalSize: number;
    compressedSize: number;
    savedPercent: number;
    dimensions: { width: number; height: number };
  } | null>(null);

  const [isCompressingLive, setIsCompressingLive] = useState(false);

  // Auto preset applier
  const applyPresetMode = (mode: 'smart' | 'maximum' | 'lossless' | 'custom') => {
    setCompressMode(mode);
    if (mode === 'smart') {
      setQuality(75);
      setFormat('image/webp');
      setMaxWidth(undefined);
    } else if (mode === 'maximum') {
      setQuality(45);
      setFormat('image/webp');
      setMaxWidth(1280);
    } else if (mode === 'lossless') {
      setQuality(88);
      setFormat('image/jpeg');
      setMaxWidth(undefined);
    }
  };

  // Run live compression whenever file, quality, format, or maxWidth changes
  useEffect(() => {
    if (files.length === 0) {
      setLiveResult(null);
      return;
    }

    const currentItem = files[activeFileIndex] || files[0];
    let isMounted = true;

    const timer = setTimeout(async () => {
      try {
        setIsCompressingLive(true);
        const res = await compressImage(currentItem.file, {
          quality: quality / 100,
          format,
          maxWidth: maxWidth && maxWidth > 0 ? maxWidth : undefined
        });

        if (isMounted) {
          const url = URL.createObjectURL(res.blob);
          const saved = Math.max(0, Math.round(((res.originalSize - res.compressedSize) / res.originalSize) * 100));
          setLiveResult({
            url,
            blob: res.blob,
            originalSize: res.originalSize,
            compressedSize: res.compressedSize,
            savedPercent: saved,
            dimensions: res.outputDimensions
          });
        }
      } catch (err) {
        console.error('Live compression error:', err);
      } finally {
        if (isMounted) setIsCompressingLive(false);
      }
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [files, activeFileIndex, quality, format, maxWidth]);

  const handleDownload = () => {
    if (!liveResult || !files[activeFileIndex]) return;
    const currentItem = files[activeFileIndex];
    const ext = format === 'image/webp' ? '.webp' : format === 'image/png' ? '.png' : '.jpg';
    const baseName = currentItem.file.name.replace(/\.[^/.]+$/, '');
    downloadBlob(liveResult.blob, `${baseName}_compressed${ext}`);
  };

  const currentFile = files[activeFileIndex]?.file;

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileDropzone
          acceptedFormats={['image/jpeg', 'image/png', 'image/webp']}
          maxFileSizeMB={50}
          multiple={true}
          files={files}
          onFilesChange={(newFiles) => {
            setFiles(newFiles);
            setActiveFileIndex(0);
          }}
          title="Upload image(s) to compress"
          subtitle="Supports JPG, PNG, and WebP (up to 50 MB each)"
        />

        {files.length > 0 && currentFile && (
          <div className="space-y-6">
            {/* Automatic 1-Click Modes & Preset Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Compression Mode &amp; Optimization
                  </h3>
                </div>

                {/* Multiple files selector if batch */}
                {files.length > 1 && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">Selected file:</span>
                    <select
                      value={activeFileIndex}
                      onChange={(e) => setActiveFileIndex(Number(e.target.value))}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs"
                    >
                      {files.map((f, i) => (
                        <option key={i} value={i}>
                          #{i + 1} - {f.file.name.slice(0, 24)}...
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Automatic Mode Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  onClick={() => applyPresetMode('smart')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    compressMode === 'smart'
                      ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold text-xs mb-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto Smart (WebP)</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Balanced 75% quality with zero noticeable loss
                  </p>
                </button>

                <button
                  onClick={() => applyPresetMode('maximum')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    compressMode === 'maximum'
                      ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-xs mb-0.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Max Size Reduction</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    45% quality + 1280px max width for email/web
                  </p>
                </button>

                <button
                  onClick={() => applyPresetMode('lossless')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    compressMode === 'lossless'
                      ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs mb-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>High Fidelity JPEG</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    88% quality preserving crisp text & print details
                  </p>
                </button>

                <button
                  onClick={() => setCompressMode('custom')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    compressMode === 'custom'
                      ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold text-xs mb-0.5">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Custom Manual</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Adjust exact quality, dimensions, &amp; format
                  </p>
                </button>
              </div>
            </div>

            {/* Split Screen Before / After Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 6 Cols: Custom Fine-Tuning Controls */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Manual Controls
                    </h4>
                    <span className="text-xs text-blue-600 font-bold">{quality}% Quality</span>
                  </div>

                  {/* Quality Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span>Compression Quality</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{quality}%</span>
                    </div>
                    <input
                      type="range"
                      min={15}
                      max={95}
                      step={5}
                      value={quality}
                      onChange={(e) => {
                        setQuality(Number(e.target.value));
                        setCompressMode('custom');
                      }}
                      className="w-full accent-blue-600"
                    />
                  </div>

                  {/* Format Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Target File Format
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'WebP (Smallest)', val: 'image/webp' },
                        { label: 'JPEG (Standard)', val: 'image/jpeg' },
                        { label: 'PNG (Lossless)', val: 'image/png' }
                      ].map((f) => (
                        <button
                          key={f.val}
                          onClick={() => {
                            setFormat(f.val as any);
                            setCompressMode('custom');
                          }}
                          className={`py-2 text-[11px] font-semibold rounded-lg border transition-all ${
                            format === f.val
                              ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Max Width Resize Option */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Maximum Dimension Scaling
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { label: 'Original', val: undefined },
                        { label: '1920px', val: 1920 },
                        { label: '1280px', val: 1280 },
                        { label: '800px', val: 800 }
                      ].map((dim, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setMaxWidth(dim.val);
                            setCompressMode('custom');
                          }}
                          className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                            maxWidth === dim.val
                              ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-semibold'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {dim.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Instant Download Action */}
                  <div className="pt-2">
                    <button
                      onClick={handleDownload}
                      disabled={!liveResult}
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                      Download Compressed Image
                    </button>
                  </div>
                </div>
              </div>

              {/* Right 7 Cols: Live Visual Screen Preview & Stats */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-emerald-600" />
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Live Screen Preview &amp; Compression Metrics
                      </h4>
                    </div>
                    {isCompressingLive && (
                      <span className="flex items-center gap-1 text-[11px] text-blue-500">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Updating...
                      </span>
                    )}
                  </div>

                  {/* Metrics Banner */}
                  {liveResult && (
                    <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Original Size</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {formatBytes(liveResult.originalSize)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Optimized Size</span>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {formatBytes(liveResult.compressedSize)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Space Saved</span>
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                          -{liveResult.savedPercent}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Live Visual Canvas/Image Container */}
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 aspect-video flex items-center justify-center p-2 relative">
                    {liveResult?.url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={liveResult.url}
                        alt="Live Compressed Preview"
                        className="max-w-full max-h-full object-contain rounded shadow"
                      />
                    ) : (
                      <RefreshCw className="w-5 h-5 animate-spin text-slate-500" />
                    )}

                    {liveResult && (
                      <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-xs text-[10px] text-white px-2 py-1 rounded-md border border-white/10 font-mono">
                        {liveResult.dimensions.width} × {liveResult.dimensions.height} px
                      </div>
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
