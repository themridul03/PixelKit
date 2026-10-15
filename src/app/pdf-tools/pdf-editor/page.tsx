'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { FileDropzone, FileItem } from '@/components/upload/FileDropzone';
import { getToolById } from '@/config/tools';
import { convertPdfToImages, RenderedPdfPage } from '@/lib/pdf/pdfToImage';
import {
  extractEditableTextFromPdf,
  applyTextEditsToPdf,
  EditableTextItem
} from '@/lib/pdf/pdfTextEditor';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { downloadBlob } from '@/lib/utils/download';
import {
  Edit3,
  Type,
  PenTool,
  Highlighter,
  Square,
  Stamp,
  RotateCcw,
  Download,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Eye,
  FileCheck,
  Sparkles,
  Layers,
  Check,
  X
} from 'lucide-react';

type EditorTab = 'edit-text' | 'annotate';

export default function PdfEditorPage() {
  const tool = getToolById('pdf-editor')!;
  const [files, setFiles] = useState<FileItem[]>([]);
  const [pages, setPages] = useState<RenderedPdfPage[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Active Mode: 'edit-text' (Direct in-place text editing) or 'annotate' (Sign/Draw/Stamp)
  const [activeTab, setActiveTab] = useState<EditorTab>('edit-text');

  // Text Elements from PDF by page
  const [textByPage, setTextByPage] = useState<Record<number, EditableTextItem[]>>({});
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [editingString, setEditingString] = useState<string>('');

  // Annotation states
  const [annotateTool, setAnnotateTool] = useState<'draw' | 'highlight' | 'redact' | 'stamp'>('draw');
  const [currentColor, setCurrentColor] = useState<string>('#1e40af');
  const [brushSize, setBrushSize] = useState<number>(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingsByPage, setDrawingsByPage] = useState<Record<number, ImageData | null>>({});

  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportedPdfUrl, setExportedPdfUrl] = useState<string | null>(null);

  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  // Load PDF, render pages, and extract in-place text items
  useEffect(() => {
    if (files.length > 0) {
      setIsProcessing(true);
      setExportedPdfUrl(null);
      setSelectedTextId(null);
      setDrawingsByPage({});

      Promise.all([
        convertPdfToImages(files[0].file, { scale: 1.4, format: 'image/jpeg' }),
        extractEditableTextFromPdf(files[0].file)
      ])
        .then(([renderedPages, extractedTexts]) => {
          setPages(renderedPages);
          setTextByPage(extractedTexts);
          setCurrentPage(1);
        })
        .catch((err) => {
          console.error('PDF load error:', err);
          alert(`Error loading PDF: ${err.message}`);
        })
        .finally(() => setIsProcessing(false));
    } else {
      setPages([]);
      setTextByPage({});
      setExportedPdfUrl(null);
    }
  }, [files]);

  const currentPageItems = textByPage[currentPage] || [];
  const currentPageImage = pages.find((p) => p.pageNumber === currentPage);

  // When user clicks a text item to edit
  const handleSelectTextItem = (item: EditableTextItem) => {
    setSelectedTextId(item.id);
    setEditingString(item.str);
  };

  // Commit updated text
  const handleSaveTextChange = (id: string) => {
    setTextByPage((prev) => {
      const pageList = prev[currentPage] || [];
      const updated = pageList.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            str: editingString,
            isModified: editingString !== item.originalStr
          };
        }
        return item;
      });
      return { ...prev, [currentPage]: updated };
    });
    setSelectedTextId(null);
  };

  // Reset text back to original
  const handleResetTextItem = (id: string) => {
    setTextByPage((prev) => {
      const pageList = prev[currentPage] || [];
      const updated = pageList.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            str: item.originalStr,
            isModified: false
          };
        }
        return item;
      });
      return { ...prev, [currentPage]: updated };
    });
    if (selectedTextId === id) setSelectedTextId(null);
  };

  // Synchronize drawing canvas with current page dimensions
  useEffect(() => {
    if (!drawCanvasRef.current || !currentPageImage) return;
    const draw = drawCanvasRef.current;
    draw.width = currentPageImage.width;
    draw.height = currentPageImage.height;

    const dCtx = draw.getContext('2d');
    if (dCtx && drawingsByPage[currentPage]) {
      dCtx.putImageData(drawingsByPage[currentPage]!, 0, 0);
    } else if (dCtx) {
      dCtx.clearRect(0, 0, draw.width, draw.height);
    }
  }, [currentPage, drawingsByPage, currentPageImage]);

  const saveDrawingState = () => {
    if (!drawCanvasRef.current) return;
    const dCtx = drawCanvasRef.current.getContext('2d');
    if (!dCtx) return;
    const imgData = dCtx.getImageData(0, 0, drawCanvasRef.current.width, drawCanvasRef.current.height);
    setDrawingsByPage((prev) => ({ ...prev, [currentPage]: imgData }));
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTab !== 'annotate' || annotateTool !== 'draw') return;
    const { x, y } = getCanvasCoords(e);
    setIsDrawing(true);
    lastPosRef.current = { x, y };

    const dCtx = drawCanvasRef.current?.getContext('2d');
    if (dCtx) {
      dCtx.strokeStyle = currentColor;
      dCtx.lineWidth = brushSize;
      dCtx.lineCap = 'round';
      dCtx.lineJoin = 'round';
      dCtx.beginPath();
      dCtx.moveTo(x, y);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || activeTab !== 'annotate' || !lastPosRef.current || !drawCanvasRef.current) return;
    const { x, y } = getCanvasCoords(e);
    const dCtx = drawCanvasRef.current.getContext('2d');
    if (!dCtx) return;

    dCtx.lineTo(x, y);
    dCtx.stroke();
    lastPosRef.current = { x, y };
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      lastPosRef.current = null;
      saveDrawingState();
    }
  };

  // Total modified count across all pages
  const totalModified = Object.values(textByPage).reduce(
    (acc, list) => acc + list.filter((i) => i.isModified).length,
    0
  );

  // Save & Export PDF: preserving original fonts and format
  const handleExportEditedPdf = async () => {
    if (!files.length) return;
    setIsExporting(true);

    try {
      // 1. Apply exact in-place font replacements
      const { blob: textEditedBlob } = await applyTextEditsToPdf(files[0].file, textByPage);

      // 2. If drawings/signatures were added, embed them
      let finalBlob = textEditedBlob;
      const pagesWithDrawings = Object.keys(drawingsByPage).filter((p) => drawingsByPage[Number(p)]);

      if (pagesWithDrawings.length > 0) {
        const buffer = await textEditedBlob.arrayBuffer();
        const pdfDoc = await PDFDocument.load(buffer);
        const pdfPages = pdfDoc.getPages();

        for (const pStr of pagesWithDrawings) {
          const pNum = Number(pStr);
          const page = pdfPages[pNum - 1];
          const imgData = drawingsByPage[pNum];
          const rendered = pages.find((p) => p.pageNumber === pNum);

          if (page && imgData && rendered) {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = rendered.width;
            tempCanvas.height = rendered.height;
            const tCtx = tempCanvas.getContext('2d');
            if (tCtx) {
              tCtx.putImageData(imgData, 0, 0);
              const pngData = tempCanvas.toDataURL('image/png');
              const png = await pdfDoc.embedPng(pngData);
              const { width: pW, height: pH } = page.getSize();
              page.drawImage(png, { x: 0, y: 0, width: pW, height: pH });
            }
          }
        }
        const savedBytes = await pdfDoc.save();
        finalBlob = new Blob([savedBytes as any], { type: 'application/pdf' });
      }

      const url = URL.createObjectURL(finalBlob);
      setExportedPdfUrl(url);

      const baseName = files[0].file.name.replace(/\.pdf$/i, '');
      downloadBlob(finalBlob, `${baseName}_edited.pdf`);
    } catch (err: any) {
      console.error('Export error:', err);
      alert(`Error saving PDF: ${err.message}`);
    } finally {
      setIsExporting(false);
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
          onFilesChange={(newFiles) => setFiles(newFiles)}
          title="Upload PDF document to edit text in-place"
          subtitle="Click any text in the document to edit while preserving exact original fonts and layout"
        />

        {isProcessing && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <RefreshCw className="w-5 h-5 text-blue-600 animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Extracting text streams, font families, and page coordinates...
            </p>
          </div>
        )}

        {pages.length > 0 && currentPageImage && (
          <div className="space-y-4">
            {/* Top Toolbar & Mode Selector */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Tabs: Edit Text (Same Font) vs Sign / Draw */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  onClick={() => setActiveTab('edit-text')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'edit-text'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Type className="w-3.5 h-3.5" />
                  <span>Edit Text (Same Font &amp; Format)</span>
                </button>

                <button
                  onClick={() => setActiveTab('annotate')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'annotate'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Sign &amp; Freehand</span>
                </button>
              </div>

              {/* Page Navigator & Zoom Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                  Page {currentPage} of {pages.length}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(pages.length, p + 1))}
                  disabled={currentPage >= pages.length}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

                <button
                  onClick={() => setZoomLevel((z) => Math.max(60, z - 15))}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-mono text-slate-500">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(150, z + 15))}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Save & Export Button */}
              <button
                onClick={handleExportEditedPdf}
                disabled={isExporting}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 transition-all disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Generating Edited PDF...
                  </>
                ) : (
                  <>
                    <FileCheck className="w-3.5 h-3.5" />
                    Save &amp; Download PDF {totalModified > 0 && `(${totalModified} Edits)`}
                  </>
                )}
              </button>
            </div>

            {/* Instruction Banner */}
            {activeTab === 'edit-text' ? (
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-3 flex items-center justify-between gap-3 text-xs text-blue-900 dark:text-blue-300">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    <strong>Exact Font Preservation:</strong> Click on any word or sentence in the document below to edit it. The original font family (Helvetica, Times Roman, or Courier), size, and bold/italic style will be perfectly matched.
                  </span>
                </div>
                {totalModified > 0 && (
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                    {totalModified} text modification{totalModified === 1 ? '' : 's'} active
                  </span>
                )}
              </div>
            ) : (
              <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-3 flex items-center gap-3 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Signature / Pen Thickness:</span>
                <input
                  type="range"
                  min={1}
                  max={6}
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-24 accent-blue-600"
                />
                <span className="font-mono text-slate-500">{brushSize}px</span>
                <span className="text-slate-400">• Drag on the document to draw signatures.</span>
              </div>
            )}

            {/* Main Interactive Document Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 3 Cols: Page Thumbnails & Modified Elements */}
              <div className="lg:col-span-3 space-y-4 max-h-[750px] overflow-y-auto pr-1">
                {/* Thumbnails */}
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                    Document Pages
                  </span>
                  <div className="space-y-2">
                    {pages.map((p) => {
                      const isCurrent = p.pageNumber === currentPage;
                      const pageMods = (textByPage[p.pageNumber] || []).filter((i) => i.isModified).length;
                      return (
                        <button
                          key={p.pageNumber}
                          onClick={() => {
                            setCurrentPage(p.pageNumber);
                            setSelectedTextId(null);
                          }}
                          className={`w-full p-2 rounded-xl border text-left flex items-center gap-3 transition-all ${
                            isCurrent
                              ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
                          }`}
                        >
                          <div className="w-12 h-16 rounded border border-slate-300 dark:border-slate-700 overflow-hidden bg-white shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={p.dataUrl} alt={`Page ${p.pageNumber}`} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              Page {p.pageNumber}
                            </span>
                            {pageMods > 0 && (
                              <span className="block text-[10px] text-emerald-600 font-bold mt-0.5">
                                {pageMods} edited
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Modified items list on this page */}
                {currentPageItems.filter((i) => i.isModified).length > 0 && (
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Edits on Page {currentPage}
                    </span>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {currentPageItems
                        .filter((i) => i.isModified)
                        .map((item) => (
                          <div
                            key={item.id}
                            className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-emerald-600 truncate max-w-[120px]">
                                {item.str}
                              </span>
                              <button
                                onClick={() => handleResetTextItem(item.id)}
                                className="text-[10px] text-red-500 hover:underline"
                                title="Reset to original text"
                              >
                                Revert
                              </button>
                            </div>
                            <span className="text-[10px] text-slate-400 block line-through truncate">
                              {item.originalStr}
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono block">
                              Font: {item.fontCategory} {item.isBold ? 'Bold' : ''} ({item.fontSize}pt)
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right 9 Cols: Interactive In-Place PDF Canvas */}
              <div className="lg:col-span-9 bg-slate-950 rounded-2xl border border-slate-800 p-4 flex items-center justify-center overflow-auto min-h-[650px] relative select-none">
                <div
                  style={{
                    transform: `scale(${zoomLevel / 100})`,
                    transformOrigin: 'top center',
                    width: currentPageImage.width,
                    height: currentPageImage.height
                  }}
                  className="relative transition-transform duration-100 shadow-2xl rounded bg-white overflow-hidden"
                >
                  {/* Layer 1: Base PDF Page Render */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentPageImage.dataUrl}
                    alt={`PDF Page ${currentPage}`}
                    className="w-full h-full block pointer-events-none select-none"
                  />

                  {/* Layer 2: In-Place Text Replacement Overlays (Same Font & Format) */}
                  {activeTab === 'edit-text' && (
                    <div className="absolute inset-0 z-20 pointer-events-auto">
                      {currentPageItems.map((item) => {
                        const isSelected = selectedTextId === item.id;
                        return (
                          <div
                            key={item.id}
                            style={{
                              left: `${item.leftPercent}%`,
                              top: `${item.topPercent}%`,
                              minWidth: `${item.widthPercent}%`
                            }}
                            className="absolute -translate-y-1"
                          >
                            {isSelected ? (
                              /* Inline Editing Input */
                              <div className="relative z-30 flex items-center gap-1 bg-white dark:bg-slate-900 border-2 border-blue-500 shadow-xl rounded px-1.5 py-0.5">
                                <input
                                  type="text"
                                  value={editingString}
                                  onChange={(e) => setEditingString(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveTextChange(item.id);
                                    if (e.key === 'Escape') setSelectedTextId(null);
                                  }}
                                  autoFocus
                                  style={{
                                    fontFamily:
                                      item.fontCategory === 'serif'
                                        ? 'Times New Roman, serif'
                                        : item.fontCategory === 'mono'
                                        ? 'Courier New, monospace'
                                        : 'Helvetica, Arial, sans-serif',
                                    fontWeight: item.isBold ? 'bold' : 'normal',
                                    fontStyle: item.isItalic ? 'italic' : 'normal',
                                    fontSize: `${item.fontSize}px`
                                  }}
                                  className="outline-none text-slate-900 dark:text-white bg-transparent min-w-[120px]"
                                />
                                <button
                                  onClick={() => handleSaveTextChange(item.id)}
                                  className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                                  title="Save change"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => setSelectedTextId(null)}
                                  className="p-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300"
                                  title="Cancel"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              /* Clickable In-Place Text Box */
                              <button
                                onClick={() => handleSelectTextItem(item)}
                                style={{
                                  fontFamily:
                                    item.fontCategory === 'serif'
                                      ? 'Times New Roman, serif'
                                      : item.fontCategory === 'mono'
                                      ? 'Courier New, monospace'
                                      : 'Helvetica, Arial, sans-serif',
                                  fontWeight: item.isBold ? 'bold' : 'normal',
                                  fontStyle: item.isItalic ? 'italic' : 'normal',
                                  fontSize: `${item.fontSize}px`
                                }}
                                className={`text-left rounded px-0.5 transition-all ${
                                  item.isModified
                                    ? 'bg-white text-blue-700 border border-blue-400 font-semibold shadow-xs'
                                    : 'hover:bg-blue-500/20 hover:outline-dashed hover:outline-1 hover:outline-blue-500 text-transparent'
                                }`}
                                title={`Click to edit text (Detected Font: ${item.fontCategory} ${item.isBold ? 'Bold' : ''})`}
                              >
                                {item.isModified ? item.str : item.str}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Layer 3: Drawing / Signature Canvas Layer */}
                  {activeTab === 'annotate' && (
                    <canvas
                      ref={drawCanvasRef}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      className="absolute inset-0 z-30 cursor-crosshair"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
