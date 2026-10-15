'use client';

import React, { useEffect, useState } from 'react';
import {
  ExternalLink,
  ShieldCheck,
  Star,
  Info,
  Sparkles,
  Server,
  Lock,
  Palette,
  FileCheck2,
  CheckCircle2
} from 'lucide-react';

interface AdBannerProps {
  slot?: string;
  format?: 'auto' | 'rectangle' | 'leaderboard' | 'horizontal';
  className?: string;
}

const SPONSORED_ADS = [
  {
    id: 'hostinger',
    brand: 'Hostinger Cloud',
    category: 'Web Hosting & Domains',
    rating: '4.9',
    badge: 'Limited Offer',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    title: 'Deploy High-Speed Cloud Hosting with Free SSL & Domain',
    description: 'Up to 75% off managed hosting. 99.9% uptime guarantee with 24/7 priority customer support.',
    priceText: 'From $2.49/mo',
    ctaText: 'Claim 75% Deal',
    ctaUrl: 'https://www.hostinger.com',
    icon: Server,
    iconBg: 'from-indigo-600 to-purple-600'
  },
  {
    id: 'nordvpn',
    brand: 'NordVPN Security',
    category: 'Privacy & Cybersecurity',
    rating: '4.8',
    badge: 'Verified Partner',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    title: 'Protect Your Online Privacy with Military-Grade Encryption',
    description: 'Ultra-fast global servers, malware protection, and strict zero-logs policy. 30-day money-back guarantee.',
    priceText: 'Save 68% Today',
    ctaText: 'Get Protected',
    ctaUrl: 'https://nordvpn.com',
    icon: Lock,
    iconBg: 'from-blue-600 to-cyan-600'
  },
  {
    id: 'canva',
    brand: 'Canva Pro Design Suite',
    category: 'Graphic Design & AI',
    rating: '4.9',
    badge: 'Popular Choice',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
    title: 'Create Professional Visuals, Social Posts & Presentations',
    description: 'Access 100M+ premium photos, templates, videos, and one-click AI background removal tools.',
    priceText: 'Free 30-Day Trial',
    ctaText: 'Start Free Trial',
    ctaUrl: 'https://www.canva.com',
    icon: Palette,
    iconBg: 'from-fuchsia-600 to-pink-600'
  },
  {
    id: 'grammarly',
    brand: 'Grammarly AI Writing',
    category: 'AI Document Assistant',
    rating: '4.8',
    badge: 'Editor Pick',
    badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
    title: 'Write Clear, Error-Free Documents & Emails in Seconds',
    description: 'Instant grammar checking, tone suggestion, and AI rewriting. Works across web browsers & apps.',
    priceText: '100% Free to Use',
    ctaText: 'Install Free Extension',
    ctaUrl: 'https://www.grammarly.com',
    icon: FileCheck2,
    iconBg: 'from-emerald-600 to-teal-600'
  }
];

export function AdBanner({
  slot = '1234567890',
  format = 'horizontal',
  className = ''
}: AdBannerProps) {
  const [adIndex, setAdIndex] = useState(0);
  const [hasAdSense, setHasAdSense] = useState(false);
  const [adSenseError, setAdSenseError] = useState(false);

  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  // Rotate sponsored ads or initialize Google AdSense
  useEffect(() => {
    // Pick a deterministic yet rotating ad per mount
    const randomIdx = Math.floor(Math.random() * SPONSORED_ADS.length);
    setAdIndex(randomIdx);

    if (adsenseClientId && typeof window !== 'undefined') {
      try {
        if ((window as any).adsbygoogle) {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
          setHasAdSense(true);
        }
      } catch (err) {
        console.warn('AdSense push notice:', err);
        setAdSenseError(true);
      }
    }
  }, [adsenseClientId]);

  const ad = SPONSORED_ADS[adIndex];
  const IconComponent = ad.icon;

  // Format styles
  const formatClasses = {
    leaderboard: 'min-h-[96px] max-w-[850px] mx-auto',
    rectangle: 'min-h-[250px] max-w-[340px] mx-auto',
    horizontal: 'min-h-[88px] w-full',
    auto: 'min-h-[90px] w-full'
  }[format];

  return (
    <div className={`my-6 select-none ${className}`}>
      {/* Official Google & IAB Compliant Disclosure Label */}
      <div className="flex items-center justify-between text-[10px] uppercase font-semibold tracking-wider text-slate-400 dark:text-slate-500 mb-1 px-1">
        <div className="flex items-center gap-1.5">
          <span className="px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-[9px] font-bold text-slate-600 dark:text-slate-400">
            Ad
          </span>
          <span>Sponsored Advertisement</span>
        </div>
        <div className="flex items-center gap-1 text-[9px] lowercase opacity-80">
          <span>Ads by Google &amp; Certified Partners</span>
          <Info className="w-2.5 h-2.5" />
        </div>
      </div>

      {/* Main Ad Card Container */}
      <div
        className={`relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-white via-slate-50/80 to-blue-50/20 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-850 p-4 shadow-sm hover:border-blue-400/50 dark:hover:border-blue-500/50 transition-all ${formatClasses}`}
      >
        {/* If live Google AdSense client ID is active and not errored */}
        {adsenseClientId && !adSenseError ? (
          <div className="w-full flex items-center justify-center">
            <ins
              className="adsbygoogle"
              style={{ display: 'block', width: '100%', textAlign: 'center' }}
              data-ad-client={adsenseClientId}
              data-ad-slot={slot}
              data-ad-format={format === 'rectangle' ? 'rectangle' : 'auto'}
              data-full-width-responsive="true"
            />
          </div>
        ) : (
          /* Live Commercial Display Ad Creative */
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left: Brand Icon & Copy */}
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${ad.iconBg} text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/10`}
              >
                <IconComponent className="w-6 h-6" />
              </div>

              <div className="space-y-1 min-w-0 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    {ad.brand}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${ad.badgeColor}`}>
                    {ad.badge}
                  </span>
                  <div className="flex items-center gap-0.5 text-amber-500 text-[11px] font-bold">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{ad.rating}</span>
                  </div>
                </div>

                <p className="font-semibold text-xs text-slate-800 dark:text-slate-200 leading-snug line-clamp-1">
                  {ad.title}
                </p>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                  {ad.description}
                </p>
              </div>
            </div>

            {/* Right: Pricing & CTA Button */}
            <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-between md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
              <div className="text-right hidden sm:block">
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider">
                  Sponsored Deal
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {ad.priceText}
                </span>
              </div>

              <a
                href={ad.ctaUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 shrink-0"
              >
                <span>{ad.ctaText}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
