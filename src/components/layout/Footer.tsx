import React from 'react';
import Link from 'next/link';
import { Layers, ShieldCheck, Cpu, HardDrive } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-xs">
                <Layers className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl text-slate-900 dark:text-white">PixelKit</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-sm text-slate-500 dark:text-slate-400">
              Every Tool You Need. One Simple Workspace. Fast, private, browser-powered image editing, PDF manipulation, and document utilities.
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>100% Client-Side Processing — Zero Server File Uploads</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <Cpu className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Powered by HTML5 Canvas, WebAssembly & Web Crypto</span>
              </div>
            </div>
          </div>

          {/* Image Tools */}
          <div>
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">Image Tools</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/image-tools/image-compressor" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Image Compressor
                </Link>
              </li>
              <li>
                <Link href="/image-tools/image-resizer" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Image Resizer
                </Link>
              </li>
              <li>
                <Link href="/image-tools/image-cropper" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Image Cropper
                </Link>
              </li>
              <li>
                <Link href="/image-tools/image-converter" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Image Converter
                </Link>
              </li>
              <li>
                <Link href="/image-tools/passport-photo-maker" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Passport Photo Maker
                </Link>
              </li>
              <li>
                <Link href="/image-tools/image-editor" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Full Image Editor
                </Link>
              </li>
            </ul>
          </div>

          {/* PDF Tools */}
          <div>
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">PDF Tools</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/pdf-tools/image-to-pdf" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Image to PDF
                </Link>
              </li>
              <li>
                <Link href="/pdf-tools/pdf-to-image" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  PDF to Image
                </Link>
              </li>
              <li>
                <Link href="/pdf-tools/merge-pdf" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Merge PDF
                </Link>
              </li>
              <li>
                <Link href="/pdf-tools/split-pdf" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Split PDF
                </Link>
              </li>
              <li>
                <Link href="/pdf-tools/organize-pdf" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Organize & Rotate PDF
                </Link>
              </li>
              <li>
                <Link href="/pdf-tools/pdf-editor" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  PDF Annotator
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Legal */}
          <div>
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/ai-tools/ocr" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  OCR Text Extractor
                </Link>
              </li>
              <li>
                <Link href="/document-tools" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Document Utilities
                </Link>
              </li>
              <li>
                <Link href="/design-tools" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Design & CSS Suite
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Pricing Overview
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} PixelKit. All rights reserved. Open web architecture.</p>
          <p className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-slate-400" />
            <span>Files remain private inside your device. No cloud transmission.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
