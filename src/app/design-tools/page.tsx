'use client';

import React, { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/config/tools';
import { hexToRgb, rgbToHex, rgbToHsl } from '@/lib/design/colorTools';
import { generateFaviconPackage } from '@/lib/design/faviconGenerator';
import { downloadBlob } from '@/lib/utils/download';
import {
  Palette,
  Layers,
  Sparkles,
  Copy,
  Check,
  Download,
  Image as ImageIcon
} from 'lucide-react';

export default function DesignToolsPage() {
  const tool = getToolById('design-tools')!;
  const [activeTab, setActiveTab] = useState<'color' | 'gradient' | 'shadow' | 'favicon'>('color');

  // 1. Color converter
  const [hexColor, setHexColor] = useState('#3b82f6');
  const rgb = hexToRgb(hexColor) || { r: 59, g: 130, b: 246 };
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // 2. Gradient generator
  const [color1, setColor1] = useState('#3b82f6');
  const [color2, setColor2] = useState('#8b5cf6');
  const [angle, setAngle] = useState(135);

  // 3. Shadow generator
  const [shadowX, setShadowX] = useState(0);
  const [shadowY, setShadowY] = useState(10);
  const [shadowBlur, setShadowBlur] = useState(25);
  const [shadowSpread, setShadowSpread] = useState(-5);
  const [shadowColor, setShadowColor] = useState('rgba(0, 0, 0, 0.15)');

  // 4. Favicon generator
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [isGeneratingFavicon, setIsGeneratingFavicon] = useState(false);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const gradientCss = `background: linear-gradient(${angle}deg, ${color1}, ${color2});`;
  const shadowCss = `box-shadow: ${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px ${shadowColor};`;

  const handleCreateFaviconZip = async () => {
    if (!faviconFile) return;
    setIsGeneratingFavicon(true);
    try {
      const zipBlob = await generateFaviconPackage(faviconFile);
      downloadBlob(zipBlob, 'pixelkit-favicon-package.zip');
    } catch (err: any) {
      alert(`Error generating favicon package: ${err.message}`);
    } finally {
      setIsGeneratingFavicon(false);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap rounded-2xl bg-slate-100 dark:bg-slate-800 p-1.5 gap-1">
          <button
            onClick={() => setActiveTab('color')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'color' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Color Converter</span>
          </button>
          <button
            onClick={() => setActiveTab('gradient')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'gradient' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>CSS Gradient</span>
          </button>
          <button
            onClick={() => setActiveTab('shadow')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'shadow' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>CSS Box Shadow</span>
          </button>
          <button
            onClick={() => setActiveTab('favicon')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'favicon' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Favicon Package Maker</span>
          </button>
        </div>

        {/* 1. Color Converter */}
        {activeTab === 'color' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Pick or Type HEX Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={hexColor}
                      onChange={(e) => setHexColor(e.target.value)}
                      className="w-12 h-12 rounded-xl border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={hexColor}
                      onChange={(e) => setHexColor(e.target.value)}
                      className="w-36 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-base font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">RGB Code</span>
                      <p className="font-mono text-xs font-semibold">
                        rgb({rgb.r}, {rgb.g}, {rgb.b})
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, 'rgb')}
                      className="text-xs text-blue-600 font-semibold"
                    >
                      {copiedKey === 'rgb' ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">HSL Code</span>
                      <p className="font-mono text-xs font-semibold">
                        hsl({hsl.h}, {hsl.s}%, {hsl.l}%)
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, 'hsl')}
                      className="text-xs text-blue-600 font-semibold"
                    >
                      {copiedKey === 'hsl' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Preview Card */}
              <div
                style={{ backgroundColor: hexColor }}
                className="h-48 rounded-3xl shadow-lg border border-black/10 flex items-center justify-center transition-colors"
              >
                <span className="px-4 py-2 rounded-xl bg-white/90 backdrop-blur-xs font-mono font-bold text-sm text-slate-900 shadow-md">
                  {hexColor.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 2. Gradient Generator */}
        {activeTab === 'gradient' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Color Stop 1
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={color1}
                        onChange={(e) => setColor1(e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={color1}
                        onChange={(e) => setColor1(e.target.value)}
                        className="w-24 px-2 py-1.5 text-xs font-mono rounded-lg border"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Color Stop 2
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={color2}
                        onChange={(e) => setColor2(e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={color2}
                        onChange={(e) => setColor2(e.target.value)}
                        className="w-24 px-2 py-1.5 text-xs font-mono rounded-lg border"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>Angle</span>
                    <span>{angle}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={angle}
                    onChange={(e) => setAngle(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs flex items-center justify-between">
                  <code className="truncate max-w-xs">{gradientCss}</code>
                  <button
                    onClick={() => handleCopy(gradientCss, 'gradient')}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 shrink-0 ml-2 font-semibold"
                  >
                    {copiedKey === 'gradient' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'gradient' ? 'Copied' : 'Copy CSS'}</span>
                  </button>
                </div>
              </div>

              {/* Gradient Preview */}
              <div
                style={{ background: `linear-gradient(${angle}deg, ${color1}, ${color2})` }}
                className="h-56 rounded-3xl shadow-md border border-black/10 flex items-center justify-center"
              >
                <span className="px-4 py-2 rounded-xl bg-white/90 backdrop-blur-xs font-bold text-xs text-slate-900 shadow-md">
                  Live CSS Gradient
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 3. Box Shadow Generator */}
        {activeTab === 'shadow' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Y Offset</span>
                    <span>{shadowY}px</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={shadowY}
                    onChange={(e) => setShadowY(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Blur Radius</span>
                    <span>{shadowBlur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={shadowBlur}
                    onChange={(e) => setShadowBlur(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Spread</span>
                    <span>{shadowSpread}px</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={shadowSpread}
                    onChange={(e) => setShadowSpread(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs flex items-center justify-between">
                  <code className="truncate max-w-xs">{shadowCss}</code>
                  <button
                    onClick={() => handleCopy(shadowCss, 'shadow')}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 shrink-0 ml-2 font-semibold"
                  >
                    {copiedKey === 'shadow' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'shadow' ? 'Copied' : 'Copy CSS'}</span>
                  </button>
                </div>
              </div>

              {/* Shadow Preview Box */}
              <div className="p-12 bg-slate-100 dark:bg-slate-900/60 rounded-3xl flex items-center justify-center">
                <div
                  style={{
                    boxShadow: `${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px ${shadowColor}`
                  }}
                  className="w-48 h-32 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300 transition-shadow"
                >
                  Shadow Preview Card
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Favicon Generator */}
        {activeTab === 'favicon' && (
          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-4">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Generate Complete Favicon Package
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Produces standard 16x16, 32x32, 48x48, 180x180 (Apple Touch Icon), 512x512 icons, plus <code className="text-blue-600">site.webmanifest</code> packaged into a ready-to-use ZIP.
                </p>
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFaviconFile(e.target.files[0]);
                  }
                }}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              />

              {faviconFile && (
                <div className="pt-2">
                  <button
                    onClick={handleCreateFaviconZip}
                    disabled={isGeneratingFavicon}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isGeneratingFavicon ? 'Generating Icons...' : 'Download Favicon ZIP Package'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
