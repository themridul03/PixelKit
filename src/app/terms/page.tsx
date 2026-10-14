import React from 'react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950/60 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm text-slate-500">Last updated: October 2026</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              1. Usage Rights &amp; Acceptable Use
            </h2>
            <p>
              PixelKit is provided as a browser-native web application for personal, educational, and commercial file processing. You are free to edit, convert, and compress images and documents for any lawful purpose.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              2. Technical Limitations &amp; Disclaimers
            </h2>
            <p>
              PixelKit relies on browser execution APIs. While we implement high-fidelity downscaling and standard PDF specifications, results may vary depending on device memory and the complexity of third-party source files. PixelKit is provided on an &quot;as-is&quot; basis without warranty of any kind.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              3. Passport &amp; Identification Photos
            </h2>
            <p>
              Passport and visa photo presets are generated according to published sizing specifications (e.g. US 2x2 in, Schengen 35x45mm). PixelKit does not guarantee official approval by consular or government authorities, as acceptance depends on physical camera lighting, facial expression, and background compliance.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
