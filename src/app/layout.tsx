import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1
};

export const metadata: Metadata = {
  title: 'PixelKit — All-In-One Image, PDF, Document & AI Tools Workspace',
  description:
    'Every tool you need. One simple workspace. Compress, convert, edit, and manipulate images, PDFs, OCR, and documents with 100% in-browser privacy and speed.',
  keywords: [
    'image compressor',
    'image to pdf',
    'pdf to image',
    'merge pdf',
    'split pdf',
    'passport photo maker',
    'ocr text extraction',
    'resize image',
    'crop image',
    'convert jpg to png',
    'online document tools'
  ],
  authors: [{ name: 'PixelKit Engineering' }]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50/60 dark:bg-slate-950/60 text-slate-900 dark:text-slate-100 antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
