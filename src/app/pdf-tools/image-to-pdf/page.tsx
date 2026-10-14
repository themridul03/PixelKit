'use client';

import React, { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { FileDropzone, FileItem } from '@/components/upload/FileDropzone';
import { DownloadBar, DownloadItem } from '@/components/download/DownloadBar';
import { getToolById } from '@/config/tools';
import { convertImagesToPdf, ImageToPdfOptions } from '@/lib/pdf/imageToPdf';
import { FileImage, Sparkles, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';

export default function ImageToPdfPage() {
  const tool = getToolById('image-to-pdf')!;
  const [files, setFiles] = useState<FileItem[]>([]);
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'a3' | 'fit'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [margin, setMargin] = useState<'none' | 'small' | 'medium' | 'large'>('small');
  const [addPageNumbers, setAddPageNumbers] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadItems, setDownloadItems] = useState<DownloadItem[]>([]);

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= files.length) return;
    const newFiles = [...files];
    const temp = newFiles[index];
    newFiles[index] = newFiles[targetIdx];
    newFiles[targetIdx] = temp;
    setFiles(newFiles);
  };

  const removeItem = (id: string) => {
    setFiles(files.filter((f) => f.id !== id));
  };

  const handleGeneratePdf = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    try {
      const rawFiles = files.map((f) => f.file);
      const res = await convertImagesToPdf(rawFiles, {
        pageSize,
        orientation,
        margin,
        addPageNumbers
      });

      setDownloadItems([
        {
          name: 'pixelkit-converted-document.pdf',
          blob: res.blob,
          originalSize: rawFiles.reduce((acc, f) => acc + f.size, 0)
        }
      ]);
    } catch (err: any) {
      alert(`Error creating PDF: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileDropzone
          acceptedFormats={['image/jpeg', 'image/png', 'image/webp']}
          maxFileSizeMB={60}
          multiple={true}
          files={files}
          onFilesChange={(newFiles) => {
            setFiles(newFiles);
            setDownloadItems([]);
          }}
          title="Upload photos to convert to PDF"
          subtitle="Add multiple images. You can reorder their sequence below."
        />

        {files.length > 0 && downloadItems.length === 0 && (
          <div className="space-y-6">
            {/* Reorderable image cards list */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Page Sequence ({files.length} {files.length === 1 ? 'Page' : 'Pages'})
                </span>
                <span className="text-xs text-slate-400">Use arrows to rearrange page order</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {files.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      {item.previewUrl && (
                        <img
                          src={item.previewUrl}
                          alt="Thumbnail"
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {item.file.name}
                        </p>
                        <p className="text-[10px] text-slate-400">{item.sizeFormatted}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveItem(index, 'up')}
                        disabled={index === 0}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveItem(index, 'down')}
                        disabled={index === files.length - 1}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Document layout settings */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-6">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-base">
                <FileImage className="w-5 h-5 text-blue-600" />
                <span>PDF Page Setup</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Page Size
                  </label>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-semibold"
                  >
                    <option value="a4">A4 (Standard International)</option>
                    <option value="letter">US Letter</option>
                    <option value="a3">A3 (Large Print)</option>
                    <option value="fit">Fit to Image Size</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Orientation
                  </label>
                  <select
                    value={orientation}
                    onChange={(e) => setOrientation(e.target.value as any)}
                    disabled={pageSize === 'fit'}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-semibold disabled:opacity-40"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Page Margins
                  </label>
                  <select
                    value={margin}
                    onChange={(e) => setMargin(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-semibold"
                  >
                    <option value="none">No Margin (Full Bleed)</option>
                    <option value="small">Small (0.25 in)</option>
                    <option value="medium">Medium (0.5 in)</option>
                    <option value="large">Large (0.75 in)</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addPageNumbers}
                      onChange={(e) => setAddPageNumbers(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <span>Add Page Numbers</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleGeneratePdf}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isProcessing ? 'Generating PDF...' : `Generate ${files.length}-Page PDF`}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <DownloadBar
          items={downloadItems}
          onReset={() => {
            setFiles([]);
            setDownloadItems([]);
          }}
          successTitle="PDF Generated Successfully!"
        />
      </div>
    </ToolLayout>
  );
}
