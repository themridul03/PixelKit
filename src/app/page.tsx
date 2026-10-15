'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileArchive,
  Maximize2,
  Crop,
  RefreshCw,
  FileImage,
  Image as ImageIcon,
  Layers,
  Scissors,
  Grid,
  Minimize2,
  Edit3,
  ScanText,
  UserCheck,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Zap,
  Lock,
  Search,
  CheckCircle2,
  HelpCircle,
  FileText,
  Palette,
  Hash,
  ChevronDown
} from 'lucide-react';
import { TOOLS, CATEGORIES } from '@/config/tools';
import { AdBanner } from '@/components/ads/AdBanner';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const filteredTools = TOOLS.filter((tool) => {
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      tool.name.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q) ||
      tool.tags.some((t) => t.toLowerCase().includes(q));
    return matchesCategory && matchesQuery;
  });

  const popularTools = TOOLS.filter((t) => t.isPopular);

  const iconMap: Record<string, any> = {
    FileArchive,
    Maximize2,
    Crop,
    RefreshCw,
    UserCheck,
    Stamp: Layers,
    Sliders: Edit3,
    QrCode: Sparkles,
    FileImage,
    Image: ImageIcon,
    Layers,
    Scissors,
    Grid,
    FileCheck: ShieldCheck,
    Edit3,
    Minimize2,
    ScanText,
    Sparkles,
    FileText,
    Palette,
    Hash
  };

  const faqs = [
    {
      q: 'Are my uploaded files sent to any remote server?',
      a: 'Never. PixelKit is built with a browser-first architecture. All image compression, resizing, PDF merging, and OCR execution happen directly in your device’s memory via HTML5 Canvas, Web Crypto, and WebAssembly.'
    },
    {
      q: 'Is there a file size limit or daily quota?',
      a: 'Because PixelKit runs client-side on your own device, there are no artificial daily quotas or usage caps. You can process as many images and documents as your computer’s RAM supports.'
    },
    {
      q: 'Does compressing images degrade print quality?',
      a: 'PixelKit allows you to configure exact quality sliders (from 10% to 95%). You can keep full original pixel dimensions while removing redundant metadata and optimizing color quantization tables.'
    },
    {
      q: 'How does the in-browser OCR work?',
      a: 'We bundle Tesseract.js compiled to WebAssembly. The neural character recognition models run inside dedicated Web Workers in your browser, keeping your scanned documents, receipts, and sensitive files 100% private.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950/60 text-slate-900 dark:text-slate-100 selection:bg-blue-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent dark:from-blue-950/20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-700 dark:text-blue-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PixelKit 1.0 — Free Client-Side Utilities</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
            Edit Images &amp; PDFs in{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              Seconds
            </span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Compress, convert, edit, and enhance your images and documents with powerful online tools. 100% private and processed locally in your browser.
          </p>

          {/* Global Search Bar */}
          <div className="max-w-2xl mx-auto pt-2">
            <div className="relative flex items-center shadow-lg shadow-blue-500/5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
              <Search className="w-5 h-5 text-slate-400 absolute left-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools: 'compress jpg', 'image to pdf', 'ocr', 'passport'..."
                className="w-full pl-12 pr-4 py-3.5 bg-transparent rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none text-sm sm:text-base"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mr-4 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick tool pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-slate-500">
              <span className="font-semibold text-slate-600 dark:text-slate-400">Quick Access:</span>
              <Link
                href="/pdf-tools/pdf-editor"
                className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 font-bold transition-colors flex items-center gap-1 shadow-xs"
              >
                <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span>PDF Editor</span>
              </Link>
              <Link
                href="/image-tools/image-compressor"
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
              >
                Image Compressor
              </Link>
              <Link
                href="/pdf-tools/image-to-pdf"
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
              >
                Image to PDF
              </Link>
              <Link
                href="/pdf-tools/merge-pdf"
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
              >
                Merge PDF
              </Link>
              <Link
                href="/ai-tools/ocr"
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
              >
                OCR Extractor
              </Link>
              <Link
                href="/image-tools/passport-photo-maker"
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
              >
                Passport Maker
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Tools Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Most Popular Tools
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Every tool is fully interactive and runs 100% in your browser.
            </p>
          </div>
          <Link
            href="/all-tools"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 group"
          >
            <span>View All {TOOLS.length} Tools</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Popular Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {popularTools.map((t) => {
            const IconComponent = iconMap[t.iconName] || Sparkles;
            return (
              <Link
                key={t.id}
                href={t.route}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xs">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {t.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {t.tagline}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between mt-4">
                  <span className="text-[11px] font-semibold text-slate-400 capitalize">
                    {t.category}
                  </span>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Use Tool</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Homepage Leaderboard Monetization Slot */}
        <div className="pt-8">
          <AdBanner format="leaderboard" />
        </div>
      </section>

      {/* Category Tabs & Explorer */}
      <section className="bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Explore by Category
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Filter and launch utilities by specialization
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeCategory === cat.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTools.slice(0, 9).map((t) => {
              const IconComponent = iconMap[t.iconName] || Sparkles;
              return (
                <Link
                  key={t.id}
                  href={t.route}
                  className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 hover:border-blue-400 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 text-blue-600 flex items-center justify-center shadow-xs">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {t.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {t.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between mt-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {t.category}
                    </span>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Launch</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why PixelKit Features Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Why Professionals Choose PixelKit
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Engineered from the ground up for privacy, speed, and zero software installation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              100% In-Browser Privacy
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Your files never leave your computer. Everything executes directly inside your browser’s local memory using WebAssembly and HTML5 Canvas.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              Instant Hardware Acceleration
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              No waiting for server uploads or download queues. Image compression and PDF conversions happen with immediate GPU and multi-thread acceleration.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              One Unified Workspace
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              No need to switch between dozens of clunky converter sites with intrusive popups. Every image, PDF, and text tool lives under one clean interface.
            </p>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Clear answers on how PixelKit processes your files
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left p-5 flex items-center justify-between font-bold text-sm text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
