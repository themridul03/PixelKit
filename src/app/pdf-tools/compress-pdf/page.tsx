'use client';

import React, { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { FileDropzone, FileItem } from '@/components/upload/FileDropzone';
import { DownloadBar, DownloadItem } from '@/components/download/DownloadBar';
import { getToolById } from '@/config/tools';
import { compressPdf, PdfCompressResult } from '@/lib/pdf/compressPdf';
import { formatBytes } from '@/lib/utils/format';
import { Minimize2, Sparkles, ShieldCheck, Info } from 'lucide-react';

export default function CompressPdfPage() {
  const tool = getToolById('compress-pdf')!;
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadItems, setDownloadItems] = useState<DownloadItem[]>([]);
  const [compressResult, setCompressResult] = useState<PdfCompressResult | null>(null);

  const handleCompress = async () => {
    if (!files.length) return;
    setIsProcessing(true);

    try {
      const res = await compressPdf(files[0].file);
      setCompressResult(res);

      const baseName = files[0].file.name.replace(/\.pdf$/i, '');
      setDownloadItems([
        {
          name: `${baseName}_compressed.pdf`,
          blob: res.blob,
          originalSize: res.originalSize
        }
      ]);
    } catch (err: any) {
      alert(`Error optimizing PDF: ${err.message}`);
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
          multiple={false}
          files={files}
          onFilesChange={(newFiles) => {
            setFiles(newFiles);
            setDownloadItems([]);
            setCompressResult(null);
          }}
          title="Upload PDF document to compress"
          subtitle="Reduces stream overhead while preserving text sharpness"
        />

        {files.length > 0 && downloadItems.length === 0 && (
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-6">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-base">
              <Minimize2 className="w-5 h-5 text-blue-600" />
              <span>Optimization Profile</span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Lossless Vector Stream Compression</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Strips redundant PDF metadata, deduplicates dead object pointers, and applies compact cross-reference streams without rasterizing text so fonts remain crisp and searchable.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleCompress}
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isProcessing ? 'Optimizing PDF...' : 'Compress PDF Document'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Compression outcome notification */}
        {compressResult && !compressResult.isReduced && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-3">
            <Info className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Notice on Maximum Compression</p>
              <p className="mt-0.5 leading-relaxed">
                This document is already maximally compressed ({formatBytes(compressResult.originalSize)}). Further reduction without destructively downscaling embedded images is not possible.
              </p>
            </div>
          </div>
        )}

        <DownloadBar
          items={downloadItems}
          onReset={() => {
            setFiles([]);
            setDownloadItems([]);
            setCompressResult(null);
          }}
          successTitle="PDF Optimized Successfully!"
        />
      </div>
    </ToolLayout>
  );
}
