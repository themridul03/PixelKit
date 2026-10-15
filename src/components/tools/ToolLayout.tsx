'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  ShieldCheck,
  Cpu,
  HelpCircle,
  BookOpen,
  Sparkles,
  ArrowRight,
  Layers,
  ChevronDown
} from 'lucide-react';
import { ToolDefinition } from '@/types/tools';
import { TOOLS } from '@/config/tools';
import { AdBanner } from '@/components/ads/AdBanner';

interface ToolLayoutProps {
  tool: ToolDefinition;
  children: React.ReactNode;
}

export function ToolLayout({ tool, children }: ToolLayoutProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const relatedTools = (tool.relatedToolIds || [])
    .map((id) => TOOLS.find((t) => t.id === id))
    .filter(Boolean) as ToolDefinition[];

  const categoryNameMap: Record<string, string> = {
    image: 'Image Tools',
    pdf: 'PDF Tools',
    ai: 'AI & Smart Tools',
    document: 'Document Tools',
    design: 'Design Tools',
    file: 'File Utilities'
  };

  const categoryUrlMap: Record<string, string> = {
    image: '/image-tools',
    pdf: '/pdf-tools',
    ai: '/ai-tools',
    document: '/document-tools',
    design: '/design-tools',
    file: '/file-tools'
  };

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950/60 py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link
            href={categoryUrlMap[tool.category] || '/all-tools'}
            className="hover:text-blue-600 dark:hover:text-blue-400 capitalize"
          >
            {categoryNameMap[tool.category] || tool.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 dark:text-white font-semibold">{tool.name}</span>
        </nav>

        {/* Tool Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                <Cpu className="w-3 h-3" />
                <span>Client-Side Engine</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                <ShieldCheck className="w-3 h-3" />
                <span>100% Private</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {tool.name}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              {tool.description}
            </p>
          </div>
        </div>

        {/* Main Interactive Tool Workspace */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
          {children}
        </div>

        {/* High-Earning Monetization / Ad Slot */}
        <AdBanner format="horizontal" />

        {/* How it works & Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
              <BookOpen className="w-4 h-4" />
              <span>Features &amp; Capabilities</span>
            </div>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
              {tool.features.map((feat, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>Privacy &amp; Processing Guarantee</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Your files never leave your computer. All processing for this tool occurs directly within your browser&apos;s memory via WebAssembly and Canvas APIs. No files are uploaded to our servers.
            </p>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
              Supported file inputs: {tool.acceptedFormats.length ? tool.acceptedFormats.join(', ') : 'Direct input'} (Up to {tool.maxFileSizeMB} MB)
            </div>
          </div>
        </div>

        {/* FAQs Section */}
        {tool.faqs.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-white">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <span>Frequently Asked Questions</span>
            </div>

            <div className="space-y-3">
              {tool.faqs.map((faq, index) => {
                const isOpen = activeFaq === index;
                return (
                  <div
                    key={index}
                    className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : index)}
                      className="w-full text-left px-5 py-4 flex items-center justify-between font-semibold text-sm text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 text-sm text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/60 pt-3">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Related Tools */}
        {relatedTools.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Related Tools
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedTools.map((rel) => (
                <Link
                  key={rel.id}
                  href={rel.route}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">
                        {rel.category}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {rel.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                      {rel.tagline}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
