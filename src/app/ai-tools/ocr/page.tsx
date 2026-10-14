'use client';

import React, { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { FileDropzone, FileItem } from '@/components/upload/FileDropzone';
import { getToolById } from '@/config/tools';
import { recognizeImageText, OcrResult } from '@/lib/ocr/tesseractOcr';
import { downloadText } from '@/lib/utils/download';
import { ScanText, Copy, Check, Download, Sparkles, RefreshCw, Layers } from 'lucide-react';

export default function OcrPage() {
  const tool = getToolById('ocr')!;
  const [files, setFiles] = useState<FileItem[]>([]);
  const [language, setLanguage] = useState('eng');
  const [progress, setProgress] = useState<number>(0);
  const [progressStatus, setProgressStatus] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleRecognize = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    setProgress(0);
    setProgressStatus('Initializing Tesseract OCR neural engine...');

    try {
      const res = await recognizeImageText(files[0].file, language, (prog, stat) => {
        setProgress(prog);
        setProgressStatus(`Analyzing image characters (${prog}%)...`);
      });

      setOcrResult(res);
      setProgressStatus(null);
    } catch (err: any) {
      alert(`OCR Recognition Error: ${err.message}`);
      setProgressStatus(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    if (ocrResult?.text) {
      navigator.clipboard.writeText(ocrResult.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadTxt = () => {
    if (ocrResult?.text) {
      const baseName = files[0]?.file.name.replace(/\.[^/.]+$/, '') || 'extracted_text';
      downloadText(ocrResult.text, `${baseName}_ocr.txt`);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileDropzone
          acceptedFormats={['image/jpeg', 'image/png', 'image/webp', 'image/bmp']}
          maxFileSizeMB={30}
          multiple={false}
          files={files}
          onFilesChange={(newFiles) => {
            setFiles(newFiles);
            setOcrResult(null);
            setProgress(0);
          }}
          title="Upload image or scan to extract text"
          subtitle="Supports documents, receipts, screenshots, and book pages"
        />

        {files.length > 0 && !ocrResult && (
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Recognition Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-semibold"
                >
                  <option value="eng">English (eng)</option>
                  <option value="spa">Spanish (spa)</option>
                  <option value="fra">French (fra)</option>
                  <option value="deu">German (deu)</option>
                  <option value="ita">Italian (ita)</option>
                  <option value="por">Portuguese (por)</option>
                </select>
              </div>

              <button
                onClick={handleRecognize}
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isProcessing ? 'Recognizing...' : 'Extract Text Now'}</span>
              </button>
            </div>

            {/* Progress Bar */}
            {isProcessing && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
                  <span>{progressStatus || 'Processing...'}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-200 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* OCR Result Box */}
        {ocrResult && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <ScanText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    Extracted Document Text
                  </h4>
                  <p className="text-xs text-slate-500">
                    Engine Confidence: {ocrResult.confidence}%
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                </button>
                <button
                  onClick={handleDownloadTxt}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .TXT</span>
                </button>
                <button
                  onClick={() => {
                    setFiles([]);
                    setOcrResult(null);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                  title="Process Another"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <textarea
              readOnly
              rows={10}
              value={ocrResult.text}
              className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-sm font-sans leading-relaxed text-slate-800 dark:text-slate-200 focus:outline-none"
            />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
