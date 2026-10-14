import React from 'react';
import { ShieldCheck, HardDrive, Cpu, Lock } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950/60 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero Server Transmission</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Privacy Policy &amp; Security Principles
          </h1>
          <p className="text-sm text-slate-500">Last updated: October 2026</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-blue-500" />
              <span>1. Client-Side Processing Architecture</span>
            </h2>
            <p>
              Unlike traditional SaaS document converters that upload your files to remote servers, PixelKit runs directly inside your web browser. All image compression, resizing, PDF merging, page extraction, and character recognition are computed locally in your computer&apos;s memory via HTML5 Canvas, Mozilla PDF.js, and WebAssembly.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-500" />
              <span>2. No File Storage or Transmission</span>
            </h2>
            <p>
              Your documents, photographs, IDs, contracts, and scans are never sent over the Internet, never stored on any database, and never used to train machine learning models. As soon as you close or refresh your browser tab, all temporary object memory buffers are immediately purged by the browser.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-500" />
              <span>3. External AI Model Disclosures</span>
            </h2>
            <p>
              PixelKit currently provides client-side OCR using Tesseract.js WebAssembly and local extractive sentence summarization. If future features require external LLM endpoints or larger localized weights, users will receive explicit pre-execution disclosures before any network connection or download is initiated.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
