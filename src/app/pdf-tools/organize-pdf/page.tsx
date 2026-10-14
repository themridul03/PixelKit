'use client';

import React, { useState, useEffect } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { FileDropzone, FileItem } from '@/components/upload/FileDropzone';
import { DownloadBar, DownloadItem } from '@/components/download/DownloadBar';
import { getToolById } from '@/config/tools';
import { convertPdfToImages, RenderedPdfPage } from '@/lib/pdf/pdfToImage';
import { organizePdfPages, PageOrganizationItem } from '@/lib/pdf/organizePdf';
import { RotateCw, ArrowLeft, ArrowRight, Trash2, Grid, Sparkles } from 'lucide-react';

interface PageCardState {
  originalIndex: number;
  rotation: number;
  dataUrl?: string;
}

export default function OrganizePdfPage() {
  const tool = getToolById('organize-pdf')!;
  const [files, setFiles] = useState<FileItem[]>([]);
  const [pages, setPages] = useState<PageCardState[]>([]);
  const [isLoadingPreviews, setIsLoadingPreviews] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadItems, setDownloadItems] = useState<DownloadItem[]>([]);

  useEffect(() => {
    if (files.length > 0) {
      setIsLoadingPreviews(true);
      convertPdfToImages(files[0].file, { scale: 0.8, format: 'image/jpeg' })
        .then((rendered) => {
          setPages(
            rendered.map((r, i) => ({
              originalIndex: i,
              rotation: 0,
              dataUrl: r.dataUrl
            }))
          );
        })
        .finally(() => setIsLoadingPreviews(false));
    } else {
      setPages([]);
    }
  }, [files]);

  const rotatePage = (index: number) => {
    setPages((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], rotation: (next[index].rotation + 90) % 360 };
      return next;
    });
  };

  const rotateAll = () => {
    setPages((prev) =>
      prev.map((p) => ({ ...p, rotation: (p.rotation + 90) % 360 }))
    );
  };

  const movePage = (index: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= pages.length) return;
    const next = [...pages];
    const temp = next[index];
    next[index] = next[targetIdx];
    next[targetIdx] = temp;
    setPages(next);
  };

  const deletePage = (index: number) => {
    if (pages.length <= 1) {
      alert('A PDF document must retain at least one page.');
      return;
    }
    setPages(pages.filter((_, i) => i !== index));
  };

  const handleExport = async () => {
    if (!files.length || !pages.length) return;
    setIsProcessing(true);

    try {
      const orderItems: PageOrganizationItem[] = pages.map((p) => ({
        originalIndex: p.originalIndex,
        rotation: p.rotation
      }));

      const res = await organizePdfPages(files[0].file, orderItems);
      const baseName = files[0].file.name.replace(/\.pdf$/i, '');

      setDownloadItems([
        {
          name: `${baseName}_organized.pdf`,
          blob: res.blob,
          originalSize: files[0].file.size
        }
      ]);
    } catch (err: any) {
      alert(`Error organizing PDF: ${err.message}`);
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
            setPages([]);
            setDownloadItems([]);
          }}
          title="Upload PDF to organize, rotate, and delete pages"
          subtitle="Supports multi-page documents"
        />

        {isLoadingPreviews && (
          <div className="p-6 text-center text-slate-500 font-medium animate-pulse">
            Generating page thumbnails in browser...
          </div>
        )}

        {pages.length > 0 && downloadItems.length === 0 && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Grid className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  Document Pages ({pages.length})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={rotateAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Rotate All 90°</span>
                </button>
              </div>
            </div>

            {/* Page grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {pages.map((p, index) => (
                <div
                  key={`${p.originalIndex}-${index}`}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-3 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between space-y-3 group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                    <span>Page {index + 1}</span>
                    {p.rotation > 0 && (
                      <span className="text-[10px] text-blue-600 font-semibold">{p.rotation}°</span>
                    )}
                  </div>

                  <div className="aspect-[3/4] bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center p-1 border border-slate-200 dark:border-slate-700">
                    {p.dataUrl ? (
                      <img
                        src={p.dataUrl}
                        alt={`Page ${index + 1}`}
                        style={{ transform: `rotate(${p.rotation}deg)` }}
                        className="w-full h-full object-contain transition-transform duration-200"
                      />
                    ) : (
                      <span className="text-xs text-slate-400">Loading...</span>
                    )}
                  </div>

                  {/* Actions for this page */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => movePage(index, 'left')}
                        disabled={index === 0}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20"
                        title="Move left"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => movePage(index, 'right')}
                        disabled={index === pages.length - 1}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20"
                        title="Move right"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => rotatePage(index)}
                        className="p-1 rounded text-slate-400 hover:text-blue-600"
                        title="Rotate 90 degrees"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deletePage(index)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600"
                        title="Delete page"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleExport}
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isProcessing ? 'Saving PDF...' : `Save & Download Reorganized PDF`}</span>
              </button>
            </div>
          </div>
        )}

        <DownloadBar
          items={downloadItems}
          onReset={() => {
            setFiles([]);
            setPages([]);
            setDownloadItems([]);
          }}
          successTitle="Reorganized PDF Ready!"
        />
      </div>
    </ToolLayout>
  );
}
