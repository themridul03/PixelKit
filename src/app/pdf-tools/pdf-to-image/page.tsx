'use client';

import React, { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { FileDropzone, FileItem } from '@/components/upload/FileDropzone';
import { DownloadBar, DownloadItem } from '@/components/download/DownloadBar';
import { getToolById } from '@/config/tools';
import { convertPdfToImages, RenderedPdfPage } from '@/lib/pdf/pdfToImage';
import { Image as ImageIcon, Sparkles, Download, Layers } from 'lucide-react';
import { downloadBlob } from '@/lib/utils/download';

export default function PdfToImagePage() {
  const tool = getToolById('pdf-to-image')!;
  const [files, setFiles] = useState<FileItem[]>([]);
  const [format, setFormat] = useState<'image/jpeg' | 'image/png'>('image/jpeg');
  const [scale, setScale] = useState<number>(1.5); // 1.5x gives crisp 150-200 DPI
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressText, setProgressText] = useState<string | null>(null);
  const [renderedPages, setRenderedPages] = useState<RenderedPdfPage[]>([]);
  const [downloadItems, setDownloadItems] = useState<DownloadItem[]>([]);

  const handleConvertPdf = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setProgressText('Loading PDF engine...');

    try {
      const pages = await convertPdfToImages(files[0].file, {
        scale,
        format,
        onProgress: (cur, tot) => {
          setProgressText(`Rendering page ${cur} of ${tot}...`);
        }
      });

      setRenderedPages(pages);
      const ext = format === 'image/png' ? 'png' : 'jpg';
      const baseName = files[0].file.name.replace(/\.pdf$/i, '');

      const items: DownloadItem[] = pages.map((p) => ({
        name: `${baseName}_page_${p.pageNumber}.${ext}`,
        blob: p.blob
      }));

      setDownloadItems(items);
      setProgressText(null);
    } catch (err: any) {
      alert(`Error converting PDF to images: ${err.message}`);
      setProgressText(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadSinglePage = (page: RenderedPdfPage) => {
    const ext = format === 'image/png' ? 'png' : 'jpg';
    const baseName = files[0]?.file.name.replace(/\.pdf$/i, '') || 'document';
    downloadBlob(page.blob, `${baseName}_page_${page.pageNumber}.${ext}`);
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
            setRenderedPages([]);
            setDownloadItems([]);
            setProgressText(null);
          }}
          title="Upload PDF document to extract images"
          subtitle="Supports multi-page PDFs (up to 100 MB)"
        />

        {files.length > 0 && renderedPages.length === 0 && (
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-6">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-base">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              <span>Image Output Quality</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Image Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-semibold"
                >
                  <option value="image/jpeg">JPG / JPEG (Compact file size)</option>
                  <option value="image/png">PNG (Lossless sharpness)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Resolution Scale
                </label>
                <select
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-semibold"
                >
                  <option value={1}>1.0x (Standard Web Preview - ~72 DPI)</option>
                  <option value={1.5}>1.5x (Crisp Reading Quality - ~150 DPI)</option>
                  <option value={2}>2.0x (High-Res Print Quality - ~300 DPI)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleConvertPdf}
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isProcessing ? (progressText || 'Processing...') : 'Extract Pages to Images'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Live progress indicator */}
        {progressText && (
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-sm font-medium flex items-center gap-2 animate-pulse">
            <Layers className="w-4 h-4 animate-spin" />
            <span>{progressText}</span>
          </div>
        )}

        {/* Rendered Pages Gallery */}
        {renderedPages.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Rendered Pages ({renderedPages.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {renderedPages.map((page) => (
                <div
                  key={page.pageNumber}
                  className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden aspect-[3/4] flex items-center justify-center border border-slate-200 dark:border-slate-700">
                    <img
                      src={page.dataUrl}
                      alt={`Page ${page.pageNumber}`}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Page {page.pageNumber}
                    </span>
                    <button
                      onClick={() => handleDownloadSinglePage(page)}
                      className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700"
                      title="Download Page"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <DownloadBar
          items={downloadItems}
          zipName={`${files[0]?.file.name.replace(/\.pdf$/i, '') || 'pixelkit'}_images.zip`}
          onReset={() => {
            setFiles([]);
            setRenderedPages([]);
            setDownloadItems([]);
          }}
          successTitle="Pages Converted to Images!"
        />
      </div>
    </ToolLayout>
  );
}
