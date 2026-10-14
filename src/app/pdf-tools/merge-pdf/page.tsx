'use client';

import React, { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { FileDropzone, FileItem } from '@/components/upload/FileDropzone';
import { DownloadBar, DownloadItem } from '@/components/download/DownloadBar';
import { getToolById } from '@/config/tools';
import { mergePdfs } from '@/lib/pdf/mergePdf';
import { Layers, ArrowUp, ArrowDown, Trash2, Sparkles, FileText } from 'lucide-react';

export default function MergePdfPage() {
  const tool = getToolById('merge-pdf')!;
  const [files, setFiles] = useState<FileItem[]>([]);
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

  const handleMerge = async () => {
    if (files.length < 2) {
      alert('Please select at least 2 PDF files to merge.');
      return;
    }
    setIsProcessing(true);

    try {
      const rawFiles = files.map((f) => f.file);
      const res = await mergePdfs(rawFiles);

      setDownloadItems([
        {
          name: 'pixelkit-merged-document.pdf',
          blob: res.blob,
          originalSize: rawFiles.reduce((acc, f) => acc + f.size, 0)
        }
      ]);
    } catch (err: any) {
      alert(`Error merging PDFs: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileDropzone
          acceptedFormats={['application/pdf']}
          maxFileSizeMB={100}
          multiple={true}
          files={files}
          onFilesChange={(newFiles) => {
            setFiles(newFiles);
            setDownloadItems([]);
          }}
          title="Upload PDF files to merge"
          subtitle="Select 2 or more PDF documents"
        />

        {files.length > 0 && downloadItems.length === 0 && (
          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-base">
                  <Layers className="w-5 h-5 text-blue-600" />
                  <span>Merge Sequence ({files.length} Documents)</span>
                </div>
                <span className="text-xs text-slate-400">Rearrange document order before merging</span>
              </div>

              <div className="space-y-2">
                {files.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <div className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {item.file.name}
                        </p>
                        <p className="text-xs text-slate-500">{item.sizeFormatted}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveItem(index, 'up')}
                        disabled={index === 0}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveItem(index, 'down')}
                        disabled={index === files.length - 1}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleMerge}
                  disabled={files.length < 2 || isProcessing}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isProcessing ? 'Merging Documents...' : `Merge ${files.length} PDFs into One`}</span>
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
          successTitle="PDFs Merged Successfully!"
        />
      </div>
    </ToolLayout>
  );
}
