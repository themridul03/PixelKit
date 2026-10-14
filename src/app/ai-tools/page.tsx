import React from 'react';
import Link from 'next/link';
import { getToolsByCategory } from '@/config/tools';
import { ArrowRight, Sparkles, Cpu, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';

export default function AiToolsCategoryPage() {
  const tools = getToolsByCategory('ai');

  const advancedPlannedFeatures = [
    {
      title: 'AI Background Remover',
      description: 'Segment foreground subjects and produce transparent PNGs via client-side WebAssembly models.',
      status: 'Requires Local Model Download (~40 MB)',
      badge: 'Local WebAssembly'
    },
    {
      title: 'Chat with PDF',
      description: 'Conversational question answering and citations over uploaded documents using local embeddings.',
      status: 'In Architecture Review',
      badge: 'Local Vector Store'
    },
    {
      title: 'AI Image Upscaler',
      description: 'Super-resolution neural model enhancement for low-resolution photographs.',
      status: 'Local WebGL/WebGPU Required',
      badge: 'WebGPU Pipeline'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950/60 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Intelligent &amp; Smart Utilities</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Client-Side Intelligent Tools
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Fast, zero-cost intelligence running directly in your web browser. No external API keys or subscription fees required for core character recognition and document text extraction.
          </p>
        </div>

        {/* Implemented Tools Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>Currently Functional in Browser</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {tools.map((t) => (
              <Link
                key={t.id}
                href={t.route}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xs">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Ready to Use
                      </span>
                    </div>
                    <h3 className="font-bold text-xl text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {t.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {t.description}
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between mt-6">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                    100% In-Browser
                  </span>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Open Tool</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Transparent Modular AI Roadmap */}
        <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <span>Advanced Local AI Model Roadmap</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Transparent architecture: PixelKit clearly discloses requirements before downloading local models or connecting optional providers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {advancedPlannedFeatures.map((feat, i) => (
              <div
                key={i}
                className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {feat.badge}
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {feat.description}
                </p>
                <div className="pt-2 text-[11px] font-medium text-slate-400">
                  {feat.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
