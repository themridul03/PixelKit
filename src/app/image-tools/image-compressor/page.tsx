'use client';

import React, { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { FileDropzone, FileItem } from '@/components/upload/FileDropzone';
import { DownloadBar, DownloadItem } from '@/components/download/DownloadBar';
import { getToolById } from '@/config/tools';
import { compressImage } from '@/lib/image/compressImage';
import { formatBytes } from '@/lib/utils/format';
import { Sparkles, Sliders, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ImageCompressorPage() {
  const tool = getToolById('image-compressor')!;
  const [files, setFiles] = useState<FileItem[]>([]);
  const [quality, setQuality] = useState(75);
  const [format, setFormat] = useState<'image/jpeg' | 'image/webp' | 'image/png'>('image/jpeg');
  const [maxWidth, setMaxWidth] = useState<number | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadItems, setDownloadItems] = useState<DownloadItem[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleCompress = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setStatusMessage('Compressing images in browser...');

    try {
      const results: DownloadItem[] = [];
      for (const item of files) {
        const res = await compressImage(item.file, {
          quality: quality / 100,
          format,
          maxWidth: maxWidth && maxWidth > 0 ? maxWidth : undefined
        });

        results.push({
          name: res.outputFilename,
          blob: res.blob,
          originalSize: res.originalSize
        });
      }
      setDownloadItems(results);
      setStatusMessage(null);
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setDownloadItems([]);
    setStatusMessage(null);
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {/* Step 1: Upload */}
        <FileDropzone
          acceptedFormats={['image/jpeg', 'image/png', 'image/webp']}
          maxFileSizeMB={50}
          multiple={true}
          files={files}
          onFilesChange={(newFiles) => {
            setFiles(newFiles);
            setDownloadItems([]);
          }}
          title="Upload images to compress"
          subtitle="Supports JPG, PNG, and WebP (up to 50 MB each)"
        />

        {/* Step 2: Controls */}
        {files.length > 0 && downloadItems.length === 0 && (
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-6">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-base">
              <Sliders className="w-5 h-5 text-blue-600" />
              <span>Compression Settings</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {/* Quality Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>Compression Quality</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">{quality}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="95"
                  step="5"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500">
                  {quality > 80 ? 'Near-lossless, larger file' : quality < 50 ? 'Aggressive size reduction' : 'Balanced visual quality and size'}
                </p>
              </div>

              {/* Output Format */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Output Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="image/jpeg">JPEG (Standard, widely compatible)</option>
                  <option value="image/webp">WebP (Modern, superior compression)</option>
                  <option value="image/png">PNG (Preserve alpha transparency)</option>
                </select>
              </div>

              {/* Optional Max Width */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Max Width (Optional)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 1920 (keep original if empty)"
                  value={maxWidth || ''}
                  onChange={(e) => setMaxWidth(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleCompress}
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isProcessing ? 'Compressing...' : `Compress ${files.length} ${files.length === 1 ? 'Image' : 'Images'}`}</span>
              </button>
            </div>
          </div>
        )}

        {/* Processing status */}
        {statusMessage && (
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-sm font-medium animate-pulse">
            {statusMessage}
          </div>
        )}

        {/* Step 3: Download */}
        <DownloadBar
          items={downloadItems}
          zipName="pixelkit-compressed-images.zip"
          onReset={handleReset}
          successTitle="Images Compressed Successfully!"
        />
      </div>
    </ToolLayout>
  );
}
