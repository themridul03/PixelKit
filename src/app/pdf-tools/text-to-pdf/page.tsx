'use client';

import React, { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/config/tools';
import { convertTextToPdf, TextToPdfOptions } from '@/lib/document/textToPdf';
import { downloadBlob } from '@/lib/utils/download';
import {
  FileText,
  Download,
  Settings,
  Sparkles,
  FileCheck,
  Eye,
  RefreshCw,
  Upload,
  BookOpen,
  CheckCircle2
} from 'lucide-react';

const SAMPLE_NOTES = `# Quantum Computing Fundamentals: Lecture 04
Prof. E. Vance • Department of Physics & Computing

## 1. Introduction to Superposition
Unlike classical bits that are strictly binary (0 or 1), a quantum bit or qubit can exist in a linear combination of states:
|ψ⟩ = α|0⟩ + β|1⟩

Where α and β are complex probability amplitudes satisfying:
|α|² + |β|² = 1

When a measurement occurs, the qubit collapses irrevocably to one of the basis states with probabilities given by the Born rule.

## 2. Quantum Entanglement & Bell States
Entanglement occurs when two or more particles interact in such a way that the quantum state of each particle cannot be described independently of the state of the others.
- Bell state |Φ+⟩ = (|00⟩ + |11⟩) / √2
- Enables superdense coding and quantum teleportation protocols.

## 3. Quantum Gate Operations
Basic single-qubit unitary operations:
- Pauli-X (NOT gate): flips |0⟩ to |1⟩ and vice versa.
- Hadamard (H gate): creates an equal superposition from standard basis states.
- Phase Shift (Z gate): introduces a π phase difference.

Key Takeaway for Exam: Review circuit diagrams for Shor's and Grover's search algorithms.`;

export default function TextToPdfPage() {
  const tool = getToolById('text-to-pdf')!;
  const [text, setText] = useState<string>(SAMPLE_NOTES);
  const [title, setTitle] = useState<string>('Lecture Notes & Study Summary');
  const [pageSize, setPageSize] = useState<'a4' | 'letter'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [fontSize, setFontSize] = useState<number>(11);
  const [lineSpacing, setLineSpacing] = useState<number>(1.4);
  const [margin, setMargin] = useState<number>(50);
  const [showPageNumbers, setShowPageNumbers] = useState<boolean>(true);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [lastGenerated, setLastGenerated] = useState<{
    url: string;
    blob: Blob;
    pageCount: number;
    size: number;
  } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setText(content);
      const rawName = file.name.replace(/\.[^/.]+$/, '');
      setTitle(rawName);
    };
    reader.readAsText(file);
  };

  const handleGeneratePdf = async () => {
    if (!text.trim()) {
      alert('Please enter or upload some text to convert into a PDF.');
      return;
    }

    setIsGenerating(true);
    try {
      const options: TextToPdfOptions = {
        title: title.trim() || undefined,
        fontSize,
        pageSize,
        orientation,
        lineSpacing,
        margin,
        showPageNumbers
      };

      const result = await convertTextToPdf(text, options);
      const url = URL.createObjectURL(result.blob);
      setLastGenerated({
        url,
        blob: result.blob,
        pageCount: result.pageCount,
        size: result.size
      });
    } catch (err: any) {
      console.error('Text to PDF generation error:', err);
      alert(`Error generating PDF: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!lastGenerated) return;
    const cleanTitle = (title || 'document').replace(/[^a-zA-Z0-9_-]/g, '_');
    downloadBlob(lastGenerated.blob, `${cleanTitle}.pdf`);
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {/* Top Controls & File Upload Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              Upload .txt or .md file
              <input
                type="file"
                accept=".txt,.md,text/plain,text/markdown"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <button
              onClick={() => setText(SAMPLE_NOTES)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs text-slate-600 dark:text-slate-400 font-medium transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              Load Sample Notes
            </button>
            <button
              onClick={() => setText('')}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs text-slate-500 font-medium transition-colors"
            >
              Clear
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>{wordCount.toLocaleString()} words</span>
            <span>•</span>
            <span>{charCount.toLocaleString()} chars</span>
          </div>
        </div>

        {/* Main Grid: Editor & Options */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Text Input Area */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Document Header Title (Optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Chapter 4 Summary or Meeting Minutes"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Content & Notes Editor
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Use <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">#</code> and <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">##</code> for bold headings
                  </span>
                </div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type, paste, or draft your text here..."
                  rows={18}
                  className="w-full font-mono text-xs p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed resize-y"
                />
              </div>
            </div>
          </div>

          {/* Right Col: PDF Layout Settings & Action */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Settings className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Page & Layout Controls
                </h3>
              </div>

              {/* Page Format */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Page Dimensions
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPageSize('a4')}
                    className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                      pageSize === 'a4'
                        ? 'bg-blue-50 border-blue-600 text-blue-700 dark:bg-blue-950/50 dark:border-blue-500 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    A4 (210 × 297mm)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPageSize('letter')}
                    className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                      pageSize === 'letter'
                        ? 'bg-blue-50 border-blue-600 text-blue-700 dark:bg-blue-950/50 dark:border-blue-500 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    US Letter
                  </button>
                </div>
              </div>

              {/* Orientation */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Orientation
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrientation('portrait')}
                    className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                      orientation === 'portrait'
                        ? 'bg-blue-50 border-blue-600 text-blue-700 dark:bg-blue-950/50 dark:border-blue-500 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Portrait
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrientation('landscape')}
                    className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                      orientation === 'landscape'
                        ? 'bg-blue-50 border-blue-600 text-blue-700 dark:bg-blue-950/50 dark:border-blue-500 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Landscape
                  </button>
                </div>
              </div>

              {/* Font Size */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Font Size</span>
                  <span className="text-slate-500">{fontSize} pt</span>
                </div>
                <input
                  type="range"
                  min={9}
                  max={16}
                  step={1}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              {/* Line Spacing */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Line Spacing</span>
                  <span className="text-slate-500">{lineSpacing}x</span>
                </div>
                <input
                  type="range"
                  min={1.2}
                  max={2.0}
                  step={0.1}
                  value={lineSpacing}
                  onChange={(e) => setLineSpacing(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              {/* Margins */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Page Margins</span>
                  <span className="text-slate-500">{margin} pt</span>
                </div>
                <input
                  type="range"
                  min={25}
                  max={75}
                  step={5}
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              {/* Page Numbers */}
              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPageNumbers}
                    onChange={(e) => setShowPageNumbers(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Show &ldquo;Page X of Y&rdquo; footer numbers</span>
                </label>
              </div>

              {/* Action Button */}
              <button
                onClick={handleGeneratePdf}
                disabled={isGenerating || !text.trim()}
                className="w-full mt-3 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Formatting & Rendering PDF...
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    Generate PDF
                  </>
                )}
              </button>
            </div>

            {/* Result Box */}
            {lastGenerated && (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                      PDF Document Ready!
                    </h4>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                      {lastGenerated.pageCount} page(s) • {(lastGenerated.size / 1024).toFixed(1)} KB
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
                    href={lastGenerated.url}
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
      </div>
    </ToolLayout>
  );
}
