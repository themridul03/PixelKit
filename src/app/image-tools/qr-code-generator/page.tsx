'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/config/tools';
import { QrCode } from '@/lib/image/qrCode';
import { downloadBlob, downloadText } from '@/lib/utils/download';
import { canvasToBlob } from '@/lib/image/imageCore';
import { QrCode as QrIcon, Link, Wifi, FileText, Download, Copy, Check } from 'lucide-react';

export default function QrCodeGeneratorPage() {
  const tool = getToolById('qr-code-generator')!;
  const [activeTab, setActiveTab] = useState<'url' | 'text' | 'wifi'>('url');

  // Input states
  const [url, setUrl] = useState('https://pixelkit.dev');
  const [text, setText] = useState('Hello from PixelKit!');
  const [wifiSsid, setWifiSsid] = useState('MyOfficeWiFi');
  const [wifiPassword, setWifiPassword] = useState('SecurePass123');
  const [wifiSecurity, setWifiSecurity] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');

  // Styling
  const [fgColor, setFgColor] = useState('#0f172a');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [ecc, setEcc] = useState<'L' | 'M' | 'Q' | 'H'>('M');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrSvg, setQrSvg] = useState<string>('');
  const [copiedText, setCopiedText] = useState(false);

  // Compute payload
  const computePayload = (): string => {
    if (activeTab === 'url') return url.trim();
    if (activeTab === 'text') return text;
    if (activeTab === 'wifi') {
      return `WIFI:S:${wifiSsid};T:${wifiSecurity};P:${wifiPassword};;`;
    }
    return '';
  };

  useEffect(() => {
    const payload = computePayload();
    if (!payload) return;

    try {
      const qr = QrCode.encodeText(payload, ecc);
      const canvas = qr.toCanvas(10, 4, fgColor, bgColor);
      const svg = qr.toSvg(4, fgColor, bgColor);
      setQrSvg(svg);

      if (canvasRef.current) {
        const dest = canvasRef.current;
        dest.width = canvas.width;
        dest.height = canvas.height;
        const ctx = dest.getContext('2d');
        ctx?.drawImage(canvas, 0, 0);
      }
    } catch (e) {
      console.error(e);
    }
  }, [activeTab, url, text, wifiSsid, wifiPassword, wifiSecurity, fgColor, bgColor, ecc]);

  const handleDownloadPng = async () => {
    if (!canvasRef.current) return;
    const blob = await canvasToBlob(canvasRef.current, 'image/png');
    downloadBlob(blob, 'pixelkit-qr-code.png');
  };

  const handleDownloadSvg = () => {
    if (!qrSvg) return;
    downloadText(qrSvg, 'pixelkit-qr-code.svg', 'image/svg+xml;charset=utf-8');
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls & Inputs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Type selector */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
              <button
                onClick={() => setActiveTab('url')}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                  activeTab === 'url' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Link className="w-4 h-4" />
                <span>Website URL</span>
              </button>
              <button
                onClick={() => setActiveTab('text')}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                  activeTab === 'text' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Plain Text</span>
              </button>
              <button
                onClick={() => setActiveTab('wifi')}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                  activeTab === 'wifi' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Wifi className="w-4 h-4" />
                <span>Wi-Fi Network</span>
              </button>
            </div>

            {/* Inputs based on active tab */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-4">
              {activeTab === 'url' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white"
                  />
                </div>
              )}

              {activeTab === 'text' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Text Content
                  </label>
                  <textarea
                    rows={4}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  />
                </div>
              )}

              {activeTab === 'wifi' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Network Name (SSID)
                    </label>
                    <input
                      type="text"
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <input
                      type="text"
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Color styling */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Foreground Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border"
                    />
                    <input
                      type="text"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-24 px-2 py-1 text-xs font-mono rounded-lg border"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border"
                    />
                    <input
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-24 px-2 py-1 text-xs font-mono rounded-lg border"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code Realtime Preview & Downloads */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200">
              <canvas ref={canvasRef} className="max-w-[240px] max-h-[240px]" />
            </div>

            <div className="w-full space-y-2 pt-2">
              <button
                onClick={handleDownloadPng}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download High-Res PNG</span>
              </button>

              <button
                onClick={handleDownloadSvg}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-100 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Vector SVG</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
