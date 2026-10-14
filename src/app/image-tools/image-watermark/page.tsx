'use client';

import React, { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { FileDropzone, FileItem } from '@/components/upload/FileDropzone';
import { DownloadBar, DownloadItem } from '@/components/download/DownloadBar';
import { getToolById } from '@/config/tools';
import { watermarkImage, WatermarkPosition } from '@/lib/image/watermarkImage';
import { Stamp, Sparkles } from 'lucide-react';

export default function ImageWatermarkPage() {
  const tool = getToolById('image-watermark')!;
  const [files, setFiles] = useState<FileItem[]>([]);
  const [watermarkText, setWatermarkText] = useState('© PixelKit Confidential');
  const [position, setPosition] = useState<WatermarkPosition>('bottom-right');
  const [opacity, setOpacity] = useState(50);
  const [fontSize, setFontSize] = useState(36);
  const [color, setColor] = useState('#ffffff');
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadItems, setDownloadItems] = useState<DownloadItem[]>([]);

  const handleApplyWatermark = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    try {
      const results: DownloadItem[] = [];
      for (const item of files) {
        const res = await watermarkImage(item.file, {
          type: 'text',
          text: watermarkText,
          position,
          opacity: opacity / 100,
          fontSize,
          color,
          format: 'image/jpeg'
        });

        results.push({
          name: res.filename,
          blob: res.blob,
          originalSize: item.file.size
        });
      }
      setDownloadItems(results);
    } catch (err: any) {
      alert(`Error applying watermark: ${err.message}`);
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
          multiple={true}
          files={files}
          onFilesChange={(newFiles) => {
            setFiles(newFiles);
            setDownloadItems([]);
          }}
          title="Upload images to watermark"
          subtitle="Supports JPG, PNG, and WebP"
        />

        {files.length > 0 && downloadItems.length === 0 && (
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-6">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-base">
              <Stamp className="w-5 h-5 text-blue-600" />
              <span>Watermark Text &amp; Style</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Watermark Text
                </label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Position
                </label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value as WatermarkPosition)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white"
                >
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="top-left">Top Left</option>
                  <option value="center">Center</option>
                  <option value="tile">Repeated Diagonal Pattern</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>Opacity</span>
                  <span className="text-blue-600">{opacity}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Text Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-slate-300"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-28 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleApplyWatermark}
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isProcessing ? 'Watermarking...' : `Watermark ${files.length} ${files.length === 1 ? 'Image' : 'Images'}`}</span>
              </button>
            </div>
          </div>
        )}

        <DownloadBar
          items={downloadItems}
          zipName="pixelkit-watermarked-images.zip"
          onReset={() => {
            setFiles([]);
            setDownloadItems([]);
          }}
          successTitle="Watermark Applied Successfully!"
        />
      </div>
    </ToolLayout>
  );
}
