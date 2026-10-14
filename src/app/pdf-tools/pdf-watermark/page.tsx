'use client';

import React, { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { FileDropzone, FileItem } from '@/components/upload/FileDropzone';
import { DownloadBar, DownloadItem } from '@/components/download/DownloadBar';
import { getToolById } from '@/config/tools';
import { addWatermarkToPdf } from '@/lib/pdf/watermarkPdf';
import { FileCheck, Sparkles } from 'lucide-react';

export default function PdfWatermarkPage() {
  const tool = getToolById('pdf-watermark')!;
  const [files, setFiles] = useState<FileItem[]>([]);
  const [text, setText] = useState('CONFIDENTIAL');
  const [fontSize, setFontSize] = useState(54);
  const [opacity, setOpacity] = useState(25);
  const [rotation, setRotation] = useState(45);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadItems, setDownloadItems] = useState<DownloadItem[]>([]);

  const handleApplyWatermark = async () => {
    if (!files.length) return;
    setIsProcessing(true);

    try {
      const res = await addWatermarkToPdf(files[0].file, {
        text,
        fontSize,
        opacity: opacity / 100,
        rotation
      });

      const baseName = files[0].file.name.replace(/\.pdf$/i, '');
      setDownloadItems([
        {
          name: `${baseName}_watermarked.pdf`,
          blob: res.blob,
          originalSize: files[0].file.size
        }
      ]);
    } catch (err: any) {
      alert(`Error applying watermark to PDF: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileDropzone
          acceptedFormats={['application/pdf']}
          maxFileSizeMB={80}
          multiple={false}
          files={files}
          onFilesChange={(newFiles) => {
            setFiles(newFiles);
            setDownloadItems([]);
          }}
          title="Upload PDF to add watermark"
          subtitle="Stamp all pages with confidential, draft, or copyright marks"
        />

        {files.length > 0 && downloadItems.length === 0 && (
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-6">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-base">
              <FileCheck className="w-5 h-5 text-blue-600" />
              <span>Watermark Text &amp; Opacity</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Watermark Stamp Text
                </label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="e.g. CONFIDENTIAL, DRAFT, COPY"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Rotation Angle
                </label>
                <select
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-semibold"
                >
                  <option value={45}>45° Diagonal (Standard Stamp)</option>
                  <option value={0}>0° Horizontal</option>
                  <option value={90}>90° Vertical</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>Opacity</span>
                  <span className="text-blue-600 font-bold">{opacity}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="80"
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer pt-2"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleApplyWatermark}
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isProcessing ? 'Watermarking PDF...' : 'Apply Watermark to PDF'}</span>
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
          successTitle="Watermark Applied to PDF!"
        />
      </div>
    </ToolLayout>
  );
}
