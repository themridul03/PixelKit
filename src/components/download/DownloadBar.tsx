'use client';

import React from 'react';
import { Download, RefreshCw, CheckCircle2, Archive, ArrowRight } from 'lucide-react';
import { formatBytes, calculateReduction } from '@/lib/utils/format';
import { downloadBlob, downloadZip } from '@/lib/utils/download';
import { AdBanner } from '@/components/ads/AdBanner';

export interface DownloadItem {
  name: string;
  blob: Blob;
  originalSize?: number;
}

interface DownloadBarProps {
  items: DownloadItem[];
  zipName?: string;
  onReset?: () => void;
  successTitle?: string;
}

export function DownloadBar({
  items,
  zipName = 'pixelkit-export.zip',
  onReset,
  successTitle = 'Processing Complete!'
}: DownloadBarProps) {
  if (items.length === 0) return null;

  const totalOrigSize = items.reduce((acc, item) => acc + (item.originalSize || item.blob.size), 0);
  const totalNewSize = items.reduce((acc, item) => acc + item.blob.size, 0);
  const reduction = calculateReduction(totalOrigSize, totalNewSize);

  const handleDownloadSingle = (item: DownloadItem) => {
    downloadBlob(item.blob, item.name);
  };

  const handleDownloadAllZip = async () => {
    await downloadZip(items, zipName);
  };

  return (
    <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/20 p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base">
              {successTitle}
            </h4>
            <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-slate-600 dark:text-slate-400">
              <span>{items.length} {items.length === 1 ? 'file ready' : 'files ready'}</span>
              <span>•</span>
              <span>Final size: <strong className="text-slate-900 dark:text-white">{formatBytes(totalNewSize)}</strong></span>
              {reduction.isReduced && reduction.percentage > 0 && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px]">
                    Saved {reduction.percentage}% ({formatBytes(reduction.savedBytes)})
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {items.length === 1 ? (
            <button
              onClick={() => handleDownloadSingle(items[0])}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download File</span>
            </button>
          ) : (
            <button
              onClick={handleDownloadAllZip}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Archive className="w-4 h-4" />
              <span>Download All as ZIP</span>
            </button>
          )}

          {onReset && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Process Another</span>
            </button>
          )}
        </div>
      </div>

      {/* Multiple items list */}
      {items.length > 1 && (
        <div className="pt-3 border-t border-emerald-200/60 dark:border-emerald-900/40 divide-y divide-emerald-100 dark:divide-emerald-900/30">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 text-xs">
              <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-xs">
                {item.name} ({formatBytes(item.blob.size)})
              </span>
              <button
                onClick={() => handleDownloadSingle(item)}
                className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
              >
                <span>Download</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Post-Download Monetization Slot */}
      <div className="pt-2">
        <AdBanner format="horizontal" />
      </div>
    </div>
  );
}
