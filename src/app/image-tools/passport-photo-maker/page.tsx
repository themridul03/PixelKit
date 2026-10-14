'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { FileDropzone, FileItem } from '@/components/upload/FileDropzone';
import { DownloadBar, DownloadItem } from '@/components/download/DownloadBar';
import { getToolById } from '@/config/tools';
import { PASSPORT_PRESETS, generatePassportPhoto, PassportPreset } from '@/lib/image/passportPhoto';
import { loadImage } from '@/lib/image/imageCore';
import { UserCheck, Sparkles, Printer, Info } from 'lucide-react';

export default function PassportPhotoMakerPage() {
  const tool = getToolById('passport-photo-maker')!;
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<PassportPreset>(PASSPORT_PRESETS[0]);
  const [generateSheet, setGenerateSheet] = useState(true);
  const [copiesCount, setCopiesCount] = useState(6);
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, width: 600, height: 600 });
  const [imageMeta, setImageMeta] = useState<{ width: number; height: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadItems, setDownloadItems] = useState<DownloadItem[]>([]);
  const previewRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (files.length > 0) {
      loadImage(files[0].file).then((img) => {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        setImageMeta({ width: w, height: h });
        const boxSize = Math.round(Math.min(w, h) * 0.7);
        setCropBox({
          x: Math.round((w - boxSize) / 2),
          y: Math.round((h - boxSize) / 4), // place head guide near top
          width: boxSize,
          height: boxSize
        });
      });
    }
  }, [files]);

  // Draw biometric portrait guide
  useEffect(() => {
    if (!files.length || !imageMeta || !previewRef.current) return;
    const canvas = previewRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    loadImage(files[0].file).then((img) => {
      canvas.width = Math.min(500, imageMeta.width);
      const scale = canvas.width / imageMeta.width;
      canvas.height = imageMeta.height * scale;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Dim outside
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Crop box clear
      const sx = cropBox.x * scale;
      const sy = cropBox.y * scale;
      const sw = cropBox.width * scale;
      const sh = cropBox.height * scale;

      ctx.clearRect(sx, sy, sw, sh);
      ctx.drawImage(img, cropBox.x, cropBox.y, cropBox.width, cropBox.height, sx, sy, sw, sh);

      // Biometric Head Oval Guide
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(sx + sw / 2, sy + sh * 0.42, sw * 0.28, sh * 0.35, 0, 0, 2 * Math.PI);
      ctx.stroke();

      // Eye line guide
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(sx + sw * 0.2, sy + sh * 0.4);
      ctx.lineTo(sx + sw * 0.8, sy + sh * 0.4);
      ctx.stroke();
      ctx.setLineDash([]);

      // Outer border
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.strokeRect(sx, sy, sw, sh);
    });
  }, [files, imageMeta, cropBox]);

  const handleGenerate = async () => {
    if (!files.length) return;
    setIsProcessing(true);

    try {
      const res = await generatePassportPhoto(files[0].file, {
        preset: selectedPreset,
        cropRect: cropBox,
        generatePrintSheet: generateSheet,
        copiesCount: copiesCount
      });

      const items: DownloadItem[] = [
        {
          name: res.filename,
          blob: res.singleBlob,
          originalSize: files[0].file.size
        }
      ];

      if (res.sheetBlob) {
        items.push({
          name: res.filename.replace('.jpg', '_printable_4x6_sheet.jpg'),
          blob: res.sheetBlob,
          originalSize: files[0].file.size
        });
      }

      setDownloadItems(items);
    } catch (err: any) {
      alert(`Error generating passport photo: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileDropzone
          acceptedFormats={['image/jpeg', 'image/png', 'image/webp']}
          maxFileSizeMB={30}
          multiple={false}
          files={files}
          onFilesChange={(newFiles) => {
            setFiles(newFiles);
            setDownloadItems([]);
          }}
          title="Upload headshot portrait photo"
          subtitle="Looking straight into the camera with neutral expression"
        />

        {files.length > 0 && imageMeta && downloadItems.length === 0 && (
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-6">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-base">
              <UserCheck className="w-5 h-5 text-blue-600" />
              <span>Select Passport &amp; Visa Specifications</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {PASSPORT_PRESETS.map((preset) => {
                const isSelected = selectedPreset.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedPreset(preset)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <p className="font-bold text-sm text-slate-900 dark:text-white">
                      {preset.country}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                      {preset.widthMm} × {preset.heightMm} mm ({preset.pixelWidth}×{preset.pixelHeight} px)
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      {preset.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Print Sheet Options */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Printer className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                <div>
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                    4x6 Inch Printable Sheet
                  </h4>
                  <p className="text-xs text-slate-500">
                    Arrange multiple photos with cut lines to print at home or any photo kiosk.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generateSheet}
                    onChange={(e) => setGenerateSheet(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span>Generate Printable Sheet</span>
                </label>
                {generateSheet && (
                  <select
                    value={copiesCount}
                    onChange={(e) => setCopiesCount(Number(e.target.value))}
                    className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-600 text-xs bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                  >
                    <option value={2}>2 Copies</option>
                    <option value={4}>4 Copies</option>
                    <option value={6}>6 Copies</option>
                  </select>
                )}
              </div>
            </div>

            {/* Biometric alignment canvas */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <canvas
                ref={previewRef}
                className="max-w-full rounded-lg shadow-sm border border-slate-300 dark:border-slate-700"
              />
              <div className="flex items-center gap-2 mt-3 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <Info className="w-4 h-4" />
                <span>Align head inside the green oval and eyes along the dashed line.</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleGenerate}
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isProcessing ? 'Generating...' : 'Generate Passport Photo'}</span>
              </button>
            </div>
          </div>
        )}

        <DownloadBar
          items={downloadItems}
          onReset={() => {
            setFiles([]);
            setDownloadItems([]);
          }}
          successTitle="Passport Photos Ready to Download!"
        />
      </div>
    </ToolLayout>
  );
}
