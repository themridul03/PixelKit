'use client';

import React, { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { FileDropzone, FileItem } from '@/components/upload/FileDropzone';
import { getToolById } from '@/config/tools';
import {
  parseSpreadsheetFile,
  convertSpreadsheetToPdf,
  ParsedSpreadsheet,
  ExcelToPdfOptions
} from '@/lib/document/excelToPdf';
import { downloadBlob } from '@/lib/utils/download';
import {
  Table,
  Download,
  FileSpreadsheet,
  Eye,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Settings,
  Layers
} from 'lucide-react';

export default function ExcelToPdfPage() {
  const tool = getToolById('excel-to-pdf')!;
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [parsed, setParsed] = useState<ParsedSpreadsheet | null>(null);
  const [reportTitle, setReportTitle] = useState('');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [fontSize, setFontSize] = useState<number>(9);

  const [generatedPdf, setGeneratedPdf] = useState<{
    url: string;
    blob: Blob;
    pageCount: number;
    size: number;
  } | null>(null);

  const handleFilesChange = async (newFiles: FileItem[]) => {
    setFiles(newFiles);
    setParsed(null);
    setGeneratedPdf(null);
    setError(null);

    if (newFiles.length === 0) return;

    setIsParsing(true);
    try {
      const file = newFiles[0].file;
      const data = await parseSpreadsheetFile(file);
      if (data.headers.length === 0 && data.rows.length === 0) {
        setError('This spreadsheet appears to be empty or has no recognizable table data.');
      } else {
        setParsed(data);
        const rawName = file.name.replace(/\.[^/.]+$/, '').replace(/[_.-]+/g, ' ');
        setReportTitle(rawName);
      }
    } catch (err: any) {
      console.error('Failed to parse spreadsheet:', err);
      setError(err?.message || 'Failed to read workbook. Please verify the file is a valid .xlsx, .xls, or .csv.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleGenerate = async () => {
    if (!parsed) return;
    setIsGenerating(true);
    try {
      const options: ExcelToPdfOptions = {
        title: reportTitle.trim() || undefined,
        orientation,
        fontSize
      };

      const result = await convertSpreadsheetToPdf(parsed.headers, parsed.rows, options);
      const url = URL.createObjectURL(result.blob);
      setGeneratedPdf({
        url,
        blob: result.blob,
        pageCount: result.pageCount,
        size: result.size
      });
    } catch (err: any) {
      console.error('Failed to convert spreadsheet to PDF:', err);
      alert(`Error creating PDF: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedPdf) return;
    const cleanName = (reportTitle || 'spreadsheet_report').replace(/[^a-zA-Z0-9_-]/g, '_');
    downloadBlob(generatedPdf.blob, `${cleanName}.pdf`);
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileDropzone
          acceptedFormats={[
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv',
            '.xlsx',
            '.xls',
            '.csv'
          ]}
          maxFileSizeMB={50}
          multiple={false}
          files={files}
          onFilesChange={handleFilesChange}
          title="Upload Excel workbook or CSV file"
          subtitle="Supports .xlsx, .xls, and .csv files up to 50MB"
        />

        {isParsing && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <RefreshCw className="w-5 h-5 text-blue-600 animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Parsing workbook sheets and data rows...
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-red-900 dark:text-red-200">
                Spreadsheet Read Error
              </h4>
              <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {parsed && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Table Preview */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Table className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Table Preview ({parsed.activeSheetName})
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {parsed.rows.length} rows • {parsed.headers.length} columns
                  </span>
                </div>

                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 sticky top-0 border-b border-slate-200 dark:border-slate-700 z-10">
                      <tr>
                        <th className="p-2.5 text-slate-400 text-center w-10 border-r border-slate-200 dark:border-slate-700 font-mono text-[11px]">
                          #
                        </th>
                        {parsed.headers.map((h, i) => (
                          <th
                            key={i}
                            className="p-2.5 font-semibold text-slate-700 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700 whitespace-nowrap min-w-[100px]"
                          >
                            {h || `Col ${i + 1}`}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                      {parsed.rows.slice(0, 25).map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50">
                          <td className="p-2 text-slate-400 text-center border-r border-slate-100 dark:border-slate-800 select-none text-[11px]">
                            {rIdx + 1}
                          </td>
                          {row.map((cell, cIdx) => (
                            <td
                              key={cIdx}
                              className="p-2 text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800 whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis"
                              title={cell}
                            >
                              {cell || <span className="text-slate-300 dark:text-slate-600">-</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {parsed.rows.length > 25 && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-center text-[11px] text-slate-500">
                    Showing first 25 rows for preview. All {parsed.rows.length} rows will be paginated into your PDF.
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: PDF Layout Options */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <Settings className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    PDF Formatting Controls
                  </h3>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Document Header Title
                  </label>
                  <input
                    type="text"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    placeholder="Report title..."
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Page Orientation
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOrientation('landscape')}
                      className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                        orientation === 'landscape'
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-700 dark:bg-emerald-950/50 dark:border-emerald-500 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Landscape (Wide)
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrientation('portrait')}
                      className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                        orientation === 'portrait'
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-700 dark:bg-emerald-950/50 dark:border-emerald-500 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Portrait
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Landscape is strongly recommended for tables with 4 or more columns.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Table Font Size</span>
                    <span className="text-slate-500">{fontSize} pt</span>
                  </div>
                  <input
                    type="range"
                    min={7}
                    max={12}
                    step={1}
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full mt-3 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm shadow-emerald-600/20 transition-all disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Rendering Table PDF...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="w-4 h-4" />
                      Convert to PDF Report
                    </>
                  )}
                </button>
              </div>

              {generatedPdf && (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                        PDF Table Ready!
                      </h4>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                        {generatedPdf.pageCount} page(s) • {(generatedPdf.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      onClick={handleDownload}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-sm shadow-emerald-600/20"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download PDF
                    </button>
                    <a
                      href={generatedPdf.url}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-medium hover:bg-emerald-100/50 dark:hover:bg-emerald-900/40 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Preview in New Tab
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
