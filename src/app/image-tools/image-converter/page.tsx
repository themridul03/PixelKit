'use client';

import React, { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { FileDropzone, FileItem } from '@/components/upload/FileDropzone';
import { DownloadBar, DownloadItem } from '@/components/download/DownloadBar';
import { getToolById } from '@/config/tools';
import { convertImage, TargetImageFormat } from '@/lib/image/convertImage';
import { RefreshCw, Sparkles, Copy, Check } from 'lucide-react';

export default function ImageConverterPage() {
  const tool = getToolById('image-converter')!;
  const [files, setFiles] = useState<FileItem[]>([]);
  const [targetFormat, setTargetFormat] = useState<TargetImageFormat>('image/png');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadItems, setDownloadItems] = useState<DownloadItem[]>([]);
  const [base64Output, setBase64Output] = useState<string | null>(null);
  const [copiedBase64, setCopiedBase64] = useState(false);

  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setBase64Output(null);

    try {
      const results: DownloadItem[] = [];
      for (const item of files) {
        const res = await convertImage(item.file, {
          targetFormat,
          backgroundColor: bgColor
        });

        if (res.base64Data) {
          setBase64Output(res.base64Data);
          results.push({
            name: res.outputFilename,
            blob: new Blob([res.base64Data], { type: 'text/plain' }),
            originalSize: item.file.size
          });
        } else if (res.blob) {
          results.push({
            name: res.outputFilename,
            blob: res.blob,
            originalSize: item.file.size
          });
        }
      }
      setDownloadItems(results);
    } catch (err: any) {
      alert(`Error converting images: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyBase64 = () => {
    if (base64Output) {
      navigator.clipboard.writeText(base64Output);
      setCopiedBase64(true);
      setTimeout(() => setCopiedBase64(false), 2000);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileDropzone
          acceptedFormats={['image/jpeg', 'image/png', 'image/webp', 'image/bmp']}
          maxFileSizeMB={50}
          multiple={true}
          files={files}
          onFilesChange={(newFiles) => {
            setFiles(newFiles);
            setDownloadItems([]);
            setBase64Output(null);
          }}
          title="Upload images to convert"
          subtitle="Supports JPG, PNG, WebP, and BMP"
        />

        {files.length > 0 && downloadItems.length === 0 && (
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-6">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-base">
              <RefreshCw className="w-5 h-5 text-blue-600" />
              <span>Conversion Target</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Target Format
                </label>
                <select
                  value={targetFormat}
                  onChange={(e) => setTargetFormat(e.target.value as TargetImageFormat)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="image/png">PNG (Portable Network Graphics - Supports Alpha)</option>
                  <option value="image/jpeg">JPEG / JPG (Compressed photo standard)</option>
                  <option value="image/webp">WebP (Modern web format, highly optimized)</option>
                  <option value="base64">Base64 Data URL (For CSS &amp; Web developers)</option>
                </select>
              </div>

              {targetFormat === 'image/jpeg' && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Background Color Fill (For transparent PNGs)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-slate-300"
                    />
                    <input
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-28 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-mono text-slate-900 dark:text-white"
                    />
                    <span className="text-xs text-slate-500">Default: White</span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleConvert}
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isProcessing ? 'Converting...' : `Convert ${files.length} ${files.length === 1 ? 'Image' : 'Images'}`}</span>
              </button>
            </div>
          </div>
        )}

        {/* Base64 preview & copy */}
        {base64Output && (
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Generated Base64 String
              </span>
              <button
                onClick={copyBase64}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
              >
                {copiedBase64 ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedBase64 ? 'Copied!' : 'Copy Base64'}</span>
              </button>
            </div>
            <textarea
              readOnly
              rows={4}
              value={base64Output}
              className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300"
            />
          </div>
        )}

        <DownloadBar
          items={downloadItems}
          zipName="pixelkit-converted-images.zip"
          onReset={() => {
            setFiles([]);
            setDownloadItems([]);
            setBase64Output(null);
          }}
          successTitle="Images Converted Successfully!"
        />
      </div>
    </ToolLayout>
  );
}
