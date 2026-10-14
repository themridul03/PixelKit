'use client';

import React, { useState, useEffect } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { FileDropzone, FileItem } from '@/components/upload/FileDropzone';
import { DownloadBar, DownloadItem } from '@/components/download/DownloadBar';
import { getToolById } from '@/config/tools';
import { resizeImage } from '@/lib/image/resizeImage';
import { loadImage } from '@/lib/image/imageCore';
import { Lock, Unlock, Maximize2, Sparkles } from 'lucide-react';

const PRESETS = [
  { name: 'Instagram Square', width: 1080, height: 1080 },
  { name: 'Instagram Story', width: 1080, height: 1920 },
  { name: 'YouTube Thumbnail', width: 1280, height: 720 },
  { name: 'Twitter / X Header', width: 1500, height: 500 },
  { name: 'LinkedIn Banner', width: 1584, height: 396 },
  { name: 'HD 1080p', width: 1920, height: 1080 }
];

export default function ImageResizerPage() {
  const tool = getToolById('image-resizer')!;
  const [files, setFiles] = useState<FileItem[]>([]);
  const [width, setWidth] = useState<number>(1080);
  const [height, setHeight] = useState<number>(1080);
  const [originalAspectRatio, setOriginalAspectRatio] = useState<number>(1);
  const [lockAspect, setLockAspect] = useState(true);
  const [fitMode, setFitMode] = useState<'stretch' | 'contain' | 'cover'>('stretch');
  const [format, setFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadItems, setDownloadItems] = useState<DownloadItem[]>([]);

  useEffect(() => {
    if (files.length > 0) {
      loadImage(files[0].file).then((img) => {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        setWidth(w);
        setHeight(h);
        setOriginalAspectRatio(w / h);
      });
    }
  }, [files]);

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockAspect && originalAspectRatio > 0) {
      setHeight(Math.round(val / originalAspectRatio));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockAspect && originalAspectRatio > 0) {
      setWidth(Math.round(val * originalAspectRatio));
    }
  };

  const applyPreset = (presetW: number, presetH: number) => {
    setWidth(presetW);
    setHeight(presetH);
  };

  const handleResize = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const results: DownloadItem[] = [];
      for (const item of files) {
        const res = await resizeImage(item.file, {
          width,
          height,
          fitMode,
          format
        });
        results.push({
          name: res.outputFilename,
          blob: res.blob,
          originalSize: item.file.size
        });
      }
      setDownloadItems(results);
    } catch (err: any) {
      alert(`Error resizing image: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setDownloadItems([]);
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
            setDownloadItems([]);
          }}
          title="Upload images to resize"
          subtitle="Supports JPG, PNG, and WebP"
        />

        {files.length > 0 && downloadItems.length === 0 && (
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-base">
                <Maximize2 className="w-5 h-5 text-blue-600" />
                <span>Dimensions &amp; Aspect Ratio</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Popular Presets
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => applyPreset(p.width, p.height)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {p.name} ({p.width}×{p.height})
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Dimensions Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Width (px)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={width}
                  onChange={(e) => handleWidthChange(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Height (px)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={height}
                  onChange={(e) => handleHeightChange(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <button
                  onClick={() => setLockAspect(!lockAspect)}
                  className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                    lockAspect
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                      : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800'
                  }`}
                >
                  {lockAspect ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  <span>{lockAspect ? 'Aspect Ratio Locked' : 'Aspect Ratio Unlocked'}</span>
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Output Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-slate-800 dark:text-slate-200"
                >
                  <option value="image/jpeg">JPEG</option>
                  <option value="image/png">PNG</option>
                  <option value="image/webp">WebP</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleResize}
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isProcessing ? 'Resizing...' : `Resize ${files.length} ${files.length === 1 ? 'Image' : 'Images'}`}</span>
              </button>
            </div>
          </div>
        )}

        <DownloadBar
          items={downloadItems}
          zipName="pixelkit-resized-images.zip"
          onReset={handleReset}
          successTitle="Images Resized Successfully!"
        />
      </div>
    </ToolLayout>
  );
}
