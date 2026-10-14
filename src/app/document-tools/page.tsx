'use client';

import React, { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/config/tools';
import { computeTextStatistics } from '@/lib/document/textStats';
import {
  toUpperCase,
  toLowerCase,
  toTitleCase,
  toCamelCase,
  toSnakeCase,
  toKebabCase,
  removeDuplicateLines,
  sortLines
} from '@/lib/document/textTransform';
import { computeLineDiff, DiffLine } from '@/lib/document/textDiff';
import { formatJson, minifyJson } from '@/lib/document/jsonTools';
import {
  FileText,
  Type,
  GitCompare,
  Code2,
  Copy,
  Check,
  Clock,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export default function DocumentToolsPage() {
  const tool = getToolById('document-tools')!;
  const [activeTab, setActiveTab] = useState<'counter' | 'case' | 'diff' | 'json' | 'markdown'>('counter');

  // 1. Counter State
  const [counterText, setCounterText] = useState(
    'PixelKit is an all-in-one web platform providing image processing, PDF tools, document utilities, and local intelligence directly inside modern web browsers.'
  );
  const stats = computeTextStatistics(counterText);

  // 2. Case Converter State
  const [caseInput, setCaseInput] = useState('welcome to pixelkit developer workspace');

  // 3. Diff State
  const [diffOrig, setDiffOrig] = useState("PixelKit image compressor\nFast processing\nServer storage");
  const [diffMod, setDiffMod] = useState("PixelKit image compressor\nUltra-fast client processing\nZero server storage");
  const [diffLines, setDiffLines] = useState<DiffLine[]>([]);

  // 4. JSON State
  const [jsonInput, setJsonInput] = useState('{"name":"pixelkit","tools":15,"private":true}');
  const [jsonOutput, setJsonOutput] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  // 5. Markdown State
  const [mdInput, setMdInput] = useState(
    '# PixelKit Workspace\n\n- Fast image compression\n- Client-side PDF manipulation\n- **100% Private**'
  );

  const [copied, setCopied] = useState<string | null>(null);
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleRunDiff = () => {
    const res = computeLineDiff(diffOrig, diffMod);
    setDiffLines(res);
  };

  const handleJsonFormat = (indent: number = 2) => {
    setJsonError(null);
    const res = formatJson(jsonInput, indent);
    if (res.success && res.formattedText) {
      setJsonOutput(res.formattedText);
    } else {
      setJsonError(res.errorMessage || 'Invalid JSON syntax');
    }
  };

  const handleJsonMinify = () => {
    setJsonError(null);
    const res = minifyJson(jsonInput);
    if (res.success && res.formattedText) {
      setJsonOutput(res.formattedText);
    } else {
      setJsonError(res.errorMessage || 'Invalid JSON syntax');
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {/* Sub-tool Tabs */}
        <div className="flex flex-wrap rounded-2xl bg-slate-100 dark:bg-slate-800 p-1.5 gap-1">
          <button
            onClick={() => setActiveTab('counter')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'counter'
                ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Word Counter</span>
          </button>
          <button
            onClick={() => setActiveTab('case')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'case'
                ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Case Converter</span>
          </button>
          <button
            onClick={() => setActiveTab('diff')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'diff'
                ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <GitCompare className="w-4 h-4" />
            <span>Text Diff Checker</span>
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'json'
                ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>JSON Formatter</span>
          </button>
        </div>

        {/* 1. Word Counter Tab */}
        {activeTab === 'counter' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 font-semibold uppercase">Words</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {stats.words}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 font-semibold uppercase">Characters</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {stats.characters}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 font-semibold uppercase">Sentences</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {stats.sentences}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 font-semibold uppercase">Reading Time</span>
                <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                  ~{stats.readingTimeMinutes} min
                </p>
              </div>
            </div>

            <textarea
              rows={8}
              value={counterText}
              onChange={(e) => setCounterText(e.target.value)}
              placeholder="Type or paste your content here..."
              className="w-full p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm leading-relaxed text-slate-900 dark:text-white"
            />
          </div>
        )}

        {/* 2. Text Case Converter Tab */}
        {activeTab === 'case' && (
          <div className="space-y-6">
            <textarea
              rows={6}
              value={caseInput}
              onChange={(e) => setCaseInput(e.target.value)}
              placeholder="Type or paste text to transform..."
              className="w-full p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
            />

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCaseInput(toUpperCase(caseInput))}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-blue-600 hover:text-white transition-colors"
              >
                UPPERCASE
              </button>
              <button
                onClick={() => setCaseInput(toLowerCase(caseInput))}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-blue-600 hover:text-white transition-colors"
              >
                lowercase
              </button>
              <button
                onClick={() => setCaseInput(toTitleCase(caseInput))}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-blue-600 hover:text-white transition-colors"
              >
                Title Case
              </button>
              <button
                onClick={() => setCaseInput(toCamelCase(caseInput))}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-blue-600 hover:text-white transition-colors"
              >
                camelCase
              </button>
              <button
                onClick={() => setCaseInput(toSnakeCase(caseInput))}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-blue-600 hover:text-white transition-colors"
              >
                snake_case
              </button>
              <button
                onClick={() => setCaseInput(toKebabCase(caseInput))}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-blue-600 hover:text-white transition-colors"
              >
                kebab-case
              </button>
              <button
                onClick={() => setCaseInput(removeDuplicateLines(caseInput))}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-blue-600 hover:text-white transition-colors"
              >
                Remove Duplicate Lines
              </button>
              <button
                onClick={() => setCaseInput(sortLines(caseInput, true))}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-blue-600 hover:text-white transition-colors"
              >
                Sort A → Z
              </button>
            </div>
          </div>
        )}

        {/* 3. Text Diff Checker Tab */}
        {activeTab === 'diff' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Original Text</label>
                <textarea
                  rows={6}
                  value={diffOrig}
                  onChange={(e) => setDiffOrig(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Modified Text</label>
                <textarea
                  rows={6}
                  value={diffMod}
                  onChange={(e) => setDiffMod(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleRunDiff}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
              >
                <GitCompare className="w-4 h-4" />
                <span>Compare Differences</span>
              </button>
            </div>

            {diffLines.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto space-y-1">
                {diffLines.map((line, idx) => (
                  <div
                    key={idx}
                    className={`px-2 py-0.5 rounded ${
                      line.type === 'added'
                        ? 'bg-emerald-950/80 text-emerald-300'
                        : line.type === 'removed'
                        ? 'bg-rose-950/80 text-rose-300'
                        : 'text-slate-400'
                    }`}
                  >
                    <span className="w-6 inline-block opacity-40">
                      {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                    </span>
                    <span>{line.content}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. JSON Formatter & Validator Tab */}
        {activeTab === 'json' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase">Raw JSON Input</label>
                <textarea
                  rows={10}
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleJsonFormat(2)}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                  >
                    Format (2 Spaces)
                  </button>
                  <button
                    onClick={() => handleJsonFormat(4)}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Format (4 Spaces)
                  </button>
                  <button
                    onClick={handleJsonMinify}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Minify
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Formatted Result</label>
                  {jsonOutput && (
                    <button
                      onClick={() => handleCopy(jsonOutput, 'json')}
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      {copied === 'json' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied === 'json' ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>
                {jsonError ? (
                  <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 text-xs font-mono border border-rose-200">
                    {jsonError}
                  </div>
                ) : (
                  <textarea
                    readOnly
                    rows={10}
                    value={jsonOutput}
                    placeholder="Click Format to view beautified output..."
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200"
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
