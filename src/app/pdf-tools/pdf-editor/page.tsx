'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { FileDropzone, FileItem } from '@/components/upload/FileDropzone';
import { DownloadBar, DownloadItem } from '@/components/download/DownloadBar';
import { getToolById } from '@/config/tools';
import { convertPdfToImages, RenderedPdfPage } from '@/lib/pdf/pdfToImage';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Edit3, Type, Sparkles, ChevronLeft, ChevronRight, PenTool } from 'lucide-react';

interface TextAnnotation {
  id: string;
  pageNumber: number;
  text: string;
  x: number;
  y: number;
  fontSize: number;
}

export default function PdfEditorPage() {
  const tool = getToolById('pdf-editor')!;
  const [files, setFiles] = useState<FileItem[]>([]);
  const [pages, setPages] = useState<RenderedPdfPage[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [textNotes, setTextNotes] = useState<TextAnnotation[]>([]);
  const [newNoteText, setNewNoteText] = useState('Reviewed & Approved');
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadItems, setDownloadItems] = useState<DownloadItem[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (files.length > 0) {
      setIsProcessing(true);
      convertPdfToImages(files[0].file, { scale: 1.2, format: 'image/jpeg' })
        .then((rendered) => {
          setPages(rendered);
          setCurrentPage(1);
          setTextNotes([]);
        })
        .finally(() => setIsProcessing(false));
    } else {
      setPages([]);
    }
  }, [files]);

  // Redraw current page canvas with annotations
  useEffect(() => {
    if (!pages.length || !canvasRef.current) return;
    const page = pages.find((p) => p.pageNumber === currentPage);
    if (!page) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = page.dataUrl;
    img.onload = () => {
      canvas.width = page.width;
      canvas.height = page.height;
      ctx.drawImage(img, 0, 0);

      // Draw annotations for this page
      const currentNotes = textNotes.filter((n) => n.pageNumber === currentPage);
      for (const note of currentNotes) {
        ctx.fillStyle = '#1e3a8a';
        ctx.font = `bold ${note.fontSize}px sans-serif`;
        ctx.fillText(note.text, note.x, note.y);
      }
    };
  }, [pages, currentPage, textNotes]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !newNoteText.trim()) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    setTextNotes((prev) => [
      ...prev,
      {
        id: `note-${Date.now()}`,
        pageNumber: currentPage,
        text: newNoteText,
        x: clickX,
        y: clickY,
        fontSize: 20
      }
    ]);
  };

  const handleExportAnnotatedPdf = async () => {
    if (!files.length) return;
    setIsProcessing(true);

    try {
      const arrayBuffer = await files[0].file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const pdfPages = pdfDoc.getPages();

      for (const note of textNotes) {
        if (note.pageNumber <= pdfPages.length) {
          const page = pdfPages[note.pageNumber - 1];
          const { width: pW, height: pH } = page.getSize();

          const renderedPage = pages.find((p) => p.pageNumber === note.pageNumber);
          if (renderedPage) {
            const ratioX = pW / renderedPage.width;
            const ratioY = pH / renderedPage.height;

            const pdfX = note.x * ratioX;
            // PDF origin is bottom-left, canvas origin is top-left
            const pdfY = pH - note.y * ratioY;

            page.drawText(note.text, {
              x: pdfX,
              y: pdfY,
              size: note.fontSize * ratioY,
              font,
              color: rgb(0.1, 0.2, 0.6)
            });
          }
        }
      }

      const pdfBytes = await pdfDoc.save();
      const baseName = files[0].file.name.replace(/\.pdf$/i, '');

      setDownloadItems([
        {
          name: `${baseName}_annotated.pdf`,
          blob: new Blob([pdfBytes as any], { type: 'application/pdf' }),
          originalSize: files[0].file.size
        }
      ]);
    } catch (err: any) {
      alert(`Error saving annotated PDF: ${err.message}`);
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
            setTextNotes([]);
          }}
          title="Upload PDF to annotate and sign"
          subtitle="View pages and click anywhere to place notes or text stamps"
        />

        {pages.length > 0 && downloadItems.length === 0 && (
          <div className="space-y-6">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Page {currentPage} of {pages.length}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(pages.length, p + 1))}
                  disabled={currentPage >= pages.length}
                  className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Text note input */}
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <Type className="w-4 h-4 text-blue-600 shrink-0" />
                <input
                  type="text"
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Type note, then click on document to place"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-semibold"
                />
              </div>

              <button
                onClick={handleExportAnnotatedPdf}
                disabled={isProcessing}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Save &amp; Download PDF</span>
              </button>
            </div>

            {/* Document viewer / canvas overlay */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-100 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="max-h-[600px] max-w-full rounded-lg shadow-md bg-white cursor-text"
              />
              <p className="text-xs text-slate-500 mt-3">
                Click anywhere on the page above to stamp &quot;{newNoteText}&quot;
              </p>
            </div>
          </div>
        )}

        <DownloadBar
          items={downloadItems}
          onReset={() => {
            setFiles([]);
            setPages([]);
            setDownloadItems([]);
            setTextNotes([]);
          }}
          successTitle="Annotated PDF Ready!"
        />
      </div>
    </ToolLayout>
  );
}
