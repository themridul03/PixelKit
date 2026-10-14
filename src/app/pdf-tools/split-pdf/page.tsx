'use client';

import React, { useState, useEffect } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { FileDropzone, FileItem } from '@/components/upload/FileDropzone';
import { DownloadBar, DownloadItem } from '@/components/download/DownloadBar';
import { getToolById } from '@/config/tools';
import { parsePageRange, splitPdfByRange, splitPdfAllPages } from '@/lib/pdf/splitPdf';
import { PDFDocument } from 'pdf-lib';
import { Scissors, Sparkles, FileText, CheckCircle2 } from 'lucide-react';

export default function SplitPdfPage() {
  const tool = getToolById('split-pdf')!;
  const [files, setFiles] = useState<FileItem[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [splitMode, setSplitMode] = useState<'range' | 'all'>('range');
  const [rangeInput, setRangeInput] = useState('1');
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadItems, setDownloadItems] = useState<DownloadItem[]>([]);

  useEffect(() => {
    if (files.length > 0) {
      files[0].file.arrayBuffer().then((buf) => {
        PDFDocument.load(buf).then((doc) => {
          const count = doc.getPageCount();
          setTotalPages(count);
          setRangeInput(count > 1 ? `1-${Math.min(3, count)}` : '1');
        });
      });
    } else {
      setTotalPages(0);
    }
  }, [files]);

  const handleSplit = async () => {
    if (!files.length) return;
    setIsProcessing(true);

    try {
      const file = files[0].file;
      if (splitMode === 'all') {
        const pages = await splitPdfAllPages(file);
        setDownloadItems(
          pages.map((p) => ({
            name: p.name,
            blob: p.blob
          }))
        );
      } else {
        const targetPages = parsePageRange(rangeInput, totalPages);
        if (targetPages.length === 0) {
          alert('Please enter a valid page number or range (e.g. 1-3, 5)');
          setIsProcessing(false);
          return;
        }

        const res = await splitPdfByRange(file, targetPages);
        const baseName = file.name.replace(/\.pdf$/i, '');
        setDownloadItems([
          {
            name: `${baseName}_extracted_pages.pdf`,
            blob: res.blob,
            originalSize: file.size
          }
        ]);
      }
    } catch (err: any) {
      alert(`Error splitting PDF: ${err.message}`);
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
          title="Upload PDF document to split"
          subtitle="Extract single pages or split into multiple documents"
        />

        {files.length > 0 && totalPages > 0 && downloadItems.length === 0 && (
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-base">
                <Scissors className="w-5 h-5 text-blue-600" />
                <span>Split Options</span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                Total Pages: {totalPages}
              </span>
            </div>

            {/* Split Mode Radio selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setSplitMode('range')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  splitMode === 'range'
                    ? 'border-blue-500 bg-white dark:bg-slate-800 shadow-xs ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-sm text-slate-900 dark:text-white">
                  <input
                    type="radio"
                    name="splitMode"
                    checked={splitMode === 'range'}
                    onChange={() => setSplitMode('range')}
                    className="text-blue-600"
                  />
                  <span>Extract Page Range</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 pl-5">
                  Select specific pages to extract into one consolidated PDF file.
                </p>
              </div>

              <div
                onClick={() => setSplitMode('all')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  splitMode === 'all'
                    ? 'border-blue-500 bg-white dark:bg-slate-800 shadow-xs ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-sm text-slate-900 dark:text-white">
                  <input
                    type="radio"
                    name="splitMode"
                    checked={splitMode === 'all'}
                    onChange={() => setSplitMode('all')}
                    className="text-blue-600"
                  />
                  <span>Split Every Page into Separate Files</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 pl-5">
                  Creates {totalPages} separate 1-page PDF files bundled into a ZIP archive.
                </p>
              </div>
            </div>

            {/* Range input */}
            {splitMode === 'range' && (
              <div className="space-y-1.5 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Page Numbers / Ranges
                </label>
                <input
                  type="text"
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                  placeholder="e.g. 1-3, 5, 8-10"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm font-mono font-semibold"
                />
                <p className="text-[11px] text-slate-500">
                  Valid page range: 1 to {totalPages}. Separate individual pages or ranges with commas.
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSplit}
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isProcessing ? 'Splitting PDF...' : splitMode === 'all' ? `Split into ${totalPages} PDFs` : 'Extract Selected Pages'}</span>
              </button>
            </div>
          </div>
        )}

        <DownloadBar
          items={downloadItems}
          zipName={`${files[0]?.file.name.replace(/\.pdf$/i, '') || 'pixelkit'}_split_pages.zip`}
          onReset={() => {
            setFiles([]);
            setDownloadItems([]);
            setTotalPages(0);
          }}
          successTitle="PDF Pages Split Successfully!"
        />
      </div>
    </ToolLayout>
  );
}
