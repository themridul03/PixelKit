'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Layers,
  Search,
  Moon,
  Sun,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  Palette,
  Check
} from 'lucide-react';
import { GlobalSearchModal } from '../search/GlobalSearchModal';

const PALETTES = [
  { id: 'blue', name: 'Electric Blue', color: '#2563eb', bgClass: 'bg-blue-600' },
  { id: 'violet', name: 'Cyber Violet', color: '#7c3aed', bgClass: 'bg-purple-600' },
  { id: 'emerald', name: 'Emerald Mint', color: '#059669', bgClass: 'bg-emerald-600' },
  { id: 'sunset', name: 'Sunset Amber', color: '#ea580c', bgClass: 'bg-orange-600' }
] as const;

type PaletteId = (typeof PALETTES)[number]['id'];

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentPalette, setCurrentPalette] = useState<PaletteId>('blue');
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [showProModal, setShowProModal] = useState(false);

  const themeMenuRef = useRef<HTMLDivElement>(null);

  // Initialize theme and palette from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('pixelkit_dark_mode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldDark = savedTheme ? savedTheme === 'true' : prefersDark;

    setIsDarkMode(shouldDark);
    if (shouldDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const savedPalette = (localStorage.getItem('pixelkit_palette') as PaletteId) || 'blue';
    setCurrentPalette(savedPalette);
    if (savedPalette === 'blue') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', savedPalette);
    }
  }, []);

  // Close theme menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    localStorage.setItem('pixelkit_dark_mode', String(nextDark));
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const selectPalette = (paletteId: PaletteId) => {
    setCurrentPalette(paletteId);
    localStorage.setItem('pixelkit_palette', paletteId);
    if (paletteId === 'blue') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', paletteId);
    }
    setIsThemeMenuOpen(false);
  };

  const navLinks = [
    { label: 'Image Tools', href: '/image-tools' },
    { label: 'PDF Tools', href: '/pdf-tools' },
    { label: 'AI Tools', href: '/ai-tools' },
    { label: 'Document Tools', href: '/document-tools' },
    { label: 'Design Tools', href: '/design-tools' },
    { label: 'All Tools', href: '/all-tools' },
    { label: 'Pricing', href: '/pricing' }
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-200 border-b ${
          isScrolled
            ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-xs border-slate-200 dark:border-slate-800'
            : 'bg-white dark:bg-slate-900 border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                PixelKit
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                  v1.0
                </span>
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                All-in-one workspace
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href) && link.href !== '/';
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 dark:bg-slate-800 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:border-blue-400 text-sm font-medium transition-all"
              title="Search tools (Ctrl+K)"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span className="hidden md:inline">Search tools...</span>
              <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 rounded border border-slate-300 dark:border-slate-600">
                ⌘K
              </kbd>
            </button>

            {/* Theme & Palette Switcher Dropdown */}
            <div className="relative" ref={themeMenuRef}>
              <button
                onClick={() => setIsThemeMenuOpen((prev) => !prev)}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                title="Change color theme & accents"
                aria-label="Theme settings"
              >
                <Palette className="w-4 h-4 text-blue-500" />
              </button>

              {isThemeMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-3 z-50 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Color Theme
                    </span>
                    <button
                      onClick={toggleDarkMode}
                      className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
                      <span>{isDarkMode ? 'Dark' : 'Light'}</span>
                    </button>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                      Accent Color
                    </span>
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      {PALETTES.map((p) => {
                        const isSelected = currentPalette === p.id;
                        return (
                          <button
                            key={p.id}
                            onClick={() => selectPalette(p.id)}
                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span className={`w-3 h-3 rounded-full ${p.bgClass}`} />
                            <span className="truncate">{p.name.split(' ')[0]}</span>
                            {isSelected && <Check className="w-3 h-3 ml-auto text-blue-600 dark:text-blue-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Dark Mode Direct Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle dark mode"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Pro Badge */}
            <button
              onClick={() => setShowProModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold shadow-xs hover:opacity-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Pro Plan</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Open menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 mt-2">
              <span className="text-xs text-slate-500">Color Palette</span>
              <div className="flex items-center gap-1.5">
                {PALETTES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => selectPalette(p.id)}
                    className={`w-6 h-6 rounded-full ${p.bgClass} flex items-center justify-center`}
                    title={p.name}
                  >
                    {currentPalette === p.id && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setShowProModal(true);
                }}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>PixelKit Pro Details</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      {isSearchOpen && <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />}

      {/* Pro Details Modal */}
      {showProModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
            <button
              onClick={() => setShowProModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">PixelKit Pro Architecture</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
              PixelKit is designed with a 100% browser-first processing engine. In the initial version, all core tools are completely free to use locally on your device with zero server tracking.
            </p>
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-2 mb-5">
              <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Transparent SaaS Architecture</span>
              </div>
              <p>
                Future planned Pro capabilities include cloud batch concurrency and advanced AI assistants. Since the application currently runs fully client-side, no fake payments or mock subscriptions are enforced.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/pricing"
                onClick={() => setShowProModal(false)}
                className="flex-1 text-center py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors"
              >
                View Pricing Comparison
              </Link>
              <button
                onClick={() => setShowProModal(false)}
                className="py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
