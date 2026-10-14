'use client';

import React, { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/config/tools';
import { summarizeTextLocally, TextSummaryResult } from '@/lib/ai/localTextSummary';
import { computeTextStatistics } from '@/lib/document/textStats';
import { Sparkles, Clock, BookOpen, Key, Copy, Check } from 'lucide-react';

export default function TextSummarizerPage() {
  const tool = getToolById('pdf-summarizer')!;
  const [inputText, setInputText] = useState(
    `PixelKit provides a comprehensive browser-based image and PDF toolkit designed for high productivity, privacy, and speed. Users can convert JPG to PNG, compress images up to 90%, merge multiple PDFs, extract pages, and execute OCR directly on their local machines. Because all operations run inside WebAssembly and HTML5 Canvas, zero user files are ever uploaded or transmitted to external servers. This architecture guarantees complete client confidentiality for contracts, medical documents, and personal photographs. Furthermore, the application is packaged in a single modern Next.js repository with an integrated design system and instant responsive feedback.`
  );
  const [sentenceCount, setSentenceCount] = useState<number>(3);
  const [summaryResult, setSummaryResult] = useState<TextSummaryResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSummarize = () => {
    if (!inputText.trim()) return;
    const res = summarizeTextLocally(inputText, sentenceCount);
    setSummaryResult(res);
  };

  const stats = computeTextStatistics(inputText);

  const copySummary = () => {
    if (summaryResult?.summary) {
      navigator.clipboard.writeText(summaryResult.summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input text panel */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Source Document Text
              </label>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>{stats.words} words</span>
                <span>•</span>
                <span>{stats.characters} chars</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span>~{stats.readingTimeMinutes} min read</span>
                </span>
              </div>
            </div>

            <textarea
              rows={12}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste or type document text here to extract key takeaways..."
              className="w-full p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Target Sentences:
                </span>
                <select
                  value={sentenceCount}
                  onChange={(e) => setSentenceCount(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-semibold"
                >
                  <option value={2}>2 Sentences (Brief)</option>
                  <option value={3}>3 Sentences (Balanced)</option>
                  <option value={5}>5 Sentences (Detailed)</option>
                </select>
              </div>

              <button
                onClick={handleSummarize}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Summarize Locally</span>
              </button>
            </div>
          </div>

          {/* Results side panel */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-base">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span>Executive Summary</span>
              </div>
              {summaryResult && (
                <button
                  onClick={copySummary}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            {summaryResult ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm leading-relaxed text-slate-800 dark:text-slate-200 shadow-xs">
                  {summaryResult.summary}
                </div>

                {/* Key Bullet Points */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Key Highlights
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    {summaryResult.keyPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Keywords */}
                {summaryResult.topKeywords.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <Key className="w-3.5 h-3.5" />
                      <span>Frequent Terms</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {summaryResult.topKeywords.map((kw, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[11px] font-medium"
                        >
                          {kw.word} ({kw.count})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                Click &quot;Summarize Locally&quot; to generate an instant extractive summary.
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
