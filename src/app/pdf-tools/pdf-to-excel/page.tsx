'use client';

import React, { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { FileDropzone, FileItem } from '@/components/upload/FileDropzone';
import { getToolById } from '@/config/tools';
import { extractPdfToTable, exportTableToXlsx, exportTableToCsv, ExtractedTableData } from '@/lib/pdf/pdfToExcel';
import { downloadBlob } from '@/lib/utils/download';
import {
  FileSpreadsheet,
  Download,
  FileText,
  AlertCircle,
  Table as TableIcon,
  RefreshCw,
  Search,
  CheckCircle2,
  Layers,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function PdfToExcelPage() {
  const tool = getToolById('pdf-to-excel')!;
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [tableData, setTableData] = useState<ExtractedTableData | null>(null);
  const [sheetName, setSheetName] = useState('Extracted_PDF_Data');
  const [filterQuery, setFilterQuery] = useState('');
  const [previewPage, setPreviewPage] = useState(1);
  const rowsPerPage = 15;

  const handleExtract = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    setExtractError(null);
    setTableData(null);

    try {
      const data = await extractPdfToTable(files[0].file);
      if (data.rows.length === 0 && data.headers.length === 0) {
        setExtractError(
          'No selectable text elements found in this PDF. If this is a scanned document or photograph, please use our OCR & Text Extractor tool instead.'
        );
      } else {
        setTableData(data);
        const rawName = files[0].file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
        setSheetName(rawName.slice(0, 31) || 'Extracted_Data');
      }
    } catch (err: any) {
      console.error('PDF extraction failed:', err);
      setExtractError(err?.message || 'Failed to read PDF table structure. Please ensure the file is not corrupted or password-protected.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadXlsx = () => {
    if (!tableData) return;
    const blob = exportTableToXlsx(tableData.headers, tableData.rows, sheetName);
    const fileName = `${sheetName || 'extracted_data'}.xlsx`;
    downloadBlob(blob, fileName);
  };

  const handleDownloadCsv = () => {
    if (!tableData) return;
    const blob = exportTableToCsv(tableData.headers, tableData.rows);
    const fileName = `${sheetName || 'extracted_data'}.csv`;
    downloadBlob(blob, fileName);
  };

  const filteredRows = tableData
    ? tableData.rows.filter((row) =>
        row.some((cell) => cell.toLowerCase().includes(filterQuery.toLowerCase()))
      )
    : [];

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const displayedRows = filteredRows.slice((previewPage - 1) * rowsPerPage, previewPage * rowsPerPage);

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
            setTableData(null);
            setExtractError(null);
            setPreviewPage(1);
          }}
          title="Upload PDF document to extract spreadsheet data"
          subtitle="Supports invoices, financial tables, bank statements, and structured forms"
        />

        {files.length > 0 && !tableData && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-medium">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {files[0].file.name}
                </p>
                <p className="text-xs text-slate-500">
                  Ready to scan coordinate grid and extract cell positions
                </p>
              </div>
            </div>

            <button
              onClick={handleExtract}
              disabled={isProcessing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all shadow-sm shadow-blue-500/20 disabled:opacity-60"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Extracting Table Data...
                </>
              ) : (
                <>
                  <TableIcon className="w-4 h-4" />
                  Extract to Excel / CSV
                </>
              )}
            </button>
          </div>
        )}

        {extractError && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 space-y-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                  Notice: No Digital Text Layer Detected
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                  {extractError}
                </p>
              </div>
            </div>
            <div className="pt-2">
              <Link
                href="/ai-tools/ocr"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Go to OCR & Text Extractor Tool <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {tableData && (
          <div className="space-y-6">
            {/* Control & Export Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-medium">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Table Extracted Successfully
                    </h3>
                    <p className="text-xs text-slate-500">
                      {tableData.pageCount} page(s) parsed • {tableData.rows.length} rows • {tableData.headers.length} columns • {tableData.totalCells} cells
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={handleDownloadXlsx}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm shadow-emerald-600/20 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Excel (.xlsx)
                  </button>
                  <button
                    onClick={handleDownloadCsv}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-semibold transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    Download CSV (.csv)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Workbook / Sheet Title
                  </label>
                  <input
                    type="text"
                    value={sheetName}
                    onChange={(e) => setSheetName(e.target.value)}
                    maxLength={31}
                    className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="Sheet title..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Quick Filter Table Rows
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={filterQuery}
                      onChange={(e) => {
                        setFilterQuery(e.target.value);
                        setPreviewPage(1);
                      }}
                      className="w-full text-xs pl-8 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      placeholder="Search text in rows..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Grid Table Preview */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Spreadsheet Preview
                </span>
                <span className="text-xs text-slate-500">
                  Showing {displayedRows.length} of {filteredRows.length} rows (Page {previewPage} of {totalPages})
                </span>
              </div>

              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 sticky top-0 border-b border-slate-200 dark:border-slate-700 z-10">
                    <tr>
                      <th className="p-3 text-slate-400 font-normal w-12 text-center border-r border-slate-200 dark:border-slate-700">
                        #
                      </th>
                      {tableData.headers.map((hdr, idx) => (
                        <th
                          key={idx}
                          className="p-3 font-semibold text-slate-700 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700 whitespace-nowrap min-w-[120px]"
                        >
                          {hdr || `Col ${idx + 1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                    {displayedRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={tableData.headers.length + 1}
                          className="p-8 text-center text-slate-400 text-xs font-sans"
                        >
                          No matching rows found for query &ldquo;{filterQuery}&rdquo;
                        </td>
                      </tr>
                    ) : (
                      displayedRows.map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors"
                        >
                          <td className="p-2.5 text-slate-400 text-center border-r border-slate-100 dark:border-slate-800 select-none text-[11px]">
                            {(previewPage - 1) * rowsPerPage + rIdx + 1}
                          </td>
                          {row.map((cell, cIdx) => (
                            <td
                              key={cIdx}
                              className="p-2.5 text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800 whitespace-nowrap overflow-hidden text-ellipsis max-w-[240px]"
                              title={cell}
                            >
                              {cell || <span className="text-slate-300 dark:text-slate-600 italic">null</span>}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination bar */}
              {totalPages > 1 && (
                <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    disabled={previewPage <= 1}
                    onClick={() => setPreviewPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1 rounded text-xs font-medium border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-slate-500">
                    Page {previewPage} of {totalPages}
                  </span>
                  <button
                    disabled={previewPage >= totalPages}
                    onClick={() => setPreviewPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1 rounded text-xs font-medium border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
