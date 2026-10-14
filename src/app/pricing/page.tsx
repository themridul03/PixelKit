import React from 'react';
import Link from 'next/link';
import { Check, Sparkles, ShieldCheck, Cpu, HardDrive, ArrowRight } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950/60 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Transparent SaaS Plans</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
            All core image, PDF, and document tools run directly on your hardware and are 100% free with no hidden paywalls.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {/* Free Tier (Active) */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-blue-500 shadow-xl flex flex-col justify-between space-y-8 relative">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                <span>Active Plan</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Community &amp; Free</h3>
              <p className="text-sm text-slate-500">
                Complete browser-powered editing and conversion tools with zero server limitations.
              </p>

              <div className="pt-4 flex items-baseline gap-1 text-slate-900 dark:text-white">
                <span className="text-4xl font-extrabold">$0</span>
                <span className="text-sm text-slate-500">/ forever</span>
              </div>

              <ul className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Full Image Compressor with quality controls</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Image Resizer with social media presets</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Image to PDF and PDF to Image converters</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Merge, Split, Rotate, and Organize PDF documents</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Tesseract.js Neural OCR Text Extraction</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>100% In-Browser Privacy — Zero File Uploads</span>
                </li>
              </ul>
            </div>

            <Link
              href="/"
              className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm text-center shadow-md shadow-blue-500/20 transition-all"
            >
              Start Using Tools Free
            </Link>
          </div>

          {/* Pro Plan (Roadmap & Future) */}
          <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <span>Future Cloud Expansion</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">PixelKit Pro</h3>
              <p className="text-sm text-slate-500">
                Planned optional infrastructure for high-throughput cloud batch jobs and external models.
              </p>

              <div className="pt-4 flex items-baseline gap-1 text-slate-900 dark:text-white">
                <span className="text-4xl font-extrabold">$9</span>
                <span className="text-sm text-slate-500">/ month (Planned)</span>
              </div>

              <ul className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Everything in Free plan</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Cloud cluster batch conversion for 500+ files</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Hosted LLM document chat and multi-language translation</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Priority background job queues</span>
                </li>
              </ul>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-500">
              Note: Because PixelKit currently operates without an external server or database, no mock credit card forms or fake checkouts are shown.
            </div>
          </div>
        </div>

        {/* Technical Architecture FAQ */}
        <div className="max-w-3xl mx-auto p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 font-bold text-base text-slate-900 dark:text-white">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span>Why is PixelKit Free?</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            PixelKit is engineered with client-side WebAssembly, HTML5 Canvas, and Web Crypto APIs. By processing files directly inside your browser rather than routing gigabytes through expensive cloud servers, we eliminate backend storage and computation overhead. This makes PixelKit faster, completely private, and sustainably free for everyone.
          </p>
        </div>
      </div>
    </div>
  );
}
